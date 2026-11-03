
const rentalGuideService = require("../services/rentalGuideService");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../../uploads/rental-guide");

const deleteImage = (image) => {
    if (!image) return;

    const filename = path.basename(image);
    const imagePath = path.join(uploadDir, filename);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

const getErrorMessage = (error) => {
    if (error.code === "LIMIT_FILE_SIZE") {
        return "Ukuran gambar maksimal 5 MB.";
    }

    return error.message || "Terjadi kesalahan pada server.";
};

const rentalGuideController = {
    getAll: async (req, res) => {
        try {
            const data = await rentalGuideService.getAll();

            return res.status(200).json({
                success: true,
                message: "Data panduan rental berhasil diambil.",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error),
            });
        }
    },

    getActive: async (req, res) => {
        try {
            const data = await rentalGuideService.getActive();

            return res.status(200).json({
                success: true,
                message: "Panduan rental aktif berhasil diambil.",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error),
            });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;

            if (!/^\d+$/.test(id) || Number(id) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "ID panduan tidak valid.",
                });
            }

            const data = await rentalGuideService.getById(id);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Data panduan rental tidak ditemukan.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Detail panduan rental berhasil diambil.",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error),
            });
        }
    },

    create: async (req, res) => {
        try {
            const {
                title,
                description,
                step_order,
                is_active,
            } = req.body;

            if (!title?.trim() || !description?.trim()) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Judul dan deskripsi wajib diisi.",
                });
            }

            if (title.trim().length > 150) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Judul maksimal 150 karakter.",
                });
            }

            const order = Number(step_order ?? 1);
            const active = Number(is_active ?? 1);

            if (!Number.isInteger(order) || order < 1) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Urutan langkah harus berupa angka minimal 1.",
                });
            }

            if (![0, 1].includes(active)) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Status aktif tidak valid.",
                });
            }

            const data = await rentalGuideService.create({
                title: title.trim(),
                description: description.trim(),
                image: req.file
                    ? `/uploads/rental-guide/${req.file.filename}`
                    : null,
                step_order: order,
                is_active: active,
            });

            return res.status(201).json({
                success: true,
                message: "Panduan rental berhasil ditambahkan.",
                data,
            });
        } catch (error) {
            if (req.file) deleteImage(req.file.filename);

            return res.status(500).json({
                success: false,
                message: getErrorMessage(error),
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;

            if (!/^\d+$/.test(id) || Number(id) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "ID panduan tidak valid.",
                });
            }

            const existing = await rentalGuideService.getById(id);

            if (!existing) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(404).json({
                    success: false,
                    message: "Data panduan rental tidak ditemukan.",
                });
            }

            const {
                title,
                description,
                step_order,
                is_active,
            } = req.body;

            if (!title?.trim() || !description?.trim()) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Judul dan deskripsi wajib diisi.",
                });
            }

            if (title.trim().length > 150) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Judul maksimal 150 karakter.",
                });
            }

            const order = Number(step_order);
            const active = Number(is_active);

            if (!Number.isInteger(order) || order < 1) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Urutan langkah harus berupa angka minimal 1.",
                });
            }

            if (![0, 1].includes(active)) {
                if (req.file) deleteImage(req.file.filename);

                return res.status(400).json({
                    success: false,
                    message: "Status aktif tidak valid.",
                });
            }

            const image = req.file
                ? `/uploads/rental-guide/${req.file.filename}`
                : existing.image;

            const data = await rentalGuideService.update(id, {
                title: title.trim(),
                description: description.trim(),
                image,
                step_order: order,
                is_active: active,
            });

            if (req.file && existing.image) {
                deleteImage(existing.image);
            }

            return res.status(200).json({
                success: true,
                message: "Panduan rental berhasil diperbarui.",
                data,
            });
        } catch (error) {
            if (req.file) deleteImage(req.file.filename);

            return res.status(500).json({
                success: false,
                message: getErrorMessage(error),
            });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            if (!/^\d+$/.test(id) || Number(id) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "ID panduan tidak valid.",
                });
            }

            if (![0, 1].includes(Number(is_active))) {
                return res.status(400).json({
                    success: false,
                    message: "Status harus bernilai 0 atau 1.",
                });
            }

            const existing = await rentalGuideService.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: "Data panduan rental tidak ditemukan.",
                });
            }

            const data = await rentalGuideService.updateStatus(
                id,
                Number(is_active)
            );

            return res.status(200).json({
                success: true,
                message: "Status panduan berhasil diperbarui.",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error),
            });
        }
    },

    remove: async (req, res) => {
        try {
            const { id } = req.params;

            if (!/^\d+$/.test(id) || Number(id) < 1) {
                return res.status(400).json({
                    success: false,
                    message: "ID panduan tidak valid.",
                });
            }

            const existing = await rentalGuideService.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: "Data panduan rental tidak ditemukan.",
                });
            }

            await rentalGuideService.delete(id);

            if (existing.image) {
                deleteImage(existing.image);
            }

            return res.status(200).json({
                success: true,
                message: "Panduan rental berhasil dihapus.",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error),
            });
        }
    },
};

module.exports = rentalGuideController;