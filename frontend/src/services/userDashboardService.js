import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getUserDashboard = async () => {
    const token = sessionStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/user-dashboard`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

const userDashboardService = {
    getUserDashboard,
};

export default userDashboardService;