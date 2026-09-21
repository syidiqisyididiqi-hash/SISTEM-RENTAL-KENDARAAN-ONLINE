"use client";

import {
    AlertTriangle,
    CheckCircle,
    Trash2,
    X,
} from "lucide-react";

export default function ConfirmDialog({
    open,
    type = "danger",
    title,
    description,
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!open) return null;

    const config = {
        danger: {
            icon: Trash2,
            iconWrapper:
                "bg-red-100 text-red-600",
            button:
                "bg-red-600 hover:bg-red-700",
        },

        success: {
            icon: CheckCircle,
            iconWrapper:
                "bg-green-100 text-green-600",
            button:
                "bg-green-600 hover:bg-green-700",
        },

        warning: {
            icon: AlertTriangle,
            iconWrapper:
                "bg-amber-100 text-amber-600",
            button:
                "bg-amber-600 hover:bg-amber-700",
        },
    };

    const current = config[type] || config.danger;
    const Icon = current.icon;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full ${current.iconWrapper}`}
                        >
                            <Icon size={24} />
                        </div>

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-5">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {description}
                        </p>
                    </div>

                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {cancelText}
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${current.button} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            {loading
                                ? "Memproses..."
                                : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
