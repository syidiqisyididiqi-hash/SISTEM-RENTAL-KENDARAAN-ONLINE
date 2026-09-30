"use client";

import { useEffect, useState, useCallback } from "react";
import adminDashboardService from "@/services/adminDashboardService";

function Summary({ title, data, totalCount }) {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">{title}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Proporsi sebaran status</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        Total: {totalCount}
                    </span>
                </div>

                <div className="mt-4 space-y-3">
                    {data.map(([label, value, dot]) => {
                        const val = value || 0;
                        const percentage = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
                        return (
                            <div key={label} className="group rounded-xl p-2.5 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                                        <span className="font-medium text-slate-700">{label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{val}</span>
                                        <span className="text-xs font-medium text-slate-400 min-w-[36px] text-right">
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${dot} transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = useCallback(() => {
        return adminDashboardService
            .getDashboard()
            .then((res) => setDashboard(res.data?.data || null))
            .catch((err) => {
                console.error(err);
                setError("Gagal mengambil data dashboard.");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleRefresh = () => {
        setLoading(true);
        setError("");
        fetchDashboardData();
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const price = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value || 0);

    const date = (value) =>
        value
            ? new Date(value).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              })
            : "-";

    const statusStyle = {
        pending: "bg-amber-50 text-amber-700 border-amber-200/60",
        confirmed: "bg-blue-50 text-blue-700 border-blue-200/60",
        ongoing: "bg-purple-50 text-purple-700 border-purple-200/60",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
        rejected: "bg-rose-50 text-rose-700 border-rose-200/60",
        paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    };

    const statusDot = {
        pending: "bg-amber-500",
        confirmed: "bg-blue-500",
        ongoing: "bg-purple-500",
        completed: "bg-emerald-500",
        cancelled: "bg-slate-400",
        rejected: "bg-rose-500",
        paid: "bg-emerald-500",
    };

    const statusLabel = (status) =>
        status ? status.charAt(0).toUpperCase() + status.slice(1) : "-";

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="h-8 w-48 rounded-lg bg-slate-200" />
                    <div className="h-4 w-64 rounded bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-36 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="h-4 w-24 bg-slate-200 rounded" />
                                <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-7 w-32 bg-slate-200 rounded" />
                                <div className="h-3 w-28 bg-slate-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="h-96 rounded-2xl border border-slate-200/80 bg-white xl:col-span-2" />
                    <div className="h-96 rounded-2xl border border-slate-200/80 bg-white" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-900">Terjadi Kesalahan</h2>
                <p className="mt-1 text-sm text-slate-600">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Coba Lagi
                </button>
            </div>
        );
    }

    const s = dashboard?.statistics || {};
    const bookings = dashboard?.recentBookings || [];
    const payments = dashboard?.recentPayments || [];
    const bookingSummary = dashboard?.bookingSummary || {};
    const paymentSummary = dashboard?.paymentSummary || {};

    const totalBookingsCount = Object.values(bookingSummary).reduce((a, b) => a + (Number(b) || 0), 0);
    const totalPaymentsCount = Object.values(paymentSummary).reduce((a, b) => a + (Number(b) || 0), 0);

    const cards = [
        {
            title: "Total Users",
            value: s.total_users,
            description: "Pengguna terdaftar",
            icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            bgColor: "bg-blue-50/80 border-blue-100",
        },
        {
            title: "Total Vehicles",
            value: s.total_vehicles,
            description: "Kendaraan terdaftar",
            icon: (
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-8 4h8m-4 4h4m1 4H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" />
                </svg>
            ),
            bgColor: "bg-indigo-50/80 border-indigo-100",
        },
        {
            title: "Total Bookings",
            value: s.total_bookings,
            description: "Total transaksi booking",
            icon: (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            bgColor: "bg-purple-50/80 border-purple-100",
        },
        {
            title: "Total Revenue",
            value: price(s.total_revenue),
            description: "Total akumulasi pendapatan",
            icon: (
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: "bg-emerald-50/80 border-emerald-100",
        },
    ];

    const bookingStatuses = [
        ["Pending", bookingSummary.pending, "bg-amber-500"],
        ["Confirmed", bookingSummary.confirmed, "bg-blue-500"],
        ["Ongoing", bookingSummary.ongoing, "bg-purple-500"],
        ["Completed", bookingSummary.completed, "bg-emerald-500"],
        ["Cancelled", bookingSummary.cancelled, "bg-slate-400"],
        ["Rejected", bookingSummary.rejected, "bg-rose-500"],
    ];

    const paymentStatuses = [
        ["Pending", paymentSummary.pending, "bg-amber-500"],
        ["Paid", paymentSummary.paid, "bg-emerald-500"],
        ["Rejected", paymentSummary.rejected, "bg-rose-500"],
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                        Admin Panel
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Dashboard Ringkasan
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Pantau aktivitas rental, transaksi booking, dan performa pembayaran terkini.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
                >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                                {card.title}
                            </span>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.bgColor}`}>
                                {card.icon}
                            </div>
                        </div>

                        <div className="mt-4">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {card.value || 0}
                            </h2>
                            <p className="mt-1.5 text-xs font-medium text-slate-400">
                                {card.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Recent Bookings
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Lima daftar pemesanan terbaru yang masuk ke sistem.
                            </p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                            {bookings.length} Transaksi
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">ID</th>
                                    <th className="px-6 py-3.5">User</th>
                                    <th className="px-6 py-3.5">Kendaraan</th>
                                    <th className="px-6 py-3.5">Periode</th>
                                    <th className="px-6 py-3.5">Total</th>
                                    <th className="px-6 py-3.5">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-xs text-slate-400">
                                            Belum ada data booking terbaru.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900">
                                                #{item.id}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {item.user_name || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {item.vehicle_name || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                <div className="font-medium text-slate-800">{date(item.start_date)}</div>
                                                <div className="text-slate-400">s/d {date(item.end_date)}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                                                {price(item.total_price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                                                        statusStyle[item.status] || "bg-slate-100 text-slate-600 border-slate-200"
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[item.status] || "bg-slate-400"}`} />
                                                    {statusLabel(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Summary
                    title="Booking Status"
                    data={bookingStatuses}
                    totalCount={totalBookingsCount}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Recent Payments
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Lima riwayat pembayaran transaksi terakhir.
                            </p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                            {payments.length} Pembayaran
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">ID</th>
                                    <th className="px-6 py-3.5">Booking ID</th>
                                    <th className="px-6 py-3.5">Metode</th>
                                    <th className="px-6 py-3.5">Jumlah</th>
                                    <th className="px-6 py-3.5">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-xs text-slate-400">
                                            Belum ada data pembayaran terbaru.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900">
                                                #{item.id}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                                #{item.booking_id}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-700 capitalize">
                                                {item.payment_method?.replace("_", " ") || "-"}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                                                {price(item.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                                                        statusStyle[item.status] || "bg-slate-100 text-slate-600 border-slate-200"
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[item.status] || "bg-slate-400"}`} />
                                                    {statusLabel(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Summary
                    title="Payment Status"
                    data={paymentStatuses}
                    totalCount={totalPaymentsCount}
                />
            </div>
        </div>
    );
}