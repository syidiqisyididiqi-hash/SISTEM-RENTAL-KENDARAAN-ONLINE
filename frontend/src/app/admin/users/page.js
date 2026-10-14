"use client";

import { useEffect, useState } from "react";
import userService from "@/services/userService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DataTable from "@/components/ui/DataTable";

export default function UsersPage() {
    
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [refreshKey, setRefreshKey] = useState(0);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        let isActive = true;

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");

                const response = await userService.getAll({
                    search: search.trim(),
                    role,
                    sortBy,
                    sortOrder,
                    page,
                    limit,
                });

                if (!isActive) return;

                setUsers(response.data?.data || []);
                setPagination(
                    response.data?.pagination || {
                        total: 0,
                        page: 1,
                        limit,
                        totalPages: 0,
                    }
                );
            } catch (error) {
                if (!isActive) return;

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data user."
                );
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }, 350);

        return () => {
            isActive = false;
            clearTimeout(timer);
        };
    }, [search, role, sortBy, sortOrder, page, limit, refreshKey]);

    const handleDelete = async () => {
        if (!selectedUserId) {
            return;
        }

        try {
            setDeleteLoading(true);
            setError("");

            await userService.remove(selectedUserId);

            if (users.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
            } else {
                setRefreshKey((current) => current + 1);
            }

            setShowDeleteDialog(false);
            setSelectedUserId(null);

            setToast({
                open: true,
                type: "success",
                message: "User berhasil dihapus.",
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Gagal menghapus user.";

            setShowDeleteDialog(false);
            setSelectedUserId(null);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setDeleteLoading(false);
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

    const handleResetFilters = () => {
        setSearch("");
        setRole("");
        setSortBy("id");
        setSortOrder("desc");
        setPage(1);
        setLimit(10);
    };

    const columns = [
        {
            key: "no",
            label: "No",
            render: (_, index) => (page - 1) * limit + index + 1,
        },
        {
            key: "name",
            label: "Nama",
            render: (user) => (
                <p className="font-medium text-gray-800">
                    {user.name}
                </p>
            ),
        },
        {
            key: "email",
            label: "Email",
            render: (user) => (
                <span className="text-gray-600">
                    {user.email}
                </span>
            ),
        },
        {
            key: "phone",
            label: "Telepon",
            render: (user) => (
                <span className="text-gray-600">
                    {user.phone || "-"}
                </span>
            ),
        },
        {
            key: "address",
            label: "Alamat",
            render: (user) => (
                <p className="max-w-[250px] truncate text-gray-600">
                    {user.address || "-"}
                </p>
            ),
        },
        {
            key: "role",
            label: "Role",
            render: (user) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleStyle(
                        user.role
                    )}`}
                >
                    {getRoleLabel(user.role)}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Terdaftar",
            render: (user) => (
                <span className="text-gray-600">
                    {formatDate(user.created_at)}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (user) => (
                <div className="flex gap-2">
                    <LinkButton
                        href={`/admin/users/edit/${user.id}`}
                    >
                        Edit
                    </LinkButton>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                            setSelectedUserId(user.id);
                            setShowDeleteDialog(true);
                        }}
                    >
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

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

                <LinkButton
                    href="/admin/users/create"
                    variant="add"
                >
                    + Tambah User
                </LinkButton>
            </div>

            <div className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="user-search"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Cari Pengguna
                        </label>

                        <input
                            id="user-search"
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari nama, email, atau telepon..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="user-role"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Filter Role
                        </label>

                        <select
                            id="user-role"
                            value={role}
                            onChange={(event) => {
                                setRole(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="">Semua Role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="user-limit"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Data per Halaman
                        </label>

                        <select
                            id="user-limit"
                            value={limit}
                            onChange={(event) => {
                                setLimit(Number(event.target.value));
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value={10}>10 data</option>
                            <option value={25}>25 data</option>
                            <option value={50}>50 data</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="user-sort"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Urutkan Berdasarkan
                        </label>

                        <select
                            id="user-sort"
                            value={sortBy}
                            onChange={(event) => {
                                setSortBy(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="id">ID / Terbaru</option>
                            <option value="name">Nama</option>
                            <option value="email">Email</option>
                            <option value="role">Role</option>
                            <option value="created_at">Tanggal Terdaftar</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="user-sort-order"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Urutan
                        </label>

                        <select
                            id="user-sort-order"
                            value={sortOrder}
                            onChange={(event) => {
                                setSortOrder(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="desc">Menurun (DESC)</option>
                            <option value="asc">Menaik (ASC)</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleResetFilters}
                        >
                            Reset Filter
                        </Button>
                    </div>
                </div>

                {error ? (
                    <p className="text-sm text-red-500">{error}</p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={users}
                        loading={loading}
                    />
                )}

                {!error && !loading && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            Menampilkan{" "}
                            {pagination.total === 0
                                ? 0
                                : (page - 1) * limit + 1}
                            {"–"}
                            {Math.min(page * limit, pagination.total)}
                            {" dari "}
                            {pagination.total} pengguna
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={page <= 1}
                                onClick={() => setPage((current) => current - 1)}
                            >
                                Sebelumnya
                            </Button>

                            <span className="whitespace-nowrap text-sm text-gray-600">
                                Halaman {page} dari{" "}
                                {Math.max(pagination.totalPages, 1)}
                            </span>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={
                                    pagination.totalPages === 0 ||
                                    page >= pagination.totalPages
                                }
                                onClick={() => setPage((current) => current + 1)}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={showDeleteDialog}
                type="danger"
                title="Hapus User?"
                description="Apakah kamu yakin ingin menghapus user ini? Data yang sudah dihapus tidak dapat dikembalikan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleteLoading) {
                        setShowDeleteDialog(false);
                        setSelectedUserId(null);
                    }
                }}
                loading={deleteLoading}
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