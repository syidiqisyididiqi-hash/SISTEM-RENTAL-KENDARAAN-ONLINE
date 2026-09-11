"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BookingsPage() {
    const router = useRouter();

    const [bookings, setBookings] = useState([
        {
            id: 1,
            vehicle: {
                name: "Toyota Avanza",
                image: "/images/avanza.jpg",
                plate: "D 1234 ABC",
            },
            start_date: "2026-09-10",
            end_date: "2026-09-12",
            total_price: 700000,
            status: "confirmed",
        },
        {
            id: 2,
            vehicle: {
                name: "Honda Brio",
                image: "/images/brio.jpg",
                plate: "D 5678 DEF",
            },
            start_date: "2026-09-20",
            end_date: "2026-09-22",
            total_price: 500000,
            status: "pending",
        },
        {
            id: 3,
            vehicle: {
                name: "Toyota Innova",
                image: "/images/innova.jpg",
                plate: "D 9012 GHI",
            },
            start_date: "2026-08-15",
            end_date: "2026-08-18",
            total_price: 1200000,
            status: "completed",
        },
    ]);

    const [notice, setNotice] = useState("");

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

    const handleCancel = (id) => {
        const confirmCancel = window.confirm(
            "Apakah kamu yakin ingin membatalkan booking ini?"
        );

        if (!confirmCancel) {
            return;
        }

        setBookings((currentBookings) =>
            currentBookings.map((booking) =>
                booking.id === id
                    ? {
                          ...booking,
                          status: "cancelled",
                      }
                    : booking
            )
        );

        setNotice("Booking berhasil dibatalkan.");

        setTimeout(() => {
            setNotice("");
        }, 3000);
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
                    <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
                        {notice}
                    </div>
                )}

                <div className="mt-8 space-y-5">
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col gap-5 md:flex-row">
                                        <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 md:w-56">
                                            <Image
                                                src={
                                                    booking.vehicle
                                                        .image
                                                }
                                                alt={
                                                    booking.vehicle
                                                        .name
                                                }
                                                width={224}
                                                height={160}
                                                className="h-full w-full object-cover"
                                            />
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
                                                        {
                                                            booking
                                                                .vehicle
                                                                .name
                                                        }
                                                    </h2>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {
                                                            booking
                                                                .vehicle
                                                                .plate
                                                        }
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
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/bookings/${booking.id}`
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    Lihat Detail
                                                </button>

                                                {booking.status ===
                                                    "pending" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCancel(
                                                                booking.id
                                                            )
                                                        }
                                                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                                                    >
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
                                onClick={() =>
                                    router.push("/vehicles")
                                }
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
