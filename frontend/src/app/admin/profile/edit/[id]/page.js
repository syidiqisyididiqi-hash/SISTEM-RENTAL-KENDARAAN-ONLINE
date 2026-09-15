"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import userService from "@/services/userService";

export default function EditProfilePage() {
    const params = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "",
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const getUser = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await userService.getById(params.id);

                const userData =
                    response?.data?.data ||
                    response?.data ||
                    null;

                if (!userData) {
                    setError("Data user tidak ditemukan.");
                    return;
                }

                setUser(userData);

                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    address: userData.address || "",
                    role: userData.role || "user",
                });
            } catch (error) {
                console.error(error);

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data user."
                );
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            getUser();
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

        setError("");
        setSuccess("");

        if (!formData.name || !formData.email) {
            setError("Nama dan email wajib diisi.");
            return;
        }

        if (!formData.role) {
            setError("Role wajib dipilih.");
            return;
        }

        try {
            setSaving(true);

            const response = await userService.update(
                params.id,
                formData
            );

            const updatedUser =
                response?.data?.data ||
                response?.data ||
                null;

            if (updatedUser) {
                setUser(updatedUser);

                setFormData({
                    name: updatedUser.name || "",
                    email: updatedUser.email || "",
                    phone: updatedUser.phone || "",
                    address: updatedUser.address || "",
                    role: updatedUser.role || "user",
                });

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );
            }

            setSuccess("Profile berhasil diperbarui.");

            setTimeout(() => {
                router.push("/admin/profile");
            }, 800);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                    "Gagal memperbarui profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Profile
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Memuat data profile...
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Profile
                </h1>

                <p className="mt-2 text-sm text-red-500">
                    {error || "Data profile tidak ditemukan."}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Profile
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Ubah informasi profile kamu.
                </p>
            </div>

            {success && (
                <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-6 max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nama
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Masukkan nama"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Masukkan email"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nomor Telepon
                        </label>

                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Masukkan nomor telepon"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Alamat
                        </label>

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Masukkan alamat"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Role
                        </label>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="user">
                                User
                            </option>

                            <option value="admin">
                                Admin
                            </option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Menyimpan..."
                                : "Simpan Perubahan"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                router.push("/admin/profile")
                            }
                            disabled={saving}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}