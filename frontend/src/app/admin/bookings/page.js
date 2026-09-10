"use client";

import { useEffect, useState } from "react";
import bookingService from "@/services/bookingService";

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const response = await bookingService.getAll();

                setBookings(response.data?.data || []);
                setError("");
            } catch (error) {
                console.error("Error mengambil data booking:", error);
                setError("Gagal mengambil data booking.");
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, []);

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

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price || 0);
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
                return "bg-gray-100 text-gray-600";

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

            case "confirmed":
                return "Confirmed";

            case "ongoing":
                return "Ongoing";

            case "completed":
                return "Completed";

            case "cancelled":
                return "Cancelled";

            case "rejected":
                return "Rejected";

            default:
                return status || "-";
        }
    };

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Bookings
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Kelola data penyewaan kendaraan.
                </p>
            </div>

            <div className="mt-6">
                {loading && (
                    <p className="text-sm text-gray-500">
                        Memuat data booking...
                    </p>
                )}

                {error && (
                    <p className="text-sm text-red-500">
                        {error}
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
                                            User
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Kendaraan
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Periode
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Hari
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Harga / Hari
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Total
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Status
                                        </th>

                                        <th className="px-6 py-3 font-semibold text-gray-700">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {bookings.length > 0 ? (
                                        bookings.map((booking) => (
                                            <tr
                                                key={booking.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-6 py-4">
                                                    #{booking.id}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {booking.user_name}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            User ID:{" "}
                                                            {booking.user_id}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {booking.vehicle_name}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {booking.brand}{" "}
                                                            {booking.model || ""}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="whitespace-nowrap">
                                                        <p className="text-gray-800">
                                                            {formatDate(
                                                                booking.start_date
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            sampai{" "}
                                                            {formatDate(
                                                                booking.end_date
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {booking.total_days} hari
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {formatPrice(
                                                        booking.price_per_day
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                                                    {formatPrice(
                                                        booking.total_price
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                            booking.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            booking.status
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="px-6 py-8 text-center text-gray-500"
                                            >
                                                Belum ada booking.
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