const fs = require("fs");
const path = require("path");

const rentalLocationService = require("../services/rentalLocationService");

const UPLOAD_DIRECTORY = path.resolve(
    __dirname,
    "../../uploads/locations"
);

const IMAGE_PREFIX = "/uploads/locations/";

const getImagePath = (image) => {
    if (
        typeof image !== "string" ||
        !image.startsWith(IMAGE_PREFIX)
    ) {
        return null;
    }

    const filename = path.basename(image);

    if (filename !== image.slice(IMAGE_PREFIX.length)) {
        return null;
    }

    return path.join(UPLOAD_DIRECTORY, filename);
};

const removeImage = async (image) => {
    const imagePath = getImagePath(image);

    if (!imagePath) return;

    try {
        await fs.promises.unlink(imagePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Gagal menghapus gambar:", error);
        }
    }
};

const cleanupUploadedFile = async (file) => {
    if (!file) return;

    try {
        await fs.promises.unlink(file.path);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Gagal membersihkan gambar baru:", error);
        }
    }
};

const allowedActiveValues = [0, 1, "0", "1", true, false];

const sendSuccess = (res, statusCode, message, data) => {
    const response = { success: true, message };

    if (data !== undefined) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message) =>
    res.status(statusCode).json({ success: false, message });

const handleError = (res, error, label, fallbackMessage) => {
    console.error(`${label}:`, error);

    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : fallbackMessage;

    return sendError(res, statusCode, message);
};

const validId = (id) => /^\d+$/.test(String(id)) && Number(id) > 0;

const hasValue = (value) =>
    value !== undefined && value !== null && value !== "";

const isValidActive = (value) => allowedActiveValues.includes(value);

const validateCoordinate = (value, min, max, label) => {
    if (!hasValue(value)) return null;

    const number = Number(value);

    if (!Number.isFinite(number) || number < min || number > max) {
        return `${label} harus berada antara ${min} dan ${max}.`;
    }

    return null;
};

const validateLocationPayload = (body, { isUpdate = false } = {}) => {
    const { name, address, latitude, longitude, is_active } = body;

    if (isUpdate) {
        const nameInvalid =
            name !== undefined && (typeof name !== "string" || !name.trim());
        const addressInvalid =
            address !== undefined &&
            (typeof address !== "string" || !address.trim());

        if (nameInvalid || addressInvalid) {
            return "Nama dan alamat tidak boleh kosong.";
        }
    } else if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof address !== "string" ||
        !address.trim()
    ) {
        return "Nama dan alamat lokasi wajib diisi.";
    }

    const coordinateError =
        validateCoordinate(latitude, -90, 90, "Latitude") ||
        validateCoordinate(longitude, -180, 180, "Longitude");

    if (coordinateError) return coordinateError;

    if (is_active !== undefined && !isValidActive(is_active)) {
        return "is_active harus berupa 0 atau 1.";
    }

    return null;
};

const buildPayload = (body) => {
    const payload = { ...body };

    if (payload.name !== undefined) payload.name = payload.name.trim();
    if (payload.address !== undefined) payload.address = payload.address.trim();
    if (payload.is_active !== undefined) {
        payload.is_active = Number(payload.is_active);
    }

    return payload;
};

const getAllRentalLocations = async (req, res) => {
    try {
        const filters = {};

        if (req.query.is_active !== undefined) {
            if (!["0", "1"].includes(req.query.is_active)) {
                return sendError(
                    res,
                    400,
                    "Parameter is_active harus 0 atau 1."
                );
            }

            filters.is_active = req.query.is_active;
        }

        const locations = await rentalLocationService.getAllRentalLocations(filters);

        return sendSuccess(
            res,
            200,
            "Daftar lokasi rental berhasil diambil.",
            locations
        );
    } catch (error) {
        return handleError(
            res,
            error,
            "Get all rental locations error",
            "Gagal mengambil daftar lokasi rental."
        );
    }
};

const getRentalLocationById = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return sendError(res, 400, "ID lokasi tidak valid.");
        }

        const location = await rentalLocationService.getRentalLocationById(
            Number(req.params.id)
        );

        if (!location) {
            return sendError(res, 404, "Lokasi rental tidak ditemukan.");
        }

        return sendSuccess(
            res,
            200,
            "Detail lokasi rental berhasil diambil.",
            location
        );
    } catch (error) {
        return handleError(
            res,
            error,
            "Get rental location by id error",
            "Gagal mengambil detail lokasi rental."
        );
    }
};


