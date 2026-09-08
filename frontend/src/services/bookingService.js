import api from "@/lib/axios";

const bookingService = {
    getAll: () => api.get("/bookings"),

    getById: (id) => api.get(`/bookings/${id}`),

    getByUser: (userId) => api.get(`/bookings/user/${userId}`),

    create: (data) => api.post("/bookings", data),

    update: (id, data) => api.put(`/bookings/${id}`, data),

    updateStatus: (id, status) =>
        api.patch(`/bookings/${id}/status`, { status }),

    remove: (id) => api.delete(`/bookings/${id}`),
};

export default bookingService;