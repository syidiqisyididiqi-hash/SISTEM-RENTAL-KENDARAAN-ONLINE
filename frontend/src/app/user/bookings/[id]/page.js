"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    CarFront,
    CircleAlert,
    CreditCard,
    LoaderCircle,
    MapPin,
    X,
} from "lucide-react";
import bookingService from "@/services/bookingService";
import paymentSettingService from "@/services/paymentSettingService";

const statusLabels = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    ongoing: "Sedang Berjalan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    rejected: "Ditolak",
};

const paymentStatusLabels = {
    pending: "Menunggu pembayaran",
    paid: "Sudah dibayar",
    rejected: "Pembayaran ditolak",
};

const paymentMethodLabels = {
    bank_transfer: "Mandiri",
    qris: "QRIS",
    cash: "Tunai",
};

const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
        return null;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    return `http://localhost:5000/${image.replace(/^\//, "")}`;
};

const formatDate = (date) => {
    if (!date) {
        return "-";
    }

    const [year, month, day] = String(date).slice(0, 10).split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
        "id-ID",
        { day: "2-digit", month: "long", year: "numeric" }
    );
};

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

const statusStyle = (status) => {
    if (status === "confirmed" || status === "ongoing") {
        return "bg-blue-50 text-blue-700";
    }
    if (status === "completed") {
        return "bg-green-50 text-green-700";
    }
    if (status === "cancelled" || status === "rejected") {
        return "bg-red-50 text-red-700";
    }
    return "bg-amber-50 text-amber-700";
};

export default function BookingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [qrisImage, setQrisImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const loadBooking = async () => {
            try {
                const response = await bookingService.getMineById(id);
                const nextBooking = response.data?.data || null;

                setBooking(nextBooking);

                if (nextBooking?.payment_method !== "qris") {
                    setQrisImage(null);
                }
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                        "Gagal memuat detail booking."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadBooking();
        }
    }, [id]);

    useEffect(() => {
        if (booking?.payment_method !== "qris") {
            return;
        }

        let active = true;

        const loadQrisImage = async () => {
            try {
                const response = await paymentSettingService.get();
                const nextImage = response.data?.data?.qris_image_url || null;

                if (active) {
                    setQrisImage(nextImage);
                }
            } catch (requestError) {
                if (active) {
                    console.error("Gagal memuat QRIS:", requestError);
                    setQrisImage(null);
                }
            }
        };

        loadQrisImage();

        return () => {
            active = false;
        };
    }, [booking?.payment_method]);

    const handleCancel = async () => {
        if (!window.confirm("Yakin ingin membatalkan booking ini?")) {
            return;
        }

        try {
            setCancelling(true);
            const response = await bookingService.cancelMine(id);
            setBooking(response.data?.data || { ...booking, status: "cancelled" });
            setNotice("Booking berhasil dibatalkan.");
        } catch (requestError) {
            setNotice(
                requestError.response?.data?.message ||
                    "Gagal membatalkan booking. Coba lagi."
            );
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-6 text-sm text-gray-500">
                <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" />
                <p className="mt-3">Memuat detail booking...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="mx-auto max-w-5xl px-6 py-12">
                <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                    <CircleAlert className="mx-auto h-8 w-8 text-red-500" />
                    <p className="mt-3 text-sm text-red-700">
                        {error || "Booking tidak ditemukan."}
                    </p>
                    <Link
                        href="/user/bookings"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke booking
                    </Link>
                </div>
            </div>
        );
    }

    const vehicleName =
        booking.vehicle_name ||
        [booking.brand, booking.model].filter(Boolean).join(" ") ||
        `Kendaraan ${booking.vehicle_id}`;
    const imageUrl = getImageUrl(booking.vehicle_image);

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <Link
                href="/user/bookings"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke booking
            </Link>

            <header className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Booking #{booking.id}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                        Detail Booking
                    </h1>
                </div>
                <span
                    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-medium ${statusStyle(booking.status)}`}
                >
                    {statusLabels[booking.status] || booking.status}
                </span>
            </header>

            {notice && (
                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700" role="status">
                    {notice}
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="relative flex h-56 items-center justify-center bg-gray-100 sm:h-72">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={vehicleName}
                                    fill
                                    sizes="(min-width: 1024px) 55vw, 100vw"
                                    unoptimized
                                    className="object-cover"
                                />
                            ) : (
                                <CarFront className="h-16 w-16 text-gray-300" />
                            )}
                        </div>
                        <div className="p-5 sm:p-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Kendaraan
                            </p>
                            <h2 className="mt-1 text-xl font-semibold text-gray-900">
                                {vehicleName}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {[booking.brand, booking.model].filter(Boolean).join(" · ") || "Detail kendaraan"}
                            </p>
                            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <CarFront className="h-4 w-4 text-gray-400" />
                                    Plat nomor: {booking.license_plate || "-"}
                                </p>
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <CalendarDays className="h-4 w-4 text-gray-400" />
                                    {booking.total_days || "-"} hari sewa
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                        <h2 className="font-semibold text-gray-900">Periode Sewa</h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">Tanggal mulai</p>
                                <p className="mt-1 font-medium text-gray-900">
                                    {formatDate(booking.start_date)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">Tanggal selesai</p>
                                <p className="mt-1 font-medium text-gray-900">
                                    {formatDate(booking.end_date)}
                                </p>
                            </div>
                        </div>
                        {booking.notes && (
                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    Catatan
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                    {booking.notes}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                    <h2 className="font-semibold text-gray-900">Rincian Pembayaran</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4 text-gray-600">
                            <span>Harga per hari</span>
                            <span className="font-medium text-gray-900">
                                {formatPrice(booking.price_per_day)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4 text-gray-600">
                            <span>Durasi</span>
                            <span className="font-medium text-gray-900">
                                {booking.total_days || "-"} hari
                            </span>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                            <div className="flex items-start justify-between gap-4">
                                <span className="font-medium text-gray-700">Total</span>
                                <span className="text-right text-lg font-semibold text-blue-700">
                                    {formatPrice(booking.total_price)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-5">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            Status Pembayaran
                        </h3>
                        <p className="mt-2 text-sm text-gray-700">
                            {paymentStatusLabels[booking.payment_status] ||
                                booking.payment_status ||
                                "Belum tersedia"}
                        </p>
                        {booking.payment_method && (
                            <p className="mt-1 text-xs text-gray-500">
                                Metode: {paymentMethodLabels[booking.payment_method] || booking.payment_method}
                            </p>
                        )}

                        {booking.payment_method === "qris" && (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    QRIS Pembayaran
                                </p>

                                {qrisImage ? (
                                    <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
                                        <div className="relative mx-auto h-44 w-44">
                                            <Image
                                                src={qrisImage}
                                                alt="QRIS pembayaran"
                                                fill
                                                unoptimized
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-xs text-gray-500">
                                        QRIS belum tersedia untuk saat ini.
                                    </p>
                                )}
                            </div>
                        )}

                        {booking.payment_proof && (
                            <a
                                href={booking.payment_proof}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex text-sm font-medium text-blue-700 hover:underline"
                            >
                                Lihat bukti pembayaran
                            </a>
                        )}
                    </div>

                    {booking.status === "pending" && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {cancelling ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <X className="h-4 w-4" />
                            )}
                            Batalkan booking
                        </button>
                    )}
                </aside>
            </div>
        </div>
    );
}