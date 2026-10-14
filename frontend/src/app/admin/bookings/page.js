"use client";

import { useEffect, useState } from "react";
import bookingService from "@/services/bookingService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DataTable from "@/components/ui/DataTable";
const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
        
    const initialFilters = {
        search: "",
        status: "",
        startDate: "",
        endDate: "",
        sortBy: "created_at",
        sortOrder: "desc",
    };

    const [filters, setFilters] = useState(initialFilters);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [refreshKey, setRefreshKey] = useState(0);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });
    
    useEffect(() => {
        let active = true;

        const loadBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await bookingService.getAll({
                    ...filters,
                    page,
                    limit,
                });

                if (!active) return;

                setBookings(response.data?.data || []);

                setPagination(
                    response.data?.pagination || {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0,
                    }
                );
            } catch (error) {
                if (!active) return;

                setBookings([]);
                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data booking."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadBookings();

        return () => {
            active = false;
        };
    }, [filters, page, limit, refreshKey]);
    
    const handleFilterChange = (name, value) => {
        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));

        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({ ...initialFilters });
        setPage(1);
        setLimit(10);
    };

    const handleDelete = async () => {
        if (!selectedBookingId) {
            return;
        }

        try {
            setDeleteLoading(true);
            setError("");

            await bookingService.remove(selectedBookingId);

            setRefreshKey((previous) => previous + 1);

            setShowDeleteDialog(false);
            setSelectedBookingId(null);

            setToast({
                open: true,
                type: "success",
                message: "Booking berhasil dihapus.",
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Gagal menghapus booking.";

            setShowDeleteDialog(false);
            setSelectedBookingId(null);

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

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price || 0);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 text-yellow-600";

            case "confirmed":
                return "bg-blue-50 text-blue-600";

            case "ongoing":
                return "bg-purple-50 text-purple-600";

            case "completed":
                return "bg-green-50 text-green-600";

            case "cancelled":
                return "bg-gray-100 text-gray-600";

            case "rejected":
                return "bg-red-50 text-red-600";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Menunggu";

            case "confirmed":
                return "Dikonfirmasi";

            case "ongoing":
                return "Sedang Berlangsung";

            case "completed":
                return "Selesai";

            case "cancelled":
                return "Dibatalkan";

            case "rejected":
                return "Ditolak";

            default:
                return status || "-";
        }
    };

    const columns = [
        {
            key: "no",
            label: "No",
            render: (_, index) => (page - 1) * limit + index + 1,
        },
        {
            key: "user",
            label: "User",
            render: (booking) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {booking.user_name}
                    </p>

                    <p className="text-xs text-gray-500">
                        User ID: {booking.user_id}
                    </p>
                </div>
            ),
        },
        {
            key: "vehicle",
            label: "Kendaraan",
            render: (booking) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {booking.vehicle_name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {booking.brand} {booking.model || ""}
                    </p>
                </div>
            ),
        },
        {
            key: "period",
            label: "Periode",
            render: (booking) => (
                <div className="whitespace-nowrap">
                    <p className="text-gray-800">
                        {formatDate(booking.start_date)}
                    </p>

                    <p className="text-xs text-gray-500">
                        sampai {formatDate(booking.end_date)}
                    </p>
                </div>
            ),
        },
        {
            key: "total_days",
            label: "Hari",
            render: (booking) => (
                <span className="whitespace-nowrap">
                    {booking.total_days} hari
                </span>
            ),
        },
        {
            key: "price_per_day",
            label: "Harga / Hari",
            render: (booking) => (
                <span className="whitespace-nowrap">
                    {formatPrice(booking.price_per_day)}
                </span>
            ),
        },
        {
            key: "total_price",
            label: "Total",
            render: (booking) => (
                <span className="whitespace-nowrap font-medium text-gray-800">
                    {formatPrice(booking.total_price)}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (booking) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                        booking.status
                    )}`}
                >
                    {getStatusLabel(booking.status)}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (booking) => (
                <div className="flex gap-2">
                    <LinkButton
                        href={`/admin/bookings/edit/${booking.id}`}
                    >
                        Edit
                    </LinkButton>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                            setSelectedBookingId(booking.id);
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
                        Bookings
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola data penyewaan kendaraan.
                    </p>
                </div>

                <LinkButton
                    href="/admin/bookings/create"
                    variant="add"
                >
                    + Tambah Booking
                </LinkButton>
            </div>
            
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Cari booking
                        </label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Nama user, kendaraan, atau ID booking..."
                            value={filters.search}
                            onChange={(event) =>
                                handleFilterChange("search", event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Status booking
                        </label>
                        <select
                            className={inputClass}
                            value={filters.status}
                            onChange={(event) =>
                                handleFilterChange("status", event.target.value)
                            }
                        >
                            <option value="">Semua status</option>
                            <option value="pending">Menunggu</option>
                            <option value="confirmed">Dikonfirmasi</option>
                            <option value="ongoing">Sedang Berlangsung</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Data per halaman
                        </label>
                        <select
                            className={inputClass}
                            value={limit}
                            onChange={(event) => {
                                setLimit(Number(event.target.value));
                                setPage(1);
                            }}
                        >
                            <option value={10}>10 data</option>
                            <option value={25}>25 data</option>
                            <option value={50}>50 data</option>
                            <option value={100}>100 data</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Tanggal mulai dari
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={filters.startDate}
                            max={filters.endDate || undefined}
                            onChange={(event) =>
                                handleFilterChange("startDate", event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Tanggal mulai sampai
                        </label>
                        <input
                            type="date"
                            className={inputClass}
                            value={filters.endDate}
                            min={filters.startDate || undefined}
                            onChange={(event) =>
                                handleFilterChange("endDate", event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Urutkan berdasarkan
                        </label>
                        <select
                            className={inputClass}
                            value={filters.sortBy}
                            onChange={(event) =>
                                handleFilterChange("sortBy", event.target.value)
                            }
                        >
                            <option value="created_at">Tanggal dibuat</option>
                            <option value="start_date">Tanggal mulai</option>
                            <option value="total_price">Total harga</option>
                            <option value="total_days">Lama sewa</option>
                            <option value="user_name">Nama user</option>
                            <option value="vehicle_name">Nama kendaraan</option>
                            <option value="id">ID booking</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Urutan
                        </label>
                        <select
                            className={inputClass}
                            value={filters.sortOrder}
                            onChange={(event) =>
                                handleFilterChange("sortOrder", event.target.value)
                            }
                        >
                            <option value="desc">Terbaru / terbesar</option>
                            <option value="asc">Terlama / terkecil</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Total hasil:{" "}
                        <span className="font-semibold text-gray-800">
                            {pagination.total}
                        </span>{" "}
                        booking
                    </p>

                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={bookings}
                    loading={loading}
                />

                {error && (
                    <p className="mt-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {!loading && !error && pagination.total > 0 && (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-600">
                            Menampilkan{" "}
                            {Math.min((page - 1) * limit + 1, pagination.total)}
                            {"–"}
                            {Math.min(page * limit, pagination.total)}
                            {" dari "}
                            {pagination.total} booking
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={page <= 1}
                                onClick={() => setPage((previous) => previous - 1)}
                            >
                                Sebelumnya
                            </Button>

                            <span className="whitespace-nowrap text-sm text-gray-600">
                                Halaman {page} dari {pagination.totalPages}
                            </span>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage((previous) => previous + 1)}
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
                title="Hapus Booking?"
                description="Apakah kamu yakin ingin menghapus booking ini? Data yang sudah dihapus tidak dapat dikembalikan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleteLoading) {
                        setShowDeleteDialog(false);
                        setSelectedBookingId(null);
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