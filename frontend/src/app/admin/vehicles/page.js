"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import vehicleService from "@/services/vehicleService";
import categoryService from "@/services/categoryService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DataTable from "@/components/ui/DataTable";

const getImageUrl = (image) => {
    if (!image) {
        return "";
    }

    if (typeof image === "string") {
        const imagePath = image.trim();

        if (!imagePath || imagePath === "[object Object]") {
            return "";
        }

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }

        const normalizedPath = imagePath.replace(/^[/\\]+/, "");

        const uploadPath = normalizedPath.startsWith("uploads/")
            ? normalizedPath
            : `uploads/vehicles/${normalizedPath}`;

        return `http://localhost:5000/${uploadPath}`;
    }

    if (typeof image === "object") {
        const possibleKeys = [
            "url",
            "image_url",
            "imageUrl",
            "path",
            "filepath",
            "filePath",
            "filename",
            "fileName",
            "src",
            "image",
        ];

        for (const key of possibleKeys) {
            const value = image[key];

            if (
                typeof value === "string" &&
                value.trim() !== ""
            ) {
                const imagePath = value.trim();

                if (
                    imagePath.startsWith("http://") ||
                    imagePath.startsWith("https://")
                ) {
                    return imagePath;
                }

                const normalizedPath =
                    imagePath.replace(/^[/\\]+/, "");

                const uploadPath =
                    normalizedPath.startsWith("uploads/")
                        ? normalizedPath
                        : `uploads/vehicles/${normalizedPath}`;

                return `http://localhost:5000/${uploadPath}`;
            }
        }

        return "";
    }

    return "";
};

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [failedImages, setFailedImages] = useState(new Set());
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [refreshKey, setRefreshKey] = useState(0);

    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        let isActive = true;

        const loadVehicles = async () => {
            try {
                setLoading(true);

                const response = await vehicleService.getAll({
                    search: search.trim(),
                    categoryId,
                    status,
                    sortBy,
                    sortOrder,
                    page,
                    limit,
                });

                if (!isActive) return;

                setVehicles(response.data?.data || []);
                setPagination(
                    response.data?.pagination || {
                        total: 0,
                        page: 1,
                        limit,
                        totalPages: 0,
                    }
                );
                setError("");
            } catch (error) {
                if (!isActive) return;

                setVehicles([]);
                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data kendaraan."
                );
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        const timeout = setTimeout(loadVehicles, 300);

        return () => {
            isActive = false;
            clearTimeout(timeout);
        };
    }, [
        search,
        categoryId,
        status,
        sortBy,
        sortOrder,
        page,
        limit,
        refreshKey,
    ]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await categoryService.getAll();
                setCategories(response.data?.data || []);
            } catch (error) {
                console.error("Gagal mengambil kategori:", error);
            }
        };

        loadCategories();
    }, []);

    const handleResetFilters = () => {
        setSearch("");
        setCategoryId("");
        setStatus("");
        setSortBy("id");
        setSortOrder("desc");
        setPage(1);
        setLimit(10);
    };

    const handleDelete = async () => {
        if (!selectedVehicle) {
            return;
        }

        try {
            setDeletingId(selectedVehicle.id);
            setError("");

            await vehicleService.remove(selectedVehicle.id);

            if (vehicles.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
            } else {
                setRefreshKey((current) => current + 1);
            }

            setShowDeleteDialog(false);
            setSelectedVehicle(null);

            setToast({
                open: true,
                type: "success",
                message: "Kendaraan berhasil dihapus.",
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Gagal menghapus kendaraan.";

            setShowDeleteDialog(false);
            setSelectedVehicle(null);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setDeletingId(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price || 0);
    };

    const columns = [
        {
            key: "no",
            label: "No",
            render: (_, index) => (page - 1) * limit + index + 1,
        },
        {
            key: "image",
            label: "Foto",
            render: (vehicle) => {
                const imageUrl = getImageUrl(vehicle.image);

                return imageUrl &&
                    !failedImages.has(vehicle.id) ? (
                    <Image
                        src={imageUrl}
                        alt={vehicle.name || "Foto kendaraan"}
                        width={80}
                        height={56}
                        unoptimized
                        className="h-14 w-20 rounded-lg border border-gray-200 object-cover"
                        onError={() => {
                            setFailedImages((current) => {
                                const updated = new Set(current);
                                updated.add(vehicle.id);
                                return updated;
                            });
                        }}
                    />
                ) : (
                    <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        No Image
                    </div>
                );
            },
        },
        {
            key: "name",
            label: "Kendaraan",
            render: (vehicle) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {vehicle.name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {vehicle.brand} {vehicle.model || ""}
                        {vehicle.year
                            ? ` • ${vehicle.year}`
                            : ""}
                    </p>
                </div>
            ),
        },
        {
            key: "category_name",
            label: "Kategori",
            render: (vehicle) => (
                <span className="text-gray-600">
                    {vehicle.category_name || "-"}
                </span>
            ),
        },
        {
            key: "license_plate",
            label: "Plat Nomor",
            render: (vehicle) => (
                <span className="font-medium text-gray-700">
                    {vehicle.license_plate || "-"}
                </span>
            ),
        },
        {
            key: "price_per_day",
            label: "Harga / Hari",
            render: (vehicle) => (
                <span className="text-gray-600">
                    {formatPrice(vehicle.price_per_day)}
                </span>
            ),
        },
        {
            key: "stock",
            label: "Stok",
            render: (vehicle) => (
                <span className="font-medium text-gray-700">
                    {vehicle.stock ?? 0} unit
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (vehicle) =>
                vehicle.status === "available" ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                        Tersedia
                    </span>
                ) : vehicle.status === "rented" ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        Disewa
                    </span>
                ) : (
                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-600">
                        Dalam Perawatan
                    </span>
                ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (vehicle) => (
                <div className="flex gap-2">
                    <LinkButton
                        href={`/admin/vehicles/edit/${vehicle.id}`}
                    >
                        Edit
                    </LinkButton>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowDeleteDialog(true);
                        }}
                        disabled={deletingId === vehicle.id}
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
                        Vehicles
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola data kendaraan.
                    </p>
                </div>

                <LinkButton
                    href="/admin/vehicles/create"
                    variant="add"
                >
                    + Tambah Kendaraan
                </LinkButton>
            </div>

            <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Cari Kendaraan
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Nama, merek, model, atau plat nomor..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Kategori
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="available">Tersedia</option>
                                <option value="rented">Disewa</option>
                                <option value="maintenance">Dalam Perawatan</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Urutkan Berdasarkan
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="id">ID Kendaraan</option>
                                <option value="name">Nama</option>
                                <option value="brand">Merek</option>
                                <option value="price_per_day">Harga per Hari</option>
                                <option value="stock">Stok</option>
                                <option value="created_at">Tanggal Dibuat</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Urutan
                            </label>
                            <select
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            >
                                <option value="desc">Terbaru / Terbesar</option>
                                <option value="asc">Terlama / Terkecil</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Data per Halaman
                            </label>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            >
                                <option value={10}>10 Data</option>
                                <option value={25}>25 Data</option>
                                <option value={50}>50 Data</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleResetFilters}
                        >
                            Reset Filter
                        </Button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <DataTable
                    columns={columns}
                    data={vehicles}
                    loading={loading}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        {pagination.total === 0
                            ? "Tidak ada data kendaraan"
                            : `Menampilkan ${
                                (page - 1) * limit + 1
                            }–${Math.min(
                                page * limit,
                                pagination.total
                            )} dari ${pagination.total} kendaraan`}
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            Sebelumnya
                        </Button>

                        <span className="text-sm text-gray-600">
                            Halaman {page} dari {Math.max(1, pagination.totalPages)}
                        </span>

                        <Button
                            type="button"
                            variant="secondary"
                            disabled={
                                page >= pagination.totalPages || loading
                            }
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={showDeleteDialog}
                type="danger"
                title="Hapus Kendaraan?"
                description={
                    selectedVehicle
                        ? `Apakah kamu yakin ingin menghapus kendaraan "${selectedVehicle.name}"? Data yang sudah dihapus tidak dapat dikembalikan.`
                        : "Apakah kamu yakin ingin menghapus kendaraan ini?"
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deletingId) {
                        setShowDeleteDialog(false);
                        setSelectedVehicle(null);
                    }
                }}
                loading={!!deletingId}
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