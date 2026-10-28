
const rentalLocationService = require("../services/rentalLocationService");

const validId = (id) =>
    /^\d+$/.test(String(id)) && Number(id) > 0;

const validCoordinates = (data) => {
    if (data.latitude !== undefined && data.latitude !== null && data.latitude !== "") {
        const latitude = Number(data.latitude);
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
            return "Latitude harus berada antara -90 dan 90.";
        }
    }

    if (data.longitude !== undefined && data.longitude !== null && data.longitude !== "") {
        const longitude = Number(data.longitude);
        if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
            return "Longitude harus berada antara -180 dan 180.";
        }
    }

    return null;
};

const getAll = async (req, res) => {
    try {
        const filters = {};

        if (req.query.is_active !== undefined) {
            if (!["0", "1"].includes(req.query.is_active)) {
                return res.status(400).json({
                    success: false,
                    message: "Parameter is_active harus 0 atau 1.",
                });
            }

            filters.is_active = req.query.is_active;
        }

        const locations = await rentalLocationService.getAll(filters);

        return res.status(200).json({
            success: true,
            message: "Daftar lokasi rental berhasil diambil.",
            data: locations,
        });
    } catch (error) {
        console.error("getAll rental locations:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar lokasi rental.",
        });
    }
};

const getById = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID lokasi tidak valid.",
            });
        }

        const location = await rentalLocationService.getById(
            Number(req.params.id)
        );

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Lokasi rental tidak ditemukan.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail lokasi rental berhasil diambil.",
            data: location,
        });
    } catch (error) {
        console.error("getById rental location:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil detail lokasi rental.",
        });
    }
};

const create = async (req, res) => {
    try {
        const { name, address } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof address !== "string" ||
            !address.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Nama dan alamat lokasi wajib diisi.",
            });
        }

        const coordinateError = validCoordinates(req.body);

        if (coordinateError) {
            return res.status(400).json({
                success: false,
                message: coordinateError,
            });
        }

        if (
            req.body.is_active !== undefined &&
            ![0, 1, "0", "1", true, false].includes(req.body.is_active)
        ) {
            return res.status(400).json({
                success: false,
                message: "is_active harus berupa 0 atau 1.",
            });
        }

        const location = await rentalLocationService.create({
            ...req.body,
            name: name.trim(),
            address: address.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Lokasi rental berhasil ditambahkan.",
            data: location,
        });
    } catch (error) {
        console.error("create rental location:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan lokasi rental.",
        });
    }
};

const update = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID lokasi tidak valid.",
            });
        }

        const current = await rentalLocationService.getById(
            Number(req.params.id)
        );

        if (!current) {
            return res.status(404).json({
                success: false,
                message: "Lokasi rental tidak ditemukan.",
            });
        }

        const { name, address } = req.body;

        if (
            (name !== undefined &&
                (typeof name !== "string" || !name.trim())) ||
            (address !== undefined &&
                (typeof address !== "string" || !address.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Nama dan alamat tidak boleh kosong.",
            });
        }

        const coordinateError = validCoordinates(req.body);

        if (coordinateError) {
            return res.status(400).json({
                success: false,
                message: coordinateError,
            });
        }

        if (
            req.body.is_active !== undefined &&
            ![0, 1, "0", "1", true, false].includes(req.body.is_active)
        ) {
            return res.status(400).json({
                success: false,
                message: "is_active harus berupa 0 atau 1.",
            });
        }

        const payload = { ...req.body };

        if (name !== undefined) payload.name = name.trim();
        if (address !== undefined) payload.address = address.trim();

        const location = await rentalLocationService.update(
            Number(req.params.id),
            payload
        );

        return res.status(200).json({
            success: true,
            message: "Lokasi rental berhasil diperbarui.",
            data: location,
        });
    } catch (error) {
        console.error("update rental location:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui lokasi rental.",
        });
    }
};

const remove = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID lokasi tidak valid.",
            });
        }

        const deleted = await rentalLocationService.remove(
            Number(req.params.id)
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Lokasi rental tidak ditemukan.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lokasi rental berhasil dihapus.",
        });
    } catch (error) {
        console.error("remove rental location:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal menghapus lokasi rental.",
        });
    }
};

const updateStatus = async (req, res) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID lokasi tidak valid.",
            });
        }

        const { is_active } = req.body;

        if (![0, 1, "0", "1", true, false].includes(is_active)) {
            return res.status(400).json({
                success: false,
                message: "is_active harus berupa 0 atau 1.",
            });
        }

        const current = await rentalLocationService.getById(
            Number(req.params.id)
        );

        if (!current) {
            return res.status(404).json({
                success: false,
                message: "Lokasi rental tidak ditemukan.",
            });
        }

        const location = await rentalLocationService.updateStatus(
            Number(req.params.id),
            Number(is_active)
        );

        return res.status(200).json({
            success: true,
            message: "Status lokasi rental berhasil diperbarui.",
            data: location,
        });
    } catch (error) {
        console.error("updateStatus rental location:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui status lokasi rental.",
        });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    updateStatus,
};
