"use client";

import { useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    X,
} from "lucide-react";

export default function Toast({
    open,
    type = "success",
    message,
    onClose,
    duration = 3000,
}) {
    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [open, duration, onClose]);

    if (!open) {
        return null;
    }

    const config = {
        success: {
            icon: CheckCircle,
            iconClass: "text-green-600",
            title: "Berhasil",
        },

        error: {
            icon: XCircle,
            iconClass: "text-red-600",
            title: "Gagal",
        },
    };

    const current = config[type] || config.success;
    const Icon = current.icon;

    return (
        <div className="fixed right-5 top-5 z-[10000] w-[calc(100%-2rem)] max-w-sm">
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
                <Icon
                    size={22}
                    className={`mt-0.5 shrink-0 ${current.iconClass}`}
                />

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                        {current.title}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                        {message}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Tutup notifikasi"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}