import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            window.dispatchEvent(new Event("auth-change"));
        }

        if (error.response?.status === 403) {
            window.dispatchEvent(new Event("auth-forbidden"));
        }

        return Promise.reject(error);
    }
);

export default api;