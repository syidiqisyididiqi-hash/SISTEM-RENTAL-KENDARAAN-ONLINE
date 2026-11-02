
const { GoogleGenAI } = require("@google/genai");

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 10;

const createGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return null;
    }

    return new GoogleGenAI({ apiKey });
};

const sendMessage = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Pesan tidak boleh kosong.",
            });
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: "Pesan maksimal 2000 karakter.",
            });
        }

        if (!Array.isArray(history)) {
            return res.status(400).json({
                success: false,
                message: "Format riwayat percakapan tidak valid.",
            });
        }

        const validHistory = history
            .filter(
                (item) =>
                    item &&
                    ["user", "assistant"].includes(item.role) &&
                    typeof item.content === "string"
            )
            .slice(-MAX_HISTORY_LENGTH)
            .map((item) => ({
                role: item.role === "assistant" ? "model" : "user",
                parts: [
                    {
                        text: item.content.slice(0, MAX_MESSAGE_LENGTH),
                    },
                ],
            }));

        const gemini = createGeminiClient();

        if (!gemini) {
            return res.status(503).json({
                success: false,
                message: "Chatbot belum dikonfigurasi. API key Gemini belum tersedia.",
            });
        }

        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

        console.log("Model Gemini yang digunakan:", model);

        const response = await gemini.models.generateContent({
            model,
            contents: [
                ...validHistory,
                {
                    role: "user",
                    parts: [{ text: message.trim() }],
                },
            ],
            config: {
                systemInstruction: `
                    Kamu adalah asisten AI untuk Sistem Rental Kendaraan Online.
                    Jawab dalam bahasa Indonesia yang sopan, jelas, dan ringkas.
                    Bantu pengguna memahami cara rental, persyaratan,
                    pembayaran, pembatalan, dan penggunaan website.
                    Jangan mengarang harga, stok kendaraan, atau status pemesanan.
                    Jika ditanya data aktual yang belum diberikan sistem,
                    jelaskan bahwa data tersebut perlu diperiksa terlebih dahulu.
                    Jangan meminta kata sandi, token, atau informasi pembayaran sensitif.
                `,
            },
        });

        const reply = response.text;

        if (!reply || !reply.trim()) {
            return res.status(502).json({
                success: false,
                message: "Gemini belum memberikan jawaban. Silakan coba lagi.",
            });
        }

        return res.status(200).json({
            success: true,
            reply: reply.trim(),
        });
    } catch (error) {
        console.error("Chatbot Gemini error:", {
            message: error.message,
            status: error.status,
            code: error.code,
        });

        const status = Number(error.status);

        if (status === 429) {
            return res.status(503).json({
                success: false,
                message: "Batas penggunaan AI tercapai. Silakan coba lagi nanti.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Chatbot sedang mengalami gangguan. Silakan coba lagi.",
        });
    }
};

module.exports = {
    sendMessage,
};
