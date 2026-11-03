
const express = require("express");
const router = express.Router();

const rentalGuideController = require("../controllers/rentalGuideController");
const rentalGuideUpload = require("../middleware/rentalGuideUpload");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/active", rentalGuideController.getActive);

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    rentalGuideController.getAll
);

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    rentalGuideController.getById
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    rentalGuideUpload.single("image"),
    rentalGuideController.create
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    rentalGuideUpload.single("image"),
    rentalGuideController.update
);

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    rentalGuideController.updateStatus
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    rentalGuideController.remove
);

module.exports = router;