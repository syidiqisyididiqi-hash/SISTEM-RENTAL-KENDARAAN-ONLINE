"use client";

import Link from "next/link";
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
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        const loadPayments = async () => {
            try {
                const response = await paymentService.getAll();

                setPayments(response.data?.data || []);
                setError("");
            } catch (error) {
                console.error(
                    "Error mengambil data pembayaran:",
                    error
                );

                setError("Gagal mengambil data pembayaran.");
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        setUpdatingId(id);
        setError("");
        setNotice("");

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
            setNotice(
                status === "paid"
                    ? "Pembayaran berhasil diverifikasi."
                    : "Pembayaran berhasil ditolak."
            );
        } catch (error) {
            console.error("Error memperbarui status pembayaran:", error);
            setError("Status pembayaran gagal diperbarui.");
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

            await paymentService.remove(selectedPaymentId);

            setPayments((currentPayments) =>
                currentPayments.filter(
                    (payment) => payment.id !== selectedPaymentId
                )
            );

            setShowDeleteDialog(false);
            setSelectedPaymentId(null);

            setToast({
                open: true,
                type: "success",
                message: "Pembayaran berhasil dihapus.",
            });
        } catch (error) {
            console.error("Error menghapus pembayaran:", error);

            setToast({
                open: true,
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Pembayaran gagal dihapus.",
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

    const getStatusStyle = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-50 text-yellow-600";

            case "paid":
                return "bg-green-50 text-green-600";

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

            case "paid":
                return "Dibayar";

            case "rejected":
                return "Ditolak";

            default:
                return status || "-";
        }
    };

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case "bank_transfer":
                return "Bank Transfer";

            case "cash":
                return "Cash";

            default:
                return method || "-";
        }
    };

    const columns = [
        {
            key: "no",
            label: "No",
            render: (_, index) => index + 1,
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
            key: "amount",
            label: "Jumlah",
            render: (payment) => (
                <span className="font-medium text-gray-800">
                    {formatPrice(payment.amount)}
                </span>
            ),
        },
        {
            key: "payment_proof",
            label: "Bukti Pembayaran",
            render: (payment) =>
                payment.payment_proof ? (
                    <a
                        href={payment.payment_proof}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                        Lihat Bukti
                    </a>
                ) : (
                    <span className="text-xs text-gray-400">
                        Tidak ada
                    </span>
                ),
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

                    {payment.status === "pending" && (
                        <>
                            <Button
                                type="button"
                                onClick={() =>
                                    handleStatusUpdate(
                                        payment.id,
                                        "paid"
                                    )
                                }
                                disabled={updatingId === payment.id}
                            >
                                {updatingId === payment.id
                                    ? "Memproses..."
                                    : "Terima"}
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                onClick={() =>
                                    handleStatusUpdate(
                                        payment.id,
                                        "rejected"
                                    )
                                }
                                disabled={updatingId === payment.id}
                            >
                                {updatingId === payment.id
                                    ? "Memproses..."
                                    : "Tolak"}
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

            <div className="mt-6">
                {error ? (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            ) : (
                <DataTable
                    columns={columns}
                    data={payments}
                    loading={loading}
                />
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