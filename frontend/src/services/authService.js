
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const authService = {
    register: async (userData) => {
        const response = await axios.post(
            `${API_URL}/auth/register`,
            userData
        );

        return response;
    },

    login: async (email, password) => {
        const response = await axios.post(
            `${API_URL}/auth/login`,
            {
                email,
                password,
            }
        );

        return response;
    },
};

export default authService;