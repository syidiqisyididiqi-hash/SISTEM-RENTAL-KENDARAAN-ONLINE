import api from "@/lib/axios";

const paymentService = {
    getAll: () => api.get("/payments"),

    getById: (id) => api.get(`/payments/${id}`),

    getByBookingId: (bookingId) =>
        api.get(`/payments/booking/${bookingId}`),

    create: (data) =>
        api.post("/payments", data),

    update: (id, data) =>
        api.put(`/payments/${id}`, data),

    updateStatus: (id, status) =>
        api.patch(`/payments/${id}/status`, { status }),

    remove: (id) =>
        api.delete(`/payments/${id}`),
};

export default paymentService;