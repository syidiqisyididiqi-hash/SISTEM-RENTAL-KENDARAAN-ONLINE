import api from "@/lib/axios";

const vehicleService = {
    getAll: () => api.get("/vehicles"),

    getAvailable: () => api.get("/vehicles/available"),

    getById: (id) => api.get(`/vehicles/${id}`),

    create: (data) => api.post("/vehicles", data),

    update: (id, data) => api.put(`/vehicles/${id}`, data),

    remove: (id) => api.delete(`/vehicles/${id}`),
};

export default vehicleService;