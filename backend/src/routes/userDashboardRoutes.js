
const express = require("express");

const router = express.Router();

const {
    getUserDashboard
} = require("../controllers/userDashboardController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/",
    authMiddleware,
    getUserDashboard
);

module.exports = router;