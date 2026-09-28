const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get(
    "/monthly",
    authMiddleware,
    adminMiddleware,
    reportController.getMonthlyReport
);

router.get(
    "/monthly/pdf",
    authMiddleware,
    adminMiddleware,
    reportController.exportMonthlyReportPDF
);

router.get(
    "/monthly/excel",
    authMiddleware,
    adminMiddleware,
    reportController.exportMonthlyReportExcel
);

module.exports = router;