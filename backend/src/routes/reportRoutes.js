const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/monthly",
    authMiddleware,
    reportController.getMonthlyReport
);

router.get(
    "/monthly/pdf",
    authMiddleware,
    reportController.exportMonthlyReportPDF
);

router.get(
    "/monthly/excel",
    authMiddleware,
    reportController.exportMonthlyReportExcel
);

module.exports = router;