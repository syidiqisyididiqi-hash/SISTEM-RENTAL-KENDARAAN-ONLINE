"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import categoryService from "@/services/categoryService";
import LinkButton from "@/components/ui/LinkButton";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import { AlignLeft, AlertCircle, Pencil, Tags } from "lucide-react";

export default function EditCategoryPage() {
    const params = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showUpdateDialog, setShowUpdateDialog] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        const loadCategory = async () => {
            try {
                const response = await categoryService.getById(
                    params.id
                );

                const category = response.data?.data;

                if (!category) {
                    setError("Data kategori tidak ditemukan.");
                    return;
                }

                setFormData({
                    name: category.name || "",
                    description: category.description || "",
                });
            } catch (error) {
                console.error(
                    "Error mengambil data kategori:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data kategori."
                );
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadCategory();
        }
    }, [params.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");
        setShowUpdateDialog(true);
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            setError("");

            await categoryService.update(params.id, formData);

            setShowUpdateDialog(false);

            setToast({
                open: true,
                type: "success",
                message: "Kategori berhasil diperbarui.",
            });

            setTimeout(() => {
                router.push("/admin/categories");
            }, 1500);
        } catch (error) {
            console.error("Error mengubah kategori:", error);

            setShowUpdateDialog(false);

            const message =
                error.response?.data?.message ||
                "Gagal mengubah kategori.";

            setError(message);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl pb-10">
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xs">
                    <div className="mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="text-sm font-medium text-gray-600">
                        Memuat data kategori...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl pb-10">
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                        <Pencil size={19} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Kategori
                        </h1>
                        <p className="text-sm text-gray-500">
                            Perbarui informasi kategori kendaraan.
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                {error && (
                    <div className="mx-6 mt-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 md:mx-8">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Nama Kategori
                            </label>
                            <div className="relative">
                                <Tags className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama kategori"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Deskripsi
                            </label>
                            <div className="relative">
                                <AlignLeft className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Masukkan deskripsi kategori"
                                    rows={5}
                                    className="w-full resize-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <LinkButton href="/admin/categories" variant="cancel">
                            Batal
                        </LinkButton>
                        <Button type="submit" variant="primary" loading={saving}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmDialog
                open={showUpdateDialog}
                type="warning"
                title="Perbarui Kategori?"
                description="Apakah kamu yakin ingin menyimpan perubahan data kategori ini?"
                confirmText="Ya, Perbarui"
                cancelText="Batal"
                onConfirm={handleUpdate}
                onCancel={() => {
                    if (!saving) {
                        setShowUpdateDialog(false);
                    }
                }}
                loading={saving}
            />

            <Toast
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() =>
                    setToast({
                        open: false,
                        type: "success",
                        message: "",
                    })
                }
            />
        </div>
    );
}