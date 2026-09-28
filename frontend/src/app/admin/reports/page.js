"use client";

import reportService from "@/services/reportService";
import Button from "@/components/ui/Button";
import { useCallback, useEffect, useState } from "react";
import ReportExportButtons from "@/components/ui/ReportExportButtons";

const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getStatusClass = (status) => {
    const classes = {
        pending: "bg-yellow-100 text-yellow-700",
        confirmed: "bg-blue-100 text-blue-700",
        ongoing: "bg-purple-100 text-purple-700",
        completed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
        rejected: "bg-red-100 text-red-700",
        paid: "bg-green-100 text-green-700",
    };

    return classes[status] || "bg-gray-100 text-gray-700";
};

export default function ReportsPage() {
    const currentDate = new Date();

    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getReport = useCallback(async () => {
    try {
        setLoading(true);
        setError("");

        const response = await reportService.getMonthlyReport(
            month,
            year
        );

        setReport(response.data.data);
    } catch (error) {
        console.error("Gagal mengambil laporan:", error);

        setReport(null);
        setError(
            error.response?.data?.message ||
                "Gagal mengambil laporan bulanan"
        );
    } finally {
        setLoading(false);
    }
    }, [month, year]);

    useEffect(() => {
        const loadReport = async () => {
            await getReport();
        };

        void loadReport();
    }, [getReport]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        await getReport();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Laporan Bulanan
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Lihat ringkasan pemesanan dan pendapatan berdasarkan
                    periode bulan.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 md:flex-row md:items-end"
                >
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Bulan
                        </label>

                        <select
                            value={month}
                            onChange={(e) =>
                                setMonth(Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                        >
                            {monthNames.map((name, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Tahun
                        </label>

                        <select
                            value={year}
                            onChange={(e) =>
                                setYear(Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                        >
                            {Array.from(
                                { length: 6 },
                                (_, index) => currentDate.getFullYear() - index
                            ).map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                    <Button
                        type="submit"
                        loading={loading}
                        className="rounded-xl px-6 py-2.5"
                    >
                        Tampilkan Laporan
                    </Button>

                    <ReportExportButtons
                        month={month}
                        year={year}
                        disabled={!report}
                    />
                </div>
                </form>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {loading && !report ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                    Memuat laporan...
                </div>
            ) : report ? (
                <>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Laporan {monthNames[report.period.month - 1]}{" "}
                            {report.period.year}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Ringkasan aktivitas rental pada periode yang
                            dipilih.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Pemesanan
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {report.statistics.total_bookings}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Nilai Pemesanan
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900">
                                {formatCurrency(
                                    report.statistics.total_booking_value
                                )}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Pembayaran
                            </p>

                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {report.statistics.total_payments}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Pendapatan
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-900">
                                {formatCurrency(
                                    report.statistics.total_revenue
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900">
                                Ringkasan Pemesanan
                            </h3>

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {Object.entries(report.bookingSummary).map(
                                    ([status, total]) => (
                                        <div
                                            key={status}
                                            className="rounded-xl bg-gray-50 p-4"
                                        >
                                            <p className="text-xs font-medium capitalize text-gray-500">
                                                {status}
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-gray-900">
                                                {total}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900">
                                Ringkasan Pembayaran
                            </h3>

                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {Object.entries(report.paymentSummary).map(
                                    ([status, total]) => (
                                        <div
                                            key={status}
                                            className="rounded-xl bg-gray-50 p-4"
                                        >
                                            <p className="text-xs font-medium capitalize text-gray-500">
                                                {status}
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-gray-900">
                                                {total}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-5">
                            <h3 className="text-base font-bold text-gray-900">
                                Pendapatan Kendaraan
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Ringkasan pemesanan dan pendapatan berdasarkan
                                kendaraan.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            No
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Kendaraan
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Brand
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Model
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Jumlah Booking
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Pendapatan
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {report.vehicleRevenue.length > 0 ? (
                                        report.vehicleRevenue.map(
                                            (vehicle, index) => (
                                                <tr
                                                    key={vehicle.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-5 py-3 text-gray-600">
                                                        {index + 1}
                                                    </td>

                                                    <td className="px-5 py-3 font-medium text-gray-900">
                                                        {vehicle.vehicle_name}
                                                    </td>

                                                    <td className="px-5 py-3 text-gray-600">
                                                        {vehicle.brand}
                                                    </td>

                                                    <td className="px-5 py-3 text-gray-600">
                                                        {vehicle.model}
                                                    </td>

                                                    <td className="px-5 py-3 text-gray-600">
                                                        {
                                                            vehicle.total_bookings
                                                        }
                                                    </td>

                                                    <td className="px-5 py-3 font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            vehicle.total_revenue
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-5 py-8 text-center text-gray-500"
                                            >
                                                Tidak ada data kendaraan pada
                                                periode ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-5">
                            <h3 className="text-base font-bold text-gray-900">
                                Detail Pemesanan
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Daftar pemesanan yang dibuat pada periode
                                laporan.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            No
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Pengguna
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Kendaraan
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Mulai
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Selesai
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Total Hari
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Total
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-700">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {report.bookings.length > 0 ? (
                                        report.bookings.map(
                                            (booking, index) => (
                                                <tr
                                                    key={booking.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-5 py-3 text-gray-600">
                                                        {index + 1}
                                                    </td>

                                                    <td className="px-5 py-3 font-medium text-gray-900">
                                                        {booking.user_name}
                                                    </td>

                                                    <td className="px-5 py-3 text-gray-600">
                                                        {booking.vehicle_name}
                                                    </td>

                                                    <td className="px-5 py-3 text-gray-600">
                                                        {formatDate(
                                                            booking.start_date
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3 text-gray-600">
                                                        {formatDate(
                                                            booking.end_date
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3 text-gray-600">
                                                        {booking.total_days}
                                                    </td>

                                                    <td className="px-5 py-3 font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            booking.total_price
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                                                booking.status
                                                            )}`}
                                                        >
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="px-5 py-8 text-center text-gray-500"
                                            >
                                                Tidak ada pemesanan pada
                                                periode ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}