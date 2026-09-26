"use client";

import { useEffect, useState } from "react";
import bookingService from "@/services/bookingService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DataTable from "@/components/ui/DataTable";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const response = await bookingService.getAll();

                setBookings(response.data?.data || []);
                setError("");
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data booking."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

    const handleDelete = async () => {
        if (!selectedBookingId) {
            return;
        }

        try {
            setDeleteLoading(true);
            setError("");

            await bookingService.remove(selectedBookingId);

            setBookings((prevBookings) =>
                prevBookings.filter(
                    (booking) => booking.id !== selectedBookingId
                )
            );

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
            render: (_, index) => index + 1,
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

            <div className="mt-6">
                {error ? (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={bookings}
                        loading={loading}
                    />
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