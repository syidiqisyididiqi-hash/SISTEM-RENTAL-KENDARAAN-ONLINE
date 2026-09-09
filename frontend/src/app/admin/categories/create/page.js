"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import categoryService from "@/services/categoryService";

export default function CreateCategoryPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await categoryService.create(formData);

            router.push("/admin/categories");
        } catch (error) {
            console.error("Error menambahkan kategori:", error);

            setError(
                error.response?.data?.message ||
                    "Gagal menambahkan kategori."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="mb-2">
                    <Link
                        href="/admin/categories"
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Kembali ke Categories
                    </Link>
                </div>

                <h1 className="text-2xl font-bold text-gray-800">
                    Tambah Kategori
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Tambahkan kategori kendaraan baru.
                </p>
            </div>

            {/* Form */}
            <div className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        {/* Nama */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Nama Kategori
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Mobil, Motor"
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Deskripsi
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Masukkan deskripsi kategori"
                                rows={5}
                                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <Link
                            href="/admin/categories"
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Menyimpan..."
                                : "Simpan Kategori"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}