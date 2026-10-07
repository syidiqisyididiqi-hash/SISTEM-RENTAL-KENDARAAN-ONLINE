"use client";

import { useEffect, useRef, useState } from "react";
import {
    ImageIcon,
    Upload,
    Trash2,
    RefreshCw,
} from "lucide-react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import paymentSettingService from "@/services/paymentSettingService";

const Page = () => {
    const fileInputRef = useRef(null);
    const previewUrlRef = useRef(null);

    const [qrisImage, setQrisImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadQris = async () => {
            try {
                const response =
                    await paymentSettingService.get();

                if (!cancelled) {
                    setQrisImage(
                        response.data?.data?.qris_image_url || null
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error);

                    setToast({
                        open: true,
                        type: "error",
                        message:
                            error.response?.data?.message ||
                            "Gagal mengambil data QRIS.",
                    });
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadQris();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(
        () => () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        },
        []
    );

    const clearPreview = () => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }

        setPreviewUrl(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setToast({
                open: true,
                type: "error",
                message:
                    "Format gambar harus JPG, PNG, atau WEBP.",
            });

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setToast({
                open: true,
                type: "error",
                message:
                    "Ukuran gambar maksimal 5 MB.",
            });

            event.target.value = "";
            return;
        }

        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setToast({
                open: true,
                type: "error",
                message:
                    "Silakan pilih gambar QRIS terlebih dahulu.",
            });

            return;
        }

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            const response =
                await paymentSettingService.updateQris(
                    selectedFile
                );

            setQrisImage(
                response.data?.data?.qris_image_url || null
            );

            setSelectedFile(null);
            clearPreview();

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setToast({
                open: true,
                type: "success",
                message:
                    "Gambar QRIS berhasil diperbarui.",
            });
        } catch (error) {
            console.error(error);

            setToast({
                open: true,
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Gagal memperbarui gambar QRIS.",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await paymentSettingService.deleteQris();

            setQrisImage(null);
            setSelectedFile(null);
            clearPreview();

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setToast({
                open: true,
                type: "success",
                message:
                    "Gambar QRIS berhasil dihapus.",
            });
        } catch (error) {
            console.error(error);

            setToast({
                open: true,
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Gagal menghapus gambar QRIS.",
            });
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleCancelPreview = () => {
        setSelectedFile(null);
        clearPreview();

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Pengaturan Pembayaran
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Kelola gambar QRIS yang digunakan untuk
                    pembayaran customer.
                </p>
            </div>

            <Toast
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() =>
                    setToast((prev) => ({
                        ...prev,
                        open: false,
                    }))
                }
            />

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <ImageIcon className="h-5 w-5 text-gray-700" />
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                QRIS Pembayaran
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Satu gambar QRIS digunakan untuk
                                seluruh transaksi QRIS.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex min-h-[420px] items-center justify-center">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Memuat QRIS...
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                            <div>
                                <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
                                    {previewUrl ? (
                                        <div className="text-center">
                                            <div className="mx-auto flex max-w-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview QRIS"
                                                    className="max-h-[360px] w-full object-contain"
                                                />
                                            </div>

                                            <p className="mt-4 text-sm font-medium text-gray-700">
                                                Preview QRIS baru
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Belum disimpan ke server
                                            </p>
                                        </div>
                                    ) : qrisImage ? (
                                        <div className="text-center">
                                            <div className="mx-auto flex max-w-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                                <img
                                                    src={qrisImage}
                                                    alt="QRIS Pembayaran"
                                                    className="max-h-[360px] w-full object-contain"
                                                />
                                            </div>

                                            <div className="mt-4 flex items-center justify-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500" />

                                                <span className="text-sm font-medium text-gray-700">
                                                    QRIS aktif
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                                <ImageIcon className="h-9 w-9 text-gray-400" />
                                            </div>

                                            <h3 className="mt-4 font-medium text-gray-900">
                                                QRIS belum tersedia
                                            </h3>

                                            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                                                Upload gambar QRIS agar
                                                customer dapat melakukan
                                                pembayaran menggunakan
                                                QRIS.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        Kelola QRIS
                                    </h3>

                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Upload gambar QRIS baru untuk
                                        mengganti QRIS yang sedang
                                        digunakan.
                                    </p>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    <Upload className="h-4 w-4" />

                                    Pilih Gambar QRIS
                                </button>

                                {selectedFile && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <p className="truncate text-sm font-medium text-gray-800">
                                            {selectedFile.name}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {(
                                                selectedFile.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={
                                            !selectedFile ||
                                            uploading
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4" />
                                                {qrisImage
                                                    ? "Update QRIS"
                                                    : "Upload QRIS"}
                                            </>
                                        )}
                                    </button>

                                    {selectedFile && (
                                        <button
                                            type="button"
                                            onClick={
                                                handleCancelPreview
                                            }
                                            disabled={uploading}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Batal
                                        </button>
                                    )}

                                    {qrisImage && (
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={deleting}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deleting ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    Menghapus...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus QRIS
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-700">
                                        Ketentuan gambar
                                    </p>

                                    <ul className="mt-2 space-y-1 text-xs leading-5 text-gray-500">
                                        <li>
                                            • Format JPG, PNG, atau WEBP
                                        </li>

                                        <li>
                                            • Ukuran maksimal 5 MB
                                        </li>

                                        <li>
                                            • Gunakan gambar QRIS yang jelas
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <ConfirmDialog
                    open={showDeleteConfirm}
                    type="danger"
                    title="Hapus QRIS?"
                    description="Apakah Anda yakin ingin menghapus gambar QRIS? Customer tidak dapat menggunakan QRIS untuk melakukan pembayaran sampai gambar QRIS baru diunggah."
                    confirmText="Hapus QRIS"
                    cancelText="Batal"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                    loading={deleting}
                />
            </div>
        </div>
    );
};

export default Page;