const reportService = require("../services/reportService");

const {
    generateMonthlyReportPDF,
} = require("../exports/excel/monthlyReportPDF");

const {
    generateMonthlyReportExcel,
} = require("../exports/pdf/monthlyReportExcel");

const validatePeriod = (month, year) => {
    const monthValue = Number(month);
    const yearValue = Number(year);

    if (
        !Number.isInteger(monthValue) ||
        monthValue < 1 ||
        monthValue > 12
    ) {
        return {
            valid: false,
            message: "Month harus berupa angka 1 sampai 12",
        };
    }

    if (!Number.isInteger(yearValue) || yearValue < 2000) {
        return {
            valid: false,
            message: "Year tidak valid",
        };
    }

    return {
        valid: true,
        monthValue,
        yearValue,
    };
};

const getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month dan year wajib diisi",
            });
        }

        const validation = validatePeriod(month, year);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const report = await reportService.getMonthlyReport(
            validation.monthValue,
            validation.yearValue
        );

        return res.status(200).json({
            success: true,
            message: "Laporan bulanan berhasil diambil",
            data: report,
        });
    } catch (error) {
        console.error("Get monthly report error:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil laporan bulanan",
        });
    }
};

const exportMonthlyReportPDF = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month dan year wajib diisi",
            });
        }

        const validation = validatePeriod(month, year);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const report = await reportService.getMonthlyReport(
            validation.monthValue,
            validation.yearValue
        );

        const pdfBuffer = await generateMonthlyReportPDF(report);

        const fileName = `laporan-rental-${validation.yearValue}-${String(
            validation.monthValue
        ).padStart(2, "0")}.pdf`;

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Export monthly report PDF error:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal membuat laporan PDF",
        });
    }
};

const exportMonthlyReportExcel = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month dan year wajib diisi",
            });
        }

        const validation = validatePeriod(month, year);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const report = await reportService.getMonthlyReport(
            validation.monthValue,
            validation.yearValue
        );

        const excelBuffer = await generateMonthlyReportExcel(report);

        const fileName = `laporan-rental-${validation.yearValue}-${String(
            validation.monthValue
        ).padStart(2, "0")}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        return res.send(excelBuffer);
    } catch (error) {
        console.error("Export monthly report Excel error:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal membuat laporan Excel",
        });
    }
};

module.exports = {
    getMonthlyReport,
    exportMonthlyReportPDF,
    exportMonthlyReportExcel,
};