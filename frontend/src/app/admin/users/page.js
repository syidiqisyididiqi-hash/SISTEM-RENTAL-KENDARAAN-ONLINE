"use client";

import { useEffect, useState } from "react";
import userService from "@/services/userService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DataTable from "@/components/ui/DataTable";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

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

    const handleDelete = async () => {
        if (!selectedUserId) {
            return;
        }

        try {
            setDeleteLoading(true);

            await userService.remove(selectedUserId);

            setUsers((prevUsers) =>
                prevUsers.filter(
                    (user) => user.id !== selectedUserId
                )
            );

            setShowDeleteDialog(false);
            setSelectedUserId(null);

            setToast({
                open: true,
                type: "success",
                message: "User berhasil dihapus.",
            });
        } catch (error) {
            console.error("Error menghapus user:", error);

            setToast({
                open: true,
                type: "error",
                message: "Gagal menghapus user.",
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

    const columns = [
    {
        key: "no",
        label: "No",
        render: (_, index) => index + 1,
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
    
            <div className="mt-6">
                {error ? (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={users}
                        loading={loading}
                    />
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