
import api from "@/lib/axios";

const BASE_URL = "/rental-locations";

const createFormData = (data) => {
    if (data instanceof FormData) {
        return data;
    }

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, value);
        }
    });

    return formData;
};

const rentalLocationService = {
    getAll: (params = {}) => api.get(BASE_URL, { params }),

    getActive: () => api.get(`${BASE_URL}/active`),

    getById: (id) => api.get(`${BASE_URL}/${id}`),

    create: (data) => {
        const formData = createFormData(data);

        return api.post(BASE_URL, formData);
    },

    update: (id, data) => {
        const formData = createFormData(data);

        return api.put(`${BASE_URL}/${id}`, formData);
    },

    updateStatus: (id, is_active) =>
        api.patch(`${BASE_URL}/${id}/status`, { is_active }),

    remove: (id) => api.delete(`${BASE_URL}/${id}`),
};

export default rentalLocationService;
