import api from "@/lib/axios";

const reportService = {
    getMonthlyReport: (month, year) =>
        api.get(`/reports/monthly?month=${month}&year=${year}`),

    exportMonthlyPDF: (month, year) =>
        api.get(`/reports/monthly/pdf?month=${month}&year=${year}`, {
            responseType: "blob",
        }),

    exportMonthlyExcel: (month, year) =>
        api.get(`/reports/monthly/excel?month=${month}&year=${year}`, {
            responseType: "blob",
        }),
};

export default reportService;