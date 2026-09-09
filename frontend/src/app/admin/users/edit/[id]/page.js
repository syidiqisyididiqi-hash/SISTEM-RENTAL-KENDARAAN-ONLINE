"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import userService from "@/services/userService";

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "user",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await userService.getById(params.id);

                const user = response.data?.data;

                if (!user) {
                    setError("Data user tidak ditemukan.");
                    return;
                }

                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    address: user.address || "",
                    role: user.role || "user",
                });
            } catch (error) {
                console.error("Error mengambil data user:", error);

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data user."
                );
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadUser();
        }
    }, [params.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");

        try {
            await userService.update(params.id, formData);

            router.push("/admin/users");
        } catch (error) {
            console.error("Error mengubah user:", error);

            setError(
                error.response?.data?.message ||
                    "Gagal mengubah data user."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <p className="text-sm text-gray-500">
                    Memuat data user...
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="mb-2">
                  
                </div>

                <h1 className="text-2xl font-bold text-gray-800">
                    Edit User
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Perbarui informasi pengguna.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 max-w-3xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Form */}
            <div className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Nama */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Nama
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Masukkan nama"
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Masukkan email"
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Telepon */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Telepon
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Masukkan nomor telepon"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Role
                            </label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Alamat */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Alamat
                            </label>

                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Masukkan alamat"
                                rows={4}
                                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <Link
                            href="/admin/users"
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}