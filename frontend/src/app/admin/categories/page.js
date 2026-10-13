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

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [refreshKey, setRefreshKey] = useState(0);

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
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

                const response = await categoryService.getAll({
                    search: search.trim(),
                    sortBy,
                    sortOrder,
                    page,
                    limit,
                });

                if (!isActive) return;

                setCategories(response.data?.data || []);
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

                console.error("Error mengambil data kategori:", error);
                setError(
                    error.response?.data?.message ||
                    "Gagal mengambil data kategori."
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
    }, [search, sortBy, sortOrder, page, limit, refreshKey]);

    const handleDelete = async () => {
        if (!selectedCategoryId) {
            return;
        }

        try {
            setDeleteLoading(true);

            await categoryService.delete(selectedCategoryId);

            if (categories.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
            } else {
                setRefreshKey((current) => current + 1);
            }
            setShowDeleteDialog(false);
            setSelectedCategoryId(null);

            setToast({
                open: true,
                type: "success",
                message: "Kategori berhasil dihapus.",
            });
        } catch (error) {

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

    const handleResetFilters = () => {
        setSearch("");
        setSortBy("id");
        setSortOrder("asc");
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
            
            <div className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="category-search"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Cari Kategori
                        </label>

                        <input
                            id="category-search"
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari nama kategori..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="category-sort"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Urutkan Berdasarkan
                        </label>

                        <select
                            id="category-sort"
                            value={sortBy}
                            onChange={(event) => {
                                setSortBy(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="id">ID</option>
                            <option value="name">Nama Kategori</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="category-sort-order"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Urutan
                        </label>

                        <select
                            id="category-sort-order"
                            value={sortOrder}
                            onChange={(event) => {
                                setSortOrder(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="asc">Menaik (ASC)</option>
                            <option value="desc">Menurun (DESC)</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="category-limit"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Data per Halaman
                        </label>

                        <select
                            id="category-limit"
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
                        data={categories}
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
                            {pagination.total} kategori
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
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
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
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