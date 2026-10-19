"use client";

import { useEffect, useState } from "react";
import paymentService from "@/services/paymentService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DataTable from "@/components/ui/DataTable";

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        paymentMethod: "",
        startDate: "",
        endDate: "",
        sortBy: "created_at",
        sortOrder: "desc",
    });

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedStatusPaymentId, setSelectedStatusPaymentId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        let active = true;

        const loadPayments = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await paymentService.getAll({
                    ...filters,
                    page,
                    limit,
                });

                if (!active) return;

                setPayments(response.data?.data || []);

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

                setPayments([]);
                setPagination({
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                });

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data pembayaran."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadPayments();

        return () => {
            active = false;
        };
    }, [filters, page, limit]);

    const handleOpenStatusDialog = (id, status) => {
        setSelectedStatusPaymentId(id);
        setSelectedStatus(status);
        setShowStatusDialog(true);
    };

    const handleStatusUpdate = async (id, status) => {
        setUpdatingId(id);
        setError("");

        try {
            const response = await paymentService.updateStatus(id, status);
            const updatedPayment = response.data?.data;

            setPayments((currentPayments) =>
                currentPayments.map((payment) =>
                    payment.id === id
                        ? { ...payment, ...updatedPayment }
                        : payment
                )
            );

            setToast({
                open: true,
                type: "success",
                message:
                    status === "paid"
                        ? "Pembayaran berhasil diperbarui."
                        : status === "refunded"
                            ? "Pengembalian dana berhasil dikonfirmasi."
                            : "Pembayaran berhasil ditolak.",
            });
        } catch (error) {
            setToast({
                open: true,
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Status pembayaran gagal diperbarui.",
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedPaymentId) {
            return;
        }

        try {
            setDeleteLoading(true);
            setError("");

            await paymentService.remove(selectedPaymentId);

            setPayments((currentPayments) =>
                currentPayments.filter(
                    (payment) => payment.id !== selectedPaymentId
                )
            );

            setShowDeleteDialog(false);
            setSelectedPaymentId(null);

            const statusMessages = {
                paid: "Pembayaran berhasil diverifikasi.",
                rejected: "Pembayaran berhasil ditolak.",
                refunded: "Pengembalian dana berhasil dikonfirmasi.",
            };

            setToast({
                open: true,
                type: "success",
                message:
                    statusMessages[status] ||
                    "Status pembayaran berhasil diperbarui.",
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Pembayaran gagal dihapus.";

            setShowDeleteDialog(false);
            setSelectedPaymentId(null);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price || 0);
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

    const formatDateTime = (date) => {
    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `http://localhost:5000${image.startsWith("/") ? "" : "/"}${image}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 text-yellow-600";

            case "paid":
                return "bg-green-50 text-green-600";

            case "rejected":
                return "bg-red-50 text-red-600";

            case "cancelled":
                return "bg-gray-100 text-gray-600";

            case "refund_pending":
                return "bg-orange-50 text-orange-600";

            case "refunded":
                return "bg-blue-50 text-blue-600";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Menunggu";

            case "paid":
                return "Dibayar";

            case "rejected":
                return "Ditolak";

            case "cancelled":
                return "Dibatalkan";

            case "refund_pending":
                return "Pengembalian Diproses";

            case "refunded":
                return "Pengembalian Berhasil";

            default:
                return status || "-";
        }
    };

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case "qris":
                return "QRIS";

            case "cash":
                return "Cash";

            default:
                return method || "-";
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));

        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({
            search: "",
            status: "",
            paymentMethod: "",
            startDate: "",
            endDate: "",
            sortBy: "created_at",
            sortOrder: "desc",
        });

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
            key: "booking_id",
            label: "Booking",
            render: (payment) => (
                <span className="font-medium text-gray-800">
                    Booking #{payment.booking_id}
                </span>
            ),
        },
        {
            key: "payment_method",
            label: "Metode",
            render: (payment) => (
                <span className="text-gray-600">
                    {getPaymentMethodLabel(payment.payment_method)}
                </span>
            ),
        },
        {
            key: "payment_proof",
            label: "Bukti",
            render: (payment) => {
                const imageUrl = getImageUrl(payment.payment_proof);

                return imageUrl ? (
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                    >
                        <img
                            src={imageUrl}
                            alt="Bukti pembayaran"
                            className="h-12 w-16 rounded-lg border border-gray-200 object-cover transition hover:opacity-80"
                        />
                    </a>
                ) : (
                    <span className="text-sm text-gray-400">
                        Tidak ada
                    </span>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            render: (payment) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                        payment.status
                    )}`}
                >
                    {getStatusLabel(payment.status)}
                </span>
            ),
        },
        {
            key: "verified_at",
            label: "Diverifikasi",
            render: (payment) => (
                <span className="text-gray-600">
                    {formatDateTime(payment.verified_at)}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Dibuat",
            render: (payment) => (
                <span className="text-gray-600">
                    {formatDate(payment.created_at)}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (payment) => (
                <div className="flex gap-2 whitespace-nowrap">
                    {!["refund_pending", "refunded"].includes(payment.status) && (
                    <>
                        <LinkButton
                            href={`/admin/payments/edit/${payment.id}`}
                        >
                            Edit
                        </LinkButton>

                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                setSelectedPaymentId(payment.id);
                                setShowDeleteDialog(true);
                            }}
                        >
                            Hapus
                        </Button>
                    </>
)}
                    {payment.status === "pending" && (
                        <>
                            <Button
                                type="button"
                                onClick={() =>
                                    handleOpenStatusDialog(payment.id, "paid")
                                }
                                disabled={updatingId === payment.id}
                            >
                                Terima
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                onClick={() =>
                                    handleOpenStatusDialog(payment.id, "rejected")
                                }
                                disabled={updatingId === payment.id}
                            >
                                Tolak
                            </Button>
                        </>
                    )}

                    {payment.status === "refund_pending" && (
                    <>
                        <Button
                            type="button"
                            onClick={() =>
                                handleOpenStatusDialog(payment.id, "refunded")
                            }
                            disabled={updatingId === payment.id}
                        >
                            Konfirmasi Refund
                        </Button>

                        <Button
                            type="button"
                            variant="danger"
                            onClick={() =>
                                handleOpenStatusDialog(payment.id, "paid")
                            }
                            disabled={updatingId === payment.id}
                        >
                            Batalkan Refund
                        </Button>
                    </>
                )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Payments
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola dan verifikasi pembayaran penyewaan kendaraan.
                    </p>
                </div>

                <LinkButton
                    href="/admin/payments/create"
                    variant="add"
                >
                    + Tambah Payment
                </LinkButton>
            </div>

            <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Cari pembayaran
                            </label>

                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) =>
                                    handleFilterChange("search", e.target.value)
                                }
                                placeholder="ID pembayaran, booking, atau nama..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status pembayaran
                            </label>

                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                            <option value="">Semua status</option>
                            <option value="pending">Menunggu</option>
                            <option value="paid">Dibayar</option>
                            <option value="rejected">Ditolak</option>
                            <option value="cancelled">Dibatalkan</option>
                            <option value="refund_pending">Menunggu Refund</option>
                            <option value="refunded">Dana Dikembalikan</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Metode pembayaran
                            </label>

                            <select
                                value={filters.paymentMethod}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "paymentMethod",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="">Semua metode</option>
                                <option value="qris">QRIS</option>
                                <option value="cash">Tunai</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Tanggal mulai
                            </label>

                            <input
                                type="date"
                                value={filters.startDate}
                                max={filters.endDate || undefined}
                                onChange={(e) =>
                                    handleFilterChange("startDate", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Tanggal akhir
                            </label>

                            <input
                                type="date"
                                value={filters.endDate}
                                min={filters.startDate || undefined}
                                onChange={(e) =>
                                    handleFilterChange("endDate", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Urutkan berdasarkan
                            </label>

                            <select
                                value={`${filters.sortBy}:${filters.sortOrder}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] =
                                        e.target.value.split(":");

                                    setFilters((current) => ({
                                        ...current,
                                        sortBy,
                                        sortOrder,
                                    }));

                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="created_at:desc">
                                    Tanggal terbaru
                                </option>
                                <option value="created_at:asc">
                                    Tanggal terlama
                                </option>
                                <option value="amount:desc">
                                    Nominal tertinggi
                                </option>
                                <option value="amount:asc">
                                    Nominal terendah
                                </option>
                                <option value="id:desc">
                                    ID terbesar
                                </option>
                                <option value="id:asc">
                                    ID terkecil
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                            Total {pagination.total} pembayaran
                        </p>

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
                    data={payments}
                    loading={loading}
                />

                {!loading && !error && pagination.totalPages > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Tampilkan</span>

                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded-lg border border-gray-300 px-2 py-1.5"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>

                            <span>data per halaman</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                Halaman {pagination.page} dari {pagination.totalPages}
                            </span>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={page <= 1}
                                onClick={() => setPage((current) => current - 1)}
                            >
                                Sebelumnya
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={page >= pagination.totalPages}
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
                title="Hapus Pembayaran?"
                description="Apakah kamu yakin ingin menghapus pembayaran ini? Data yang sudah dihapus tidak dapat dikembalikan."
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleteLoading) {
                        setShowDeleteDialog(false);
                        setSelectedPaymentId(null);
                    }
                }}
                loading={deleteLoading}
            />

            <ConfirmDialog
                open={showStatusDialog}
                type={
                    selectedStatus === "paid" ||
                    selectedStatus === "refunded"
                        ? "success"
                        : "danger"
                }
                title={
                    selectedStatus === "paid"
                        ? "Batalkan Proses Refund?"
                        : selectedStatus === "refunded"
                            ? "Konfirmasi Refund?"
                            : "Tolak Pembayaran?"
                }
                description={
                    selectedStatus === "paid"
                        ? "Apakah kamu yakin ingin membatalkan proses refund dan mengembalikan status pembayaran menjadi Dibayar?"
                        : selectedStatus === "refunded"
                            ? "Pastikan dana sudah benar-benar dikembalikan kepada pengguna sebelum mengonfirmasi refund."
                            : "Apakah kamu yakin ingin menolak pembayaran ini?"
                }
                confirmText={
                    selectedStatus === "paid"
                        ? "Ya, Batalkan Refund"
                        : selectedStatus === "refunded"
                            ? "Ya, Konfirmasi Refund"
                            : "Ya, Tolak"
                }
                cancelText="Batal"
                onConfirm={async () => {
                    await handleStatusUpdate(
                        selectedStatusPaymentId,
                        selectedStatus
                    );

                    setShowStatusDialog(false);
                    setSelectedStatusPaymentId(null);
                    setSelectedStatus(null);
                }}
                onCancel={() => {
                    if (updatingId !== selectedStatusPaymentId) {
                        setShowStatusDialog(false);
                        setSelectedStatusPaymentId(null);
                        setSelectedStatus(null);
                    }
                }}
                loading={updatingId === selectedStatusPaymentId}
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