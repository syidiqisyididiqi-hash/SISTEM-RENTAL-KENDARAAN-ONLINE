"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import paymentService from "@/services/paymentService";
import bookingService from "@/services/bookingService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import {
    AlertCircle,
    BadgeCheck,
    Banknote,
    CalendarDays,
    CreditCard,
    ExternalLink,
    FileImage,
    Pencil,
} from "lucide-react";

export default function EditPaymentPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id;

    const [bookings, setBookings] = useState([]);

    const [form, setForm] = useState({
        booking_id: "",
        payment_method: "bank_transfer",
        amount: "",
        payment_proof: "",
        status: "pending",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showUpdateDialog, setShowUpdateDialog] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        if (!id) {
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [paymentResponse, bookingsResponse] = await Promise.all([
                    paymentService.getById(id),
                    bookingService.getAll(),
                ]);

                const payment = paymentResponse.data?.data;
                const bookingData = bookingsResponse.data?.data || [];

                setBookings(bookingData);

                if (!payment) {
                    setError("Data pembayaran tidak ditemukan.");
                    return;
                }

                setForm({
                    booking_id: payment.booking_id || "",
                    payment_method: payment.payment_method || "bank_transfer",
                    amount: payment.amount || "",
                    payment_proof: payment.payment_proof || "",
                    status: payment.status || "pending",
                });
            } catch (error) {
                console.error("Error mengambil data pembayaran:", error);

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data pembayaran."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((current) => {
            if (name === "booking_id") {
                const selectedBooking = bookings.find(
                    (booking) => String(booking.id) === String(value)
                );

                return {
                    ...current,
                    booking_id: value,
                    amount: selectedBooking?.total_price || "",
                };
            }

            return {
                ...current,
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
        if (price === "" || price === null || price === undefined) {
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

        if (!form.booking_id) {
            setError("Booking wajib dipilih.");
            return;
        }

        if (!form.payment_method) {
            setError("Metode pembayaran wajib dipilih.");
            return;
        }

        if (!form.amount) {
            setError("Jumlah pembayaran tidak tersedia.");
            return;
        }

        if (!form.status) {
            setError("Status pembayaran wajib dipilih.");
            return;
        }

        setShowUpdateDialog(true);
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            setError("");

            await paymentService.update(id, {
                booking_id: Number(form.booking_id),
                payment_method: form.payment_method,
                amount: Number(form.amount),
                payment_proof: form.payment_proof || null,
                status: form.status,
            });

            setShowUpdateDialog(false);

            setToast({
                open: true,
                type: "success",
                message: "Payment berhasil diperbarui.",
            });

            setTimeout(() => {
                router.push("/admin/payments");
            }, 1500);
        } catch (error) {
            console.error("Error memperbarui payment:", error);

            setShowUpdateDialog(false);

            const message =
                error.response?.data?.message || "Gagal memperbarui payment.";

            setError(message);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl pb-10">
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xs">
                    <div className="mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="text-sm font-medium text-gray-600">
                        Memuat data pembayaran...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl pb-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                        <Pencil size={19} strokeWidth={2} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Edit Pembayaran
                            </h1>
                            {id && (
                                <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                    #{id}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            Ubah data dan status transaksi pembayaran.
                        </p>
                    </div>
                </div>
                
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                    {error && (
                        <div className="mx-6 mt-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 md:mx-8">
                            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                Detail Transaksi
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Sesuaikan booking, metode, dan status pembayaran.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Booking
                                </label>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="booking_id"
                                        value={form.booking_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    >
                                        <option value="">Pilih Booking</option>
                                        {bookings.map((booking) => (
                                            <option key={booking.id} value={booking.id}>
                                                #{booking.id} | {booking.user_name || "-"} | {booking.vehicle_name || "-"} | {formatDate(booking.start_date)} - {formatDate(booking.end_date)} | {booking.status} | {formatPrice(booking.total_price)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Metode Pembayaran
                                </label>
                                <div className="relative">
                                    <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="payment_method"
                                        value={form.payment_method}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    >
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cash">Cash</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Jumlah Pembayaran
                                </label>
                                <div className="relative">
                                    <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formatPrice(form.amount)}
                                        readOnly
                                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-800 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Bukti Pembayaran
                                </label>
                                <div className="relative">
                                    <FileImage className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="payment_proof"
                                        value={form.payment_proof}
                                        onChange={handleChange}
                                        placeholder="URL bukti pembayaran"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Status
                                </label>
                                <div className="relative">
                                    <BadgeCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    >
                                        <option value="pending">Menunggu</option>
                                        <option value="paid">Dibayar</option>
                                        <option value="rejected">Ditolak</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                            <LinkButton href="/admin/payments" variant="cancel">
                                Batal
                            </LinkButton>
                            <Button type="submit" variant="primary" loading={saving}>
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>
                </div>

                <aside className="h-fit overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Ringkasan Pembayaran
                        </h2>
                    </div>
                    <div className="space-y-4 p-5 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">Booking</span>
                            <span className="font-semibold text-gray-800">
                                {form.booking_id ? `#${form.booking_id}` : "-"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">Metode</span>
                            <span className="text-right font-medium text-gray-800">
                                {form.payment_method === "bank_transfer"
                                    ? "Bank Transfer"
                                    : "Cash"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">Status</span>
                            <span
                                className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                    form.status === "paid"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : form.status === "rejected"
                                          ? "border-rose-200 bg-rose-50 text-rose-700"
                                          : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                            >
                                {form.status === "paid"
                                    ? "Dibayar"
                                    : form.status === "rejected"
                                      ? "Ditolak"
                                      : "Menunggu"}
                            </span>
                        </div>

                        {form.payment_proof && (
                            <div className="border-t border-gray-100 pt-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Bukti Pembayaran
                                </p>
                                <a
                                    href={form.payment_proof}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex max-w-full items-center gap-2 break-all text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                    Lihat Lampiran
                                </a>
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Total Pembayaran
                            </p>
                            <p className="mt-1 break-words text-xl font-bold text-blue-700">
                                {formatPrice(form.amount)}
                            </p>
                        </div>
                    </div>
                </aside>
            </form>

            <ConfirmDialog
                open={showUpdateDialog}
                type="warning"
                title="Perbarui Payment?"
                description="Apakah kamu yakin ingin menyimpan perubahan data payment ini?"
                confirmText="Ya, Perbarui"
                cancelText="Batal"
                onConfirm={handleUpdate}
                onCancel={() => {
                    if (!saving) {
                        setShowUpdateDialog(false);
                    }
                }}
                loading={saving}
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