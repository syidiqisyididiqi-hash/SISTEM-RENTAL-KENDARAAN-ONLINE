
import axios from "axios";

const chatbotApi = axios.create({
    baseURL: "http://localhost:5000/api/chatbot",
    headers: {
        "Content-Type": "application/json",
    },
});

const sendMessage = async (message, history = []) => {
    const response = await chatbotApi.post("/message", {
        message,
        history,
    });

    return response.data;
};

const chatbotService = {
    sendMessage,
};

export default chatbotService;
