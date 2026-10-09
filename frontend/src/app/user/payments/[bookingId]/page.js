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
    QrCode,
    Banknote,
    FileCheck,
    AlertCircle,
    ShieldCheck,
    Eye,
    Trash2,
    X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import bookingService from "@/services/bookingService";
import paymentService from "@/services/paymentService";
import paymentSettingService from "@/services/paymentSettingService";

const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
        return null;
    }

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    return `http://localhost:5000/${image.replace(/^\/+/, "")}`;
};

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

const formatDate = (date) => {
    if (!date) return "-";

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
    const [paymentMethod, setPaymentMethod] = useState("qris");
    const [paymentProof, setPaymentProof] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!bookingId) return;

        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    bookingResponse,
                    paymentSettingResponse,
                ] = await Promise.all([
                    bookingService.getMineById(bookingId),
                    paymentSettingService.get(),
                ]);

                if (cancelled) return;

                setBooking(bookingResponse.data?.data || null);

                setQrisImage(
                    paymentSettingResponse.data?.data
                        ?.qris_image_url || null
                );
            } catch (requestError) {
                if (cancelled) return;

                setError(
                    requestError.response?.data?.message ||
                        "Gagal memuat data pembayaran."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [bookingId]);

    useEffect(() => {
        if (!paymentProof) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(paymentProof);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [paymentProof]);

    useEffect(() => {
        if (!isPreviewOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsPreviewOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPreviewOpen]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

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
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(
                "Ukuran bukti pembayaran maksimal 5 MB."
            );
            event.target.value = "";
            return;
        }

        setError("");
        setPaymentProof(file);
        setIsPreviewOpen(false);
    };

    const handleRemoveFile = () => {
        setPaymentProof(null);
        setIsPreviewOpen(false);

        const input = document.getElementById("payment_proof");

        if (input) {
            input.value = "";
        }
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
            setError("Data booking tidak ditemukan.");
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();

            formData.append("booking_id", booking.id);
            formData.append("payment_method", paymentMethod);
            formData.append(
                "amount",
                booking.total_price ??
                    booking.total_amount ??
                    booking.amount ??
                    0
            );
            formData.append("payment_proof", paymentProof);

            await paymentService.submitProof(formData);

            setSuccess(
                "Pembayaran berhasil dikirim dan sedang menunggu verifikasi admin."
            );

            setTimeout(() => {
                router.push(`/user/bookings/${booking.id}`);
            }, 1200);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Pembayaran gagal dikirim. Silakan coba lagi."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm font-medium text-gray-500">
                        Memuat halaman pembayaran...
                    </p>
                </div>
            </main>
        );
    }

    if (!booking) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">
                                Terjadi Kesalahan
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                {error || "Booking tidak ditemukan."}
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/user/bookings"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke booking
                    </Link>
                </div>
            </main>
        );
    }

    const vehicle = booking.vehicle || {};

    const imageUrl = getImageUrl(
        booking.vehicle_image ||
            vehicle.image ||
            vehicle.vehicle_image
    );

    const vehicleName =
        vehicle.name ||
        booking.vehicle_name ||
        [booking.brand, booking.model]
            .filter(Boolean)
            .join(" ") ||
        "Kendaraan";

    const totalPrice =
        Number(
            booking.total_price ??
                booking.total_amount ??
                booking.amount
        ) || 0;

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link
                    href={`/user/bookings/${booking.id}`}
                    className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-500 transition hover:text-blue-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke detail booking
                </Link>

                <div className="mt-4 border-b border-gray-100 pb-5">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        PEMBAYARAN
                    </span>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Selesaikan Pembayaran
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Lakukan pembayaran sesuai total booking,
                        kemudian upload bukti pembayaran.
                    </p>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-800 shadow-sm"
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div className="flex-1">{error}</div>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50/70 p-4 text-sm text-green-800 shadow-sm"
                >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <div className="flex-1 font-medium">{success}</div>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
                            <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-900/5 sm:w-32">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={vehicleName}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <CarFront className="absolute inset-0 m-auto h-10 w-10 text-gray-300" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    ID BOOKING #{booking.id}
                                </span>
                                <h2 className="mt-0.5 truncate text-lg font-bold text-gray-900">
                                    {vehicleName}
                                </h2>
                            </div>
                        </div>

                        <div className="grid gap-3 bg-gray-50/50 p-5 sm:grid-cols-2 sm:p-6">
                            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <CalendarDays className="h-4 w-4 text-blue-600" />
                                    Tanggal Mulai
                                </div>
                                <p className="mt-2 text-sm font-bold text-gray-900">
                                    {formatDate(booking.start_date)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <CalendarDays className="h-4 w-4 text-blue-600" />
                                    Tanggal Selesai
                                </div>
                                <p className="mt-2 text-sm font-bold text-gray-900">
                                    {formatDate(booking.end_date)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">
                                    Metode Pembayaran
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Pilih opsi pembayaran yang ingin Anda gunakan.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {[
                                {
                                    value: "qris",
                                    title: "QRIS",
                                    description: "Bayar instan via scan QRIS.",
                                    Icon: QrCode,
                                },
                                {
                                    value: "cash",
                                    title: "Cash",
                                    description: "Bayar secara tunai di lokasi.",
                                    Icon: Banknote,
                                },
                            ].map(({ value, title, description, Icon }) => (
                                <label
                                    key={value}
                                    className={`relative flex cursor-pointer rounded-xl border p-4 transition-all ${
                                        paymentMethod === value
                                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={value}
                                        checked={paymentMethod === value}
                                        onChange={(event) =>
                                            setPaymentMethod(event.target.value)
                                        }
                                        className="sr-only"
                                    />

                                    <div className="flex w-full items-start gap-3">
                                        <div
                                            className={`mt-0.5 rounded-lg p-2 ${
                                                paymentMethod === value
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {title}
                                                </span>
                                                {paymentMethod === value && (
                                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                )}
                                            </div>
                                            <span className="mt-1 block text-xs text-gray-500">
                                                {description}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {paymentMethod === "qris" && (
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-base font-bold text-gray-900">
                                Kode QRIS Pembayaran
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Scan QRIS berikut menggunakan aplikasi
                                dompet digital atau mobile banking kamu.
                            </p>

                            {qrisImage ? (
                                <div className="mx-auto mt-6 flex max-w-xs flex-col items-center rounded-2xl border border-gray-100 bg-gray-50/50 p-6 shadow-inner">
                                    <div className="relative h-64 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                                        <Image
                                            src={qrisImage}
                                            alt="QRIS pembayaran"
                                            fill
                                            unoptimized
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        QRIS Standar Pembayaran Nasional
                                    </span>
                                </div>
                            ) : (
                                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
                                    QRIS belum tersedia.
                                </div>
                            )}
                        </section>
                    )}

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-base font-bold text-gray-900">
                            Bukti Pembayaran
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Upload screenshot atau foto resi bukti transfer/pembayaran.
                        </p>

                        <div className="mt-5">
                            <input
                                id="payment_proof"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                name="payment_proof"
                                required
                                onClick={(event) => {
                                    event.currentTarget.value = "";
                                }}
                                onChange={handleFileChange}
                                disabled={submitting}
                                className="sr-only"
                            />

                            {!paymentProof ? (
                                <label
                                    htmlFor="payment_proof"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-400 hover:bg-gray-50"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <span className="mt-3 text-sm font-semibold text-gray-800">
                                        Klik untuk memilih file bukti
                                    </span>
                                    <span className="mt-1 text-xs text-gray-400">
                                        Format JPG, PNG, WEBP (Maksimal 5 MB)
                                    </span>
                                </label>
                            ) : (
                                <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewOpen(true)}
                                        disabled={!previewUrl}
                                        aria-label="Lihat preview bukti pembayaran"
                                        className="group relative block w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left"
                                    >
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="Preview bukti pembayaran"
                                                className="h-64 w-full object-contain p-2"
                                            />
                                        )}
                                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800 opacity-0 shadow transition group-hover:opacity-100">
                                                <Eye className="mr-2 inline h-4 w-4" />
                                                Lihat gambar
                                            </span>
                                        </span>
                                    </button>

                                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <FileCheck className="h-5 w-5 shrink-0 text-blue-600" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                    {paymentProof.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(paymentProof.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <label
                                                htmlFor="payment_proof"
                                                className={`inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 ${
                                                    submitting
                                                        ? "pointer-events-none opacity-50"
                                                        : ""
                                                }`}
                                            >
                                                Ganti gambar
                                            </label>

                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                disabled={submitting}
                                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-xs text-blue-700">
                                        Klik gambar untuk melihat ukuran lebih besar.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !paymentProof}
                            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Mengirim pembayaran...
                                </span>
                            ) : (
                                "Kirim Bukti Pembayaran"
                            )}
                        </button>
                    </section>
                </form>

                <aside className="h-fit space-y-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-base font-bold text-gray-900">
                            Ringkasan Pembayaran
                        </h2>

                        <div className="mt-5 space-y-3.5 border-t border-gray-100 pt-4">
                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">Kendaraan</span>
                                <span className="text-right font-semibold text-gray-900">
                                    {vehicleName}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">Tgl Mulai</span>
                                <span className="text-right font-medium text-gray-900">
                                    {formatDate(booking.start_date)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 text-sm">
                                <span className="text-gray-500">Tgl Selesai</span>
                                <span className="text-right font-medium text-gray-900">
                                    {formatDate(booking.end_date)}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex items-baseline justify-between gap-4">
                                    <span className="font-bold text-gray-900">
                                        Total Tagihan
                                    </span>
                                    <span className="text-xl font-black text-blue-700">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                            <div className="flex gap-2.5">
                                <ShieldCheck className="h-5 w-5 shrink-0 text-blue-700" />
                                <p className="text-xs leading-5 text-blue-800">
                                    Setelah bukti dikirim, transaksi akan
                                    diproses dan diverifikasi oleh tim admin.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {isPreviewOpen && previewUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Preview bukti pembayaran"
                        className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-gray-900">
                                    Preview Bukti Pembayaran
                                </h2>
                                <p className="mt-1 truncate text-xs text-gray-500">
                                    {paymentProof?.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPreviewOpen(false)}
                                aria-label="Tutup preview"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-xl bg-gray-50 p-2">
                            <img
                                src={previewUrl}
                                alt="Bukti pembayaran ukuran besar"
                                className="max-h-[65vh] max-w-full rounded-lg object-contain"
                            />
                        </div>

                        <p className="mt-3 text-center text-xs text-gray-500">
                            Periksa kembali bukti pembayaran sebelum mengirimkannya.
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function UserPaymentPage() {
    return <PaymentPage />;
}
