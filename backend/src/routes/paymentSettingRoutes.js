    const express = require("express");

    const {
        getPaymentSettings,
        updateQrisImage,
        deleteQrisImage,
    } = require("../controllers/paymentSettingController");

    const authMiddleware = require("../middleware/authMiddleware");
    const adminMiddleware = require("../middleware/adminMiddleware");
    const uploadQris = require("../middleware/uploadQris");

    const router = express.Router();

    router.get(
        "/",
        authMiddleware,
        getPaymentSettings
    );

    router.put(
        "/qris",
        authMiddleware,
        adminMiddleware,
        uploadQris.single("qris_image"),
        updateQrisImage
    );

    router.delete(
        "/qris",
        authMiddleware,
        adminMiddleware,
        deleteQrisImage
    );

    module.exports = router;