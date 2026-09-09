"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import userService from "@/services/userService";

export default function CreateUserPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "user",
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
            await userService.create(formData);

            router.push("/admin/users");
        } catch (error) {
            console.error("Error menambahkan user:", error);

            setError(
                error.response?.data?.message ||
                    "Gagal menambahkan user."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
             

                <h1 className="text-2xl font-bold text-gray-800">
                    Tambah User
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Tambahkan pengguna baru ke dalam sistem.
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

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Masukkan password"
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
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Menyimpan..." : "Simpan User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}