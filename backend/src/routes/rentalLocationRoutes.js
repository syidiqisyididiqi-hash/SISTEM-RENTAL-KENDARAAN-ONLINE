
const express = require("express");
const router = express.Router();

const rentalLocationController = require("../controllers/rentalLocationController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const uploadLocation = require("../middleware/uploadLocationMiddleware");

router.get(
    "/",
    authMiddleware,
    rentalLocationController.getAllRentalLocations
);

router.get(
    "/:id",
    authMiddleware,
    rentalLocationController.getRentalLocationById
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    uploadLocation.single("image"),
    rentalLocationController.createRentalLocation
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    uploadLocation.single("image"),
    rentalLocationController.updateRentalLocation
);

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    rentalLocationController.updateRentalLocationStatus
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    rentalLocationController.deleteRentalLocation
);

module.exports = router;