"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import paymentService from "@/services/paymentService";
import bookingService from "@/services/bookingService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import LinkButton from "@/components/ui/LinkButton";
import Button from "@/components/ui/Button";

export default function CreatePaymentPage() {
    const router = useRouter();

    const [bookings, setBookings] = useState([]);

    const [formData, setFormData] = useState({
        booking_id: "",
        payment_method: "bank_transfer",
        amount: "",
        payment_proof: "",
        status: "pending",
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    const [showSaveDialog, setShowSaveDialog] = useState(false);

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
            } catch (error) {
                console.error(
                    "Error mengambil data booking:",
                    error
                );

                setError("Gagal mengambil data booking.");
            } finally {
                setLoadingData(false);
            }
        };

        loadBookings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "booking_id") {
                const selectedBooking = bookings.find(
                    (booking) =>
                        String(booking.id) === String(value)
                );

                return {
                    ...prev,
                    booking_id: value,
                    amount:
                        selectedBooking?.total_price || "",
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString("id-ID");
    };

    const formatPrice = (price) => {
        if (
            price === "" ||
            price === null ||
            price === undefined
        ) {
            return "-";
        }

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(price) || 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");

        if (!formData.booking_id) {
            setError("Booking wajib dipilih.");
            return;
        }

        if (!formData.payment_method) {
            setError("Metode pembayaran wajib dipilih.");
            return;
        }

        if (!formData.amount) {
            setError("Jumlah pembayaran tidak tersedia.");
            return;
        }

        if (!formData.status) {
            setError("Status pembayaran wajib dipilih.");
            return;
        }

        setShowSaveDialog(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError("");

            await paymentService.create({
                booking_id: Number(formData.booking_id),
                payment_method: formData.payment_method,
                amount: Number(formData.amount),
                payment_proof:
                    formData.payment_proof || null,
                status: formData.status,
            });

            setShowSaveDialog(false);

            setToast({
                open: true,
                type: "success",
                message: "Payment berhasil ditambahkan.",
            });

            setTimeout(() => {
                router.push("/admin/payments");
            }, 1500);
        } catch (error) {
            console.error(
                "Error menambahkan payment:",
                error
            );

            setShowSaveDialog(false);

            const message =
                error.response?.data?.message ||
                "Gagal menambahkan payment.";

            setError(message);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="mx-auto max-w-4xl pb-10">
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xs">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-sm font-medium text-gray-500">
                        Memuat data booking...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl pb-10">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                            Tambah Payment
                        </h1>
                        <p className="text-sm text-gray-500">
                            Tambahkan data pembayaran baru ke dalam sistem.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    <svg
                        className="h-5 w-5 shrink-0 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition-all"
            >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
                            <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Detail Transaksi
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Pilih Booking{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="booking_id"
                                            value={formData.booking_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                        >
                                            <option value="">
                                                Pilih Booking
                                            </option>

                                            {bookings.map((booking) => (
                                                <option
                                                    key={booking.id}
                                                    value={booking.id}
                                                >
                                                    #{booking.id} |{" "}
                                                    {booking.user_name ||
                                                        "-"}{" "}
                                                    |{" "}
                                                    {booking.vehicle_name ||
                                                        "-"}{" "}
                                                    |{" "}
                                                    {formatDate(
                                                        booking.start_date
                                                    )}{" "}
                                                    -{" "}
                                                    {formatDate(
                                                        booking.end_date
                                                    )}{" "}
                                                    | {booking.status} |{" "}
                                                    {formatPrice(
                                                        booking.total_price
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Metode Pembayaran{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="payment_method"
                                                value={formData.payment_method}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                            >
                                                <option value="bank_transfer">
                                                    Bank Transfer
                                                </option>
                                                <option value="cash">
                                                    Cash
                                                </option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Status{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                            >
                                                <option value="pending">
                                                    Menunggu
                                                </option>
                                                <option value="paid">
                                                    Dibayar
                                                </option>
                                                <option value="rejected">
                                                    Ditolak
                                                </option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Jumlah Pembayaran
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formatPrice(
                                                formData.amount
                                            )}
                                            readOnly
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-800 outline-none"
                                            placeholder="Pilih booking terlebih dahulu"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Otomatis terisi berdasarkan total harga dari booking yang dipilih.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Bukti Pembayaran
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="payment_proof"
                                            value={
                                                formData.payment_proof
                                            }
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                            placeholder="https://example.com/bukti-pembayaran.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
                            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Rincian Ringkasan
                            </h2>

                            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        Booking
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        {formData.booking_id
                                            ? `#${formData.booking_id}`
                                            : "-"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        Metode
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                                        {formData.payment_method ===
                                        "bank_transfer"
                                            ? "Bank Transfer"
                                            : "Cash"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">
                                        Status
                                    </span>
                                    <span className="font-medium capitalize text-gray-800">
                                        {formData.status}
                                    </span>
                                </div>

                                <div className="my-2 border-t border-gray-200" />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        Total Tagihan
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatPrice(formData.amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                                <LinkButton
                                    href="/admin/payments"
                                    variant="cancel"
                                    className="justify-center"
                                >
                                    Batal
                                </LinkButton>

                                <Button
                                    type="submit"
                                    variant="success"
                                    loading={loading}
                                    className="justify-center"
                                >
                                    Simpan Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <ConfirmDialog
                open={showSaveDialog}
                type="success"
                title="Simpan Payment?"
                description="Apakah kamu yakin ingin menyimpan data payment ini?"
                confirmText="Ya, Simpan"
                cancelText="Batal"
                onConfirm={handleSave}
                onCancel={() => {
                    if (!loading) {
                        setShowSaveDialog(false);
                    }
                }}
                loading={loading}
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