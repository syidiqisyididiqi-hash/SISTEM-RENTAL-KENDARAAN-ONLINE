const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
    getAllVehicles,
    getAvailableVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
} = require("../controllers/vehicleController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getAllVehicles);

router.get("/available", getAvailableVehicles);

router.get("/:id", getVehicleById);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    createVehicle
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    updateVehicle
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteVehicle
);

module.exports = router;