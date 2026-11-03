
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ImagePlus,
    Save,
    X,
    BookOpen,
} from "lucide-react";

import rentalGuideService from "@/services/rentalGuideService";

export default function CreateRentalGuidePage() {
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        description: "",
        step_order: 1,
        is_active: "1",
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!image) {
            setPreview("");
            return;
        }

        const objectUrl = URL.createObjectURL(image);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [image]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImage = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Format gambar harus JPG, PNG, atau WEBP.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Ukuran gambar maksimal 5 MB.");
            e.target.value = "";
            return;
        }

        setError("");
        setImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            setError("Judul dan deskripsi wajib diisi.");
            return;
        }

        if (Number(form.step_order) < 1 || !Number.isInteger(Number(form.step_order))) {
            setError("Urutan langkah harus berupa angka minimal 1.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const formData = new FormData();

            formData.append("title", form.title.trim());
            formData.append("description", form.description.trim());
            formData.append("step_order", form.step_order);
            formData.append("is_active", form.is_active);

            if (image) {
                formData.append("image", image);
            }

            await rentalGuideService.create(formData);

            router.push("/admin/rental-guide");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Gagal menambahkan panduan rental."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <Link
                    href="/admin/rental-guide"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
                >
                    <ArrowLeft size={17} />
                    Kembali ke daftar panduan
                </Link>

                <h1 className="mt-4 text-2xl font-bold text-gray-900">
                    Tambah Panduan Rental
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Tambahkan langkah baru untuk panduan penyewaan kendaraan.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
            >
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Judul Panduan <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        maxLength={150}
                        placeholder="Contoh: Pilih Kendaraan"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="text-right text-xs text-gray-400">
                        {form.title.length}/150 karakter
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Deskripsi <span className="text-red-500">*</span>
                    </label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={5}
                        required
                        placeholder="Jelaskan langkah penyewaan kendaraan..."
                        className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Gambar Panduan
                    </label>

                    <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center hover:border-blue-400 hover:bg-blue-50">
                        <ImagePlus size={32} className="text-gray-400" />

                        <span className="mt-3 text-sm font-medium text-gray-700">
                            Klik untuk memilih gambar
                        </span>

                        <span className="mt-1 text-xs text-gray-500">
                            JPG, PNG, WEBP (Maksimal 5 MB)
                        </span>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImage}
                            className="hidden"
                        />
                    </label>

                    {preview && (
                        <div className="relative mt-4 w-fit">
                            <img
                                src={preview}
                                alt="Preview gambar panduan"
                                className="h-48 w-72 rounded-lg border border-gray-200 object-cover"
                            />

                            <button
                                type="button"
                                onClick={() => setImage(null)}
                                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                                title="Hapus gambar"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {image && (
                        <p className="text-xs text-gray-500">
                            File: {image.name}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Urutan Langkah
                        </label>

                        <input
                            type="number"
                            name="step_order"
                            value={form.step_order}
                            onChange={handleChange}
                            min="1"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Status
                        </label>

                        <select
                            name="is_active"
                            value={form.is_active}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="1">Aktif</option>
                            <option value="0">Nonaktif</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                    <Link
                        href="/admin/rental-guide"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Batal
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={17} />
                        {loading ? "Menyimpan..." : "Simpan Panduan"}
                    </button>
                </div>
            </form>
        </div>
    );
}