const createRentalLocation = async (req, res) => {
    try {
        const validationError = validateLocationPayload(req.body);

        if (validationError) {
            await cleanupUploadedFile(req.file);
            return sendError(res, 400, validationError);
        }

        const payload = buildPayload(req.body);

        if (req.file) {
            payload.image = `${IMAGE_PREFIX}${req.file.filename}`;
        }

        const location = await rentalLocationService.createRentalLocation(payload);

        return sendSuccess(
            res,
            201,
            "Lokasi rental berhasil ditambahkan.",
            location
        );
    } catch (error) {
        await cleanupUploadedFile(req.file);

        return handleError(
            res,
            error,
            "Create rental location error",
            "Gagal menambahkan lokasi rental."
        );
    }
};

const updateRentalLocation = async (req, res) => {
    let isUpdated = false;

    try {
        if (!validId(req.params.id)) {
            await cleanupUploadedFile(req.file);
            return sendError(res, 400, "ID lokasi tidak valid.");
        }

        const validationError = validateLocationPayload(req.body, {
            isUpdate: true,
        });

        if (validationError) {
            await cleanupUploadedFile(req.file);
            return sendError(res, 400, validationError);
        }

        const id = Number(req.params.id);

        const existingLocation =
            await rentalLocationService.getRentalLocationById(id);

        if (!existingLocation) {
            await cleanupUploadedFile(req.file);
            return sendError(res, 404, "Lokasi rental tidak ditemukan.");
        }

        const payload = buildPayload(req.body);

        if (req.file) {
            payload.image = `${IMAGE_PREFIX}${req.file.filename}`;
        }

        const location = await rentalLocationService.updateRentalLocation(
            id,
            payload
        );

        isUpdated = true;

        if (req.file && location) {
            await removeImage(existingLocation.image);
        }

        return sendSuccess(
            res,
            200,
            "Lokasi rental berhasil diperbarui.",
            location
        );
    } catch (error) {
        if (!isUpdated) {
            await cleanupUploadedFile(req.file);
        }

        return handleError(
            res,
            error,
            "Update rental location error",
            "Gagal memperbarui lokasi rental."
        );
    }
};

const deleteRentalLocation = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return sendError(res, 400, "ID lokasi tidak valid.");
        }

        const id = Number(req.params.id);

        const existingLocation =
            await rentalLocationService.getRentalLocationById(id);

        if (!existingLocation) {
            return sendError(res, 404, "Lokasi rental tidak ditemukan.");
        }

        const deleted = await rentalLocationService.deleteRentalLocation(id);

        if (!deleted) {
            return sendError(res, 404, "Lokasi rental tidak ditemukan.");
        }

        await removeImage(existingLocation.image);

        return sendSuccess(res, 200, "Lokasi rental berhasil dihapus.");
    } catch (error) {
        return handleError(
            res,
            error,
            "Delete rental location error",
            "Gagal menghapus lokasi rental."
        );
    }
};

const updateRentalLocationStatus = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return sendError(res, 400, "ID lokasi tidak valid.");
        }

        const { is_active } = req.body;

        if (!isValidActive(is_active)) {
            return sendError(res, 400, "is_active harus berupa 0 atau 1.");
        }

        const id = Number(req.params.id);

        const existingLocation = await rentalLocationService.getRentalLocationById(id);

        if (!existingLocation) {
            return sendError(res, 404, "Lokasi rental tidak ditemukan.");
        }

        const location = await rentalLocationService.updateRentalLocationStatus(
            id,
            Number(is_active)
        );

        return sendSuccess(
            res,
            200,
            "Status lokasi rental berhasil diperbarui.",
            location
        );
    } catch (error) {
        return handleError(
            res,
            error,
            "Update rental location status error",
            "Gagal memperbarui status lokasi rental."
        );
    }
};

module.exports = {
    getAllRentalLocations,
    getRentalLocationById,
    createRentalLocation,
    updateRentalLocation,
    updateRentalLocationStatus,
    deleteRentalLocation,
};