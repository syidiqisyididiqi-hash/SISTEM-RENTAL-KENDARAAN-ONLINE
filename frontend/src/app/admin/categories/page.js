"use client";

import { useEffect, useState } from "react";
import categoryService from "@/services/categoryService";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await categoryService.getAll();

                setCategories(response.data?.data || []);
                setError("");
            } catch (error) {
                console.error("Error mengambil data kategori:", error);
                setError("Gagal mengambil data kategori.");
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    const handleDelete = async () => {
        if (!selectedCategoryId) {
            return;
        }

        try {
            setDeleteLoading(true);

            await categoryService.delete(selectedCategoryId);

            setCategories((prevCategories) =>
                prevCategories.filter(
                    (category) =>
                        category.id !== selectedCategoryId
                )
            );

            setShowDeleteDialog(false);
            setSelectedCategoryId(null);

            setToast({
                open: true,
                type: "success",
                message: "Kategori berhasil dihapus.",
            });
        } catch (error) {
            console.error("Error menghapus kategori:", error);

            const message =
                error.response?.data?.message ||
                "Gagal menghapus kategori.";

            setShowDeleteDialog(false);
            setSelectedCategoryId(null);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setDeleteLoading(false);
        }
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
            render: (category) => (
                <span className="font-medium text-gray-800">
                    {category.name}
                </span>
            ),
        },
        {
            key: "description",
            label: "Deskripsi",
            render: (category) => (
                <p className="max-w-[400px] truncate text-gray-600">
                    {category.description || "-"}
                </p>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (category) => (
                <div className="flex gap-2">
                    <LinkButton
                        href={`/admin/categories/edit/${category.id}`}
                    >
                        Edit
                    </LinkButton>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                            setSelectedCategoryId(category.id);
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
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola kategori kendaraan.
                    </p>
                </div>

                <LinkButton
                    href="/admin/categories/create"
                    variant="add"
                >
                    + Tambah Kategori
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
                        data={categories}
                        loading={loading}
                    />
                )}
            </div>

            <ConfirmDialog
                open={showDeleteDialog}
                type="danger"
                title="Hapus Kategori?"
                description="Apakah kamu yakin ingin menghapus kategori ini? Data yang sudah dihapus tidak dapat dikembalikan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleteLoading) {
                        setShowDeleteDialog(false);
                        setSelectedCategoryId(null);
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