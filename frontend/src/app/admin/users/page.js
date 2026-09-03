"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getUsers = async () => {
        try {
            const response = await api.get("/users");

            setUsers(response.data.data || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Gagal mengambil data pengguna"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void Promise.resolve().then(getUsers);
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800">
                Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
                Kelola data pengguna.
            </p>

            <div className="mt-6 rounded-lg border bg-white">
                {loading ? (
                    <div className="p-6 text-sm text-gray-500">
                        Memuat data pengguna...
                    </div>
                ) : error ? (
                    <div className="p-6 text-sm text-red-500">
                        {error}
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">
                        Belum ada data pengguna.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        No. Telepon
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        Role
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            {user.id}
                                        </td>

                                        <td className="px-6 py-4 font-medium">
                                            {user.name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {user.email}
                                        </td>

                                        <td className="px-6 py-4">
                                            {user.phone || "-"}
                                        </td>

                                        <td className="px-6 py-4">
                                            {user.role}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}