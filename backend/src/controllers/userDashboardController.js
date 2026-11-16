
const userDashboardService = require("../services/userDashboardService");

const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await userDashboardService.getUserDashboard(userId);

        res.status(200).json({
            success: true,
            message: "Dashboard user berhasil diambil",
            data,
        });

    } catch (error) {
        console.error("User dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Gagal mengambil data dashboard user",
        });
    }
};

module.exports = {
    getUserDashboard,
};