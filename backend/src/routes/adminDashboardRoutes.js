const express = require("express");

const router = express.Router();

const {
    getAdminDashboard
} = require("../controllers/adminDashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAdminDashboard
);

module.exports = router;