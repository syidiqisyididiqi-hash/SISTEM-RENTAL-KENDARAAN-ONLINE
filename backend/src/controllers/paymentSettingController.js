const fs = require("fs");
const path = require("path");

const paymentSettingService = require(
    "../services/paymentSettingService"
);

const getPaymentSettings = async (req, res) => {
    try {
        const settings =
            await paymentSettingService.getPaymentSettings();

        if (!settings) {
            return res.status(200).json({
                success: true,
                message: "Pengaturan pembayaran belum tersedia",
                data: null,
            });
        }

        const qrisImageUrl = settings.qris_image
            ? `${req.protocol}://${req.get("host")}/uploads/${settings.qris_image}`
            : null;

        res.status(200).json({
            success: true,
            message: "Pengaturan pembayaran berhasil diambil",
            data: {
                ...settings,
                qris_image_url: qrisImageUrl,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil pengaturan pembayaran",
        });
    }
};

const updateQrisImage = async (req, res) => {
    let uploadedFile = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Gambar QRIS wajib diupload",
            });
        }

        uploadedFile = req.file;

        const existingSettings =
            await paymentSettingService.getPaymentSettings();

        const qrisImage = `qris/${req.file.filename}`;

        const settings =
            await paymentSettingService.updateQrisImage(
                qrisImage
            );

        if (
            existingSettings?.qris_image &&
            existingSettings.qris_image !== qrisImage
        ) {
            const oldFilePath = path.join(
                process.cwd(),
                "uploads",
                existingSettings.qris_image
            );

            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const qrisImageUrl =
            `${req.protocol}://${req.get("host")}/uploads/${settings.qris_image}`;

        res.status(200).json({
            success: true,
            message: existingSettings?.qris_image
                ? "Gambar QRIS berhasil diperbarui"
                : "Gambar QRIS berhasil diupload",
            data: {
                ...settings,
                qris_image_url: qrisImageUrl,
            },
        });
    } catch (error) {
        console.error(error);

        if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }

        res.status(500).json({
            success: false,
            message: "Gagal menyimpan gambar QRIS",
        });
    }
};

const deleteQrisImage = async (req, res) => {
    try {
        const settings =
            await paymentSettingService.getPaymentSettings();

        if (!settings?.qris_image) {
            return res.status(404).json({
                success: false,
                message: "Gambar QRIS tidak ditemukan",
            });
        }

        const filePath = path.join(
            process.cwd(),
            "uploads",
            settings.qris_image
        );

        await paymentSettingService.deleteQrisImage();

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({
            success: true,
            message: "Gambar QRIS berhasil dihapus",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Gagal menghapus gambar QRIS",
        });
    }
};

module.exports = {
    getPaymentSettings,
    updateQrisImage,
    deleteQrisImage,
};