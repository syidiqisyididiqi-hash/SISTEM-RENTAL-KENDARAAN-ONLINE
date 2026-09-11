"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import paymentService from "@/services/paymentService";

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [notice, setNotice] = useState("");

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

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus pembayaran ini?"
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(id);
        setError("");
        setNotice("");

        try {
            await paymentService.remove(id);
            setPayments((currentPayments) =>
                currentPayments.filter((payment) => payment.id !== id)
            );
            setNotice("Pembayaran berhasil dihapus.");
        } catch (error) {
            console.error("Error menghapus pembayaran:", error);
            setError(
                error.response?.data?.message ||
                    "Pembayaran gagal dihapus."
            );
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
                return "Pending";

            case "paid":
                return "Paid";

            case "rejected":
                return "Rejected";

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

                <Link
                    href="/admin/payments/create"
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    + Tambah Payment
                </Link>
            </div>

            <div className="mt-6">
                {loading && (
                    <p className="text-sm text-gray-500">
                        Memuat data pembayaran...
                    </p>
                )}

                {error && (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                )}

                {notice && (
                    <p className="mb-4 text-sm text-green-600">
                        {notice}
                    </p>
                )}

                {!loading && !error && (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-left text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            ID
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Booking
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Metode
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Jumlah
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Bukti Pembayaran
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Status
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Diverifikasi
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Dibuat
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payments.length > 0 ? (
                                        payments.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-6 py-4">
                                                    #{payment.id}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-800">
                                                        Booking #
                                                        {payment.booking_id}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {getPaymentMethodLabel(
                                                        payment.payment_method
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    {formatPrice(
                                                        payment.amount
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {payment.payment_proof ? (
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
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                            payment.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            payment.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatDateTime(
                                                        payment.verified_at
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatDate(
                                                        payment.created_at
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 whitespace-nowrap">
                                                        <Link
                                                            href={`/admin/payments/edit/${payment.id}`}
                                                            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                                        >
                                                            Edit
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    payment.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                payment.id
                                                            }
                                                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {deletingId ===
                                                            payment.id
                                                                ? "Menghapus..."
                                                                : "Hapus"}
                                                        </button>

                                                        {payment.status === "pending" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleStatusUpdate(
                                                                            payment.id,
                                                                            "paid"
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        updatingId ===
                                                                        payment.id
                                                                    }
                                                                    className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    Terima
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleStatusUpdate(
                                                                            payment.id,
                                                                            "rejected"
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        updatingId ===
                                                                        payment.id
                                                                    }
                                                                    className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    Tolak
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="px-6 py-8 text-center text-gray-500"
                                            >
                                                Belum ada pembayaran.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}