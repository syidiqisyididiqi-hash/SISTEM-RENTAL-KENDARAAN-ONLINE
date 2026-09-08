import api from "@/lib/axios";

const adminDashboardService = {
    getDashboard: () => api.get("/admin/dashboard"),
};

export default adminDashboardService;