
import api from "@/lib/axios";

const BASE_URL = "/rental-guide";

const rentalGuideService = {
    getAll: (params = {}) => api.get(BASE_URL, { params }),

    getActive: () => api.get(`${BASE_URL}/active`),

    getById: (id) => api.get(`${BASE_URL}/${id}`),

    create: (data) =>
        api.post(BASE_URL, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    update: (id, data) =>
        api.put(`${BASE_URL}/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),

    updateStatus: (id, is_active) =>
        api.patch(`${BASE_URL}/${id}/status`, { is_active }),

    remove: (id) => api.delete(`${BASE_URL}/${id}`),
};

export default rentalGuideService;