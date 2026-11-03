
"use client";

import { useState } from "react";
import chatbotService from "@/services/chatbotService";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendMessage = async (event) => {
        event.preventDefault();

        const text = message.trim();

        if (!text || isLoading) return;

        if (text.length > 2000) {
            setError("Pesan maksimal 2000 karakter.");
            return;
        }

        const history = messages
            .filter((item) => item.role === "user" || item.role === "assistant")
            .slice(-10)
            .map((item) => ({
                role: item.role,
                content: item.content,
            }));

        setMessages((prev) => [
            ...prev,
            { role: "user", content: text },
        ]);

        setMessage("");
        setError("");
        setIsLoading(true);

        try {
            const response = await chatbotService.sendMessage(text, history);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: response.reply,
                },
            ]);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Tidak dapat menghubungi chatbot. Periksa koneksi backend."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {isOpen && (
                <div className="mb-3 flex h-[500px] w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
                        <div>
                            <h2 className="font-semibold">Asisten Rental</h2>
                            <p className="text-xs text-blue-100">
                                Chatbot AI
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Tutup chatbot"
                            className="rounded-lg px-3 py-1 text-xl hover:bg-blue-700"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                        {messages.length === 0 && (
                            <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm">
                                Halo! Saya asisten rental kendaraan.
                                Ada yang bisa saya bantu?
                            </div>
                        )}

                        {messages.map((item, index) => (
                            <div
                                key={`${index}-${item.role}`}
                                className={`flex ${
                                    item.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm ${
                                        item.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "border border-slate-200 bg-white text-slate-800"
                                    }`}
                                >
                                    {item.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="text-sm text-slate-500">
                                Asisten sedang mengetik...
                            </div>
                        )}

                        {error && (
                            <p role="alert" className="text-sm text-red-600">
                                {error}
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSendMessage}
                        className="flex gap-2 border-t border-slate-200 bg-white p-3"
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Tulis pertanyaan..."
                            maxLength={2000}
                            disabled={isLoading}
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Kirim
                        </button>
                    </form>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Tutup chatbot" : "Buka chatbot"}
                className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg hover:bg-blue-700"
            >
                {isOpen ? "×" : "💬"}
            </button>
        </div>
    );
}
