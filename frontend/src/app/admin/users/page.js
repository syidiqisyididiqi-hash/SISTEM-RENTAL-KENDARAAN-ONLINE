"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import userService from "@/services/userService";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await userService.getAll();

                setUsers(response.data?.data || []);
                setError("");
            } catch (error) {
                console.error("Error mengambil data user:", error);
                setError("Gagal mengambil data user.");
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Apakah kamu yakin ingin menghapus user ini?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await userService.remove(id);

            setUsers((prevUsers) =>
                prevUsers.filter((user) => user.id !== id)
            );

            alert("User berhasil dihapus.");
        } catch (error) {
            console.error("Error menghapus user:", error);
            alert("Gagal menghapus user.");
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getRoleStyle = (role) => {
        if (role === "admin") {
            return "bg-purple-50 text-purple-600";
        }

        return "bg-blue-50 text-blue-600";
    };

    const getRoleLabel = (role) => {
        if (role === "admin") {
            return "Admin";
        }

        return "User";
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Users
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola data pengguna.
                    </p>
                </div>

                <Link
                    href="/admin/users/create"
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    + Tambah User
                </Link>
            </div>

            {/* Content */}
            <div className="mt-6">
                {loading && (
                    <p className="text-sm text-gray-500">
                        Memuat data user...
                    </p>
                )}

                {error && (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            ID
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Nama
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Email
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Telepon
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Alamat
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Role
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Terdaftar
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-6 py-4">
                                                    {user.id}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800">
                                                        {user.name}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {user.email}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {user.phone || "-"}
                                                </td>

                                                <td className="max-w-[250px] px-6 py-4 text-gray-600">
                                                    <p className="truncate">
                                                        {user.address || "-"}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleStyle(
                                                            user.role
                                                        )}`}
                                                    >
                                                        {getRoleLabel(
                                                            user.role
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatDate(
                                                        user.created_at
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                   <Link
                                                        href={`/admin/users/edit/${user.id}`}
                                                        className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
>
                                                        Edit
                                                    </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(user.id)}
                                                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="px-6 py-8 text-center text-gray-500"
                                            >
                                                Belum ada user.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}