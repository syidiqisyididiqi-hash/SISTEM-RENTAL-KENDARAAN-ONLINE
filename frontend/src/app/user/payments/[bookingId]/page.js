"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CarFront,
    CheckCircle2,
    CreditCard,
    Upload,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import bookingService from "@/services/bookingService";
import paymentService from "@/services/paymentService";
import paymentSettingService from "@/services/paymentSettingService";

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

    return `http://localhost:5000/${image.replace(/^\//, "")}`;
};

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

const formatDate = (date) => {
    if (!date) {
        return "-";
    }

    let parsedDate;

    if (date instanceof Date) {
        parsedDate = date;
    } else if (
        typeof date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        const [year, month, day] = date.split("-").map(Number);
        parsedDate = new Date(year, month - 1, day);
    } else {
        parsedDate = new Date(date);
    }

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(parsedDate);
};

function PaymentPage() {
    const params = useParams();
    const router = useRouter();

    const bookingId = params.bookingId;

    const [booking, setBooking] = useState(null);
    const [qrisImage, setQrisImage] = useState(null);

    const [paymentMethod, setPaymentMethod] =
        useState("qris");

    const [paymentProof, setPaymentProof] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    useEffect(() => {
        if (!bookingId) {
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    bookingResponse,
                    paymentSettingResponse,
                ] = await Promise.all([
                    bookingService.getMineById(
                        bookingId
                    ),
                    paymentSettingService.get(),
                ]);

                setBooking(
                    bookingResponse.data?.data ||
                        null
                );

                setQrisImage(
                    paymentSettingResponse.data?.data
                        ?.qris_image_url || null
                );
            } catch (requestError) {
                setError(
                    requestError.response?.data
                        ?.message ||
                        "Gagal memuat data pembayaran."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingId]);

    const handleFileChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            setPaymentProof(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Bukti pembayaran harus berupa JPG, PNG, atau WEBP."
            );

            event.target.value = "";
            setPaymentProof(null);

            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Ukuran bukti pembayaran maksimal 5 MB."
            );

            event.target.value = "";
            setPaymentProof(null);

            return;
        }

        setError("");
        setPaymentProof(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!paymentProof) {
            setError(
                "Silakan upload bukti pembayaran terlebih dahulu."
            );
            return;
        }

        if (!booking) {
            setError(
                "Data booking tidak ditemukan."
            );
            return;
        }

        try {
            setSubmitting(true);

            const formData =
                new FormData();

            formData.append(
                "booking_id",
                booking.id
            );

            formData.append(
                "payment_method",
                paymentMethod
            );

            formData.append(
                "amount",
                booking.total_price
            );

            formData.append(
                "payment_proof",
                paymentProof
            );

            await paymentService.submitProof(
                formData
            );

            setSuccess(
                "Pembayaran berhasil dikirim dan sedang menunggu verifikasi admin."
            );

            setTimeout(() => {
                router.push(
                    `/user/bookings/${booking.id}`
                );
            }, 1200);
        } catch (requestError) {
            setError(
                requestError.response?.data
                    ?.message ||
                    "Pembayaran gagal dikirim. Silakan coba lagi."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
                Memuat halaman pembayaran...
            </main>
        );
    }

    if (!booking) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm text-red-700">
                        {error ||
                            "Booking tidak ditemukan."}
                    </p>

                    <Link
                        href="/user/bookings"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke booking
                    </Link>
                </div>
            </main>
        );
    }

    const vehicle =
        booking.vehicle || {};

    const imageUrl =
        getImageUrl(vehicle.image);

    const totalPrice =
        Number(
            booking.total_price ??
                booking.total_amount ??
                booking.amount
        ) || 0;

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
                href={`/user/bookings/${booking.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke detail booking
            </Link>

            <div className="mb-6 mt-6">
                <p className="text-sm font-semibold text-blue-700">
                    PEMBAYARAN
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                    Selesaikan pembayaran
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Lakukan pembayaran sesuai total booking,
                    kemudian upload bukti pembayaran.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                    <span>{success}</span>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
                            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={
                                            vehicle.name ||
                                            "Kendaraan"
                                        }
                                        fill
                                        sizes="112px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <CarFront className="absolute inset-0 m-auto h-9 w-9 text-gray-300" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <h2 className="truncate font-semibold text-gray-900">
                                    {vehicle.name ||
                                        "Kendaraan"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Booking #
                                    {booking.id}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <CalendarDays className="h-4 w-4" />
                                    Tanggal mulai
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    {formatDate(
                                        booking.start_date
                                    )}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <CalendarDays className="h-4 w-4" />
                                    Tanggal selesai
                                </div>

                                <p className="mt-2 text-sm font-semibold text-gray-900">
                                    {formatDate(
                                        booking.end_date
                                    )}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-blue-700" />

                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    Metode pembayaran
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Pilih metode pembayaran.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <label
                                className={`cursor-pointer rounded-lg border p-4 transition ${
                                    paymentMethod ===
                                    "qris"
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="qris"
                                    checked={
                                        paymentMethod ===
                                        "qris"
                                    }
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value
                                        )
                                    }
                                    className="sr-only"
                                />

                                <span className="block text-sm font-semibold text-gray-900">
                                    QRIS
                                </span>

                                <span className="mt-1 block text-xs text-gray-500">
                                    Bayar menggunakan QRIS.
                                </span>
                            </label>

                            <label
                                className={`cursor-pointer rounded-lg border p-4 transition ${
                                    paymentMethod ===
                                    "cash"
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cash"
                                    checked={
                                        paymentMethod ===
                                        "cash"
                                    }
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value
                                        )
                                    }
                                    className="sr-only"
                                />

                                <span className="block text-sm font-semibold text-gray-900">
                                    Cash
                                </span>

                                <span className="mt-1 block text-xs text-gray-500">
                                    Bayar secara tunai.
                                </span>
                            </label>

                            <label
                                className={`cursor-pointer rounded-lg border p-4 transition ${
                                    paymentMethod ===
                                    "bank_transfer"
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="bank_transfer"
                                    checked={
                                        paymentMethod ===
                                        "bank_transfer"
                                    }
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value
                                        )
                                    }
                                    className="sr-only"
                                />

                                <span className="block text-sm font-semibold text-gray-900">
                                    Mandiri
                                </span>

                                <span className="mt-1 block text-xs text-gray-500">
                                    Transfer melalui Bank Mandiri.
                                </span>
                            </label>
                        </div>
                    </section>

                    {paymentMethod === "qris" && (
                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="font-semibold text-gray-900">
                                QRIS Pembayaran
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Scan QRIS berikut menggunakan aplikasi
                                pembayaran kamu.
                            </p>

                            {qrisImage ? (
                                <div className="mx-auto mt-5 relative h-64 w-64 rounded-xl border border-gray-200 bg-white p-3">
                                    <Image
                                        src={qrisImage}
                                        alt="QRIS pembayaran"
                                        fill
                                        unoptimized
                                        className="object-contain p-3"
                                    />
                                </div>
                            ) : (
                                <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                                    QRIS belum tersedia.
                                </div>
                            )}
                        </section>
                    )}

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="font-semibold text-gray-900">
                            Bukti pembayaran
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Upload screenshot atau foto bukti pembayaran.
                        </p>

                        <label
                            htmlFor="payment_proof"
                            className="relative mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
                        >
                            <Upload className="h-8 w-8 text-gray-400" />

                            <span className="mt-3 text-sm font-semibold text-gray-700">
                                {paymentProof
                                    ? paymentProof.name
                                    : "Pilih bukti pembayaran"}
                            </span>

                            <span className="mt-1 text-xs text-gray-500">
                                JPG, PNG, WEBP maksimal 5 MB
                            </span>

                            <input
                                id="payment_proof"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                name="payment_proof"
                                required
                                onChange={handleFileChange}
                                disabled={submitting}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            {submitting
                                ? "Mengirim pembayaran..."
                                : "Kirim bukti pembayaran"}
                        </button>
                    </section>
                </form>

                <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-semibold text-gray-900">
                        Ringkasan pembayaran
                    </h2>

                    <div className="mt-5 space-y-4 border-t border-gray-100 pt-4">
                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-gray-500">
                                Kendaraan
                            </span>

                            <span className="text-right font-medium text-gray-900">
                                {vehicle.name ||
                                    "-"}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-gray-500">
                                Mulai
                            </span>

                            <span className="text-right font-medium text-gray-900">
                                {formatDate(
                                    booking.start_date
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-gray-500">
                                Selesai
                            </span>

                            <span className="text-right font-medium text-gray-900">
                                {formatDate(
                                    booking.end_date
                                )}
                            </span>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-end justify-between gap-4">
                                <span className="font-medium text-gray-700">
                                    Total
                                </span>

                                <span className="text-lg font-bold text-blue-700">
                                    {formatPrice(
                                        totalPrice
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-lg bg-blue-50 p-4">
                        <p className="text-xs leading-5 text-blue-700">
                            Setelah bukti pembayaran dikirim,
                            pembayaran akan diperiksa oleh admin.
                            Booking akan diproses setelah pembayaran
                            diverifikasi.
                        </p>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default function UserPaymentPage() {
    return <PaymentPage />;
}