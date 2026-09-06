const adminDashboardService = require("../services/adminDashboardService");

const getAdminDashboard = async (req, res) => {
    try {
        const data = await adminDashboardService.getAdminDashboard();

        res.status(200).json({
            success: true,
            message: "Data dashboard admin berhasil diambil",
            data,
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data dashboard admin",
        });
    }
};

module.exports = {
    getAdminDashboard,
};
