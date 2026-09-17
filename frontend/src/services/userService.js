import api from "@/lib/axios";

const userService = {
    getAll: () => api.get("/users"),

    getById: (id) => api.get(`/users/${id}`),

    create: (data) => api.post("/users", data),

    update: (id, data) => api.put(`/users/${id}`, data),

    remove: (id) => api.delete(`/users/${id}`),

    getProfile: () => api.get("/users/profile"),

    updateProfile: (data) => api.put("/users/profile", data),
};

export default userService;