"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CarFront, CircleAlert, Eye, LoaderCircle, X } from "lucide-react";
import bookingService from "@/services/bookingService";

const getImageUrl = (image) => {
    if (!image) {
        return null;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    return `http://localhost:5000/${image.replace(/^\//, "")}`;
};

const getVehicleName = (booking) =>
    booking.vehicle_name ||
    [booking.brand, booking.model].filter(Boolean).join(" ") ||
    `Kendaraan ${booking.vehicle_id}`;

export default function BookingsPage() {
    const router = useRouter();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const response = await bookingService.getMine();
                setBookings(response.data?.data || []);
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                        "Gagal memuat daftar booking. Coba muat ulang halaman."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

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

        const [year, month, day] = String(date).slice(0, 10).split("-");
        const localDate = new Date(Number(year), Number(month) - 1, Number(day));

        return localDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
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
                return "bg-red-50 text-red-600";

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
                return "Sedang Berjalan";

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

    const handleCancel = async (id) => {
        const confirmCancel = window.confirm(
            "Apakah kamu yakin ingin membatalkan booking ini?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            setCancellingId(id);
            const response = await bookingService.cancelMine(id);
            const updatedBooking = response.data?.data;

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking.id === id
                        ? { ...booking, ...updatedBooking, status: "cancelled" }
                        : booking
                )
            );
            setNotice("Booking berhasil dibatalkan.");
        } catch (requestError) {
            setNotice(
                requestError.response?.data?.message ||
                    "Gagal membatalkan booking. Coba lagi."
            );
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Booking Saya
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Lihat dan kelola semua penyewaan kendaraan kamu.
                        </p>
                    </div>

                </div>

                {notice && (
                    <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700" role="status">
                        {notice}
                    </div>
                )}

                <div className="mt-8 space-y-5">
                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500">
                            <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
                            <p className="mt-3">Memuat booking...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">
                            <div className="flex items-center gap-2 font-medium">
                                <CircleAlert className="h-5 w-5 shrink-0" />
                                {error}
                            </div>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-4 rounded-lg border border-red-200 bg-white px-3 py-2 font-medium hover:bg-red-100"
                            >
                                Coba lagi
                            </button>
                        </div>
                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col gap-5 md:flex-row">
                                        <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 md:w-56">
                                            {getImageUrl(booking.vehicle_image) ? (
                                                <Image
                                                    src={getImageUrl(booking.vehicle_image)}
                                                    alt={getVehicleName(booking)}
                                                    fill
                                                    sizes="(min-width: 768px) 224px, 100vw"
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <CarFront className="h-12 w-12 text-gray-300" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Booking #
                                                        {
                                                            booking.id
                                                        }
                                                    </p>

                                                    <h2 className="mt-1 text-lg font-semibold text-gray-800">
                                                        {getVehicleName(booking)}
                                                    </h2>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {booking.license_plate || "Nomor plat belum tersedia"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                            booking.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            booking.status
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Tanggal Mulai
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                                        {formatDate(
                                                            booking.start_date
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Tanggal Selesai
                                                    </p>

                                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                                        {formatDate(
                                                            booking.end_date
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Total Pembayaran
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                                        {formatPrice(
                                                            booking.total_price
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap justify-end gap-2">
                                                <Link
                                                    href={`/user/bookings/${booking.id}`}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Lihat Detail
                                                </Link>

                                                {booking.status ===
                                                    "pending" && (
                                                    <button
                                                        type="button"
                                                        disabled={cancellingId === booking.id}
                                                        onClick={() =>
                                                            handleCancel(
                                                                booking.id
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {cancellingId === booking.id ? (
                                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <X className="h-4 w-4" />
                                                        )}
                                                        Batalkan
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Belum Ada Booking
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Kamu belum memiliki riwayat penyewaan
                                kendaraan.
                            </p>

                            <button
                                type="button"
                                onClick={() => router.push("/user/vehicles")}
                                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Cari Kendaraan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
