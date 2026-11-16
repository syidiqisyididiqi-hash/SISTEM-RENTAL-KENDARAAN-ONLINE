
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
    ArrowRight,
    CarFront,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    Compass,
    LoaderCircle,
    Sparkles,
} from "lucide-react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const formatRupiah = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(price || 0);

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const statusLabel = {
    pending: "Menunggu Konfirmasi",
    confirmed: "Dikonfirmasi",
    ongoing: "Sedang Disewa",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    rejected: "Ditolak",
};

const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
};

const resolveImage = (image) => {
    if (!image) return null;

    if (image.startsWith("http")) return image;

    return `http://localhost:5000${image.startsWith("/") ? "" : "/"}${image}`;
};

export default function UserDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = sessionStorage.getItem("token");

                if (!token) {
                    setError("Silakan login terlebih dahulu.");
                    return;
                }

                const response = await axios.get(
                    `${API_URL}/user-dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setDashboard(response.data.data);

            } catch (error) {
                console.error(error);
                setError(
                    error.response?.data?.message ||
                    "Gagal mengambil data dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-slate-50 to-white">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <LoaderCircle className="animate-spin text-blue-600" size={22} />
                    <span className="text-sm font-medium text-slate-600">Menyiapkan dashboard...</span>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <CalendarDays size={22} />
                    </div>
                    <h1 className="text-lg font-bold text-slate-900">Dashboard belum tersedia</h1>
                    <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>
                </div>
            </main>
        );
    }

    if (!dashboard) return null;

    const {
        user,
        recommendedVehicles = [],
        activeBookings = [],
        recentBookings = [],
    } = dashboard;
    const stats = [
        {
            label: "Pemesanan aktif",
            value: activeBookings.length,
            detail: activeBookings.length ? "Perjalanan sedang berjalan" : "Siap untuk perjalanan baru",
            icon: CalendarDays,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Riwayat pemesanan",
            value: recentBookings.length,
            detail: "Semua aktivitas tersimpan",
            icon: Clock,
            color: "bg-violet-50 text-violet-600",
        },
        {
            label: "Pilihan kendaraan",
            value: recommendedVehicles.length,
            detail: "Rekomendasi untukmu",
            icon: CarFront,
            color: "bg-emerald-50 text-emerald-600",
        },
    ];

    return (
        <main className="flex-1 bg-[#f7f9fc]">

            {/* Hero */}
            <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800">
                <div className="absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -bottom-48 right-1/3 -z-10 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-20">
                    <div className="max-w-3xl">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-100 backdrop-blur">
                            <Sparkles size={14} />
                            RENTAL KENDARAAN ONLINE
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                            Selamat datang kembali,
                            <span className="mt-1 block bg-gradient-to-r from-cyan-200 to-blue-100 bg-clip-text text-transparent">
                                {user?.name || "Pelanggan"}!
                            </span>
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100/80 sm:text-lg sm:leading-8">
                            Siap untuk perjalanan berikutnya? Temukan kendaraan yang pas dan berangkat dengan lebih nyaman.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                href="/user/vehicles"
                                className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-900 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                            >
                                Cari Kendaraan
                                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-100/80">
                                <Compass size={17} />
                                Perjalanan dimulai dari sini
                            </span>
                        </div>
                    </div>
                    <div className="hidden h-48 w-48 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-blue-950/30 backdrop-blur-sm lg:flex">
                        <div className="flex h-36 w-36 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-cyan-300 to-blue-500 text-white shadow-inner">
                            <CarFront size={76} strokeWidth={1.4} />
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl space-y-12 px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
                <section aria-label="Ringkasan dashboard" className="-mt-1 grid gap-4 sm:grid-cols-3">
                    {stats.map(({ label, value, detail, icon: Icon, color }) => (
                        <div key={label} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                                <Icon size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500">{label}</p>
                                <div className="mt-0.5 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
                                    <span className="truncate text-xs text-slate-400">{detail}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Rekomendasi Kendaraan */}
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                                <Sparkles size={14} /> Pilihan untukmu
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Rekomendasi Kendaraan
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Pilihan kendaraan yang tersedia untukmu.
                            </p>
                        </div>

                        <Link
                            href="/user/vehicles"
                            className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                        >
                            Lihat Semua
                            <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {recommendedVehicles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                            <CarFront className="mx-auto mb-3 text-slate-300" size={38} />
                            Belum ada kendaraan tersedia.
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {recommendedVehicles.map((vehicle) => (
                                <div
                                    key={vehicle.id}
                                    className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/70"
                                >
                                    <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50">
                                        {resolveImage(vehicle.image) ? (
                                            <img
                                                src={resolveImage(vehicle.image)}
                                                alt={vehicle.name}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <CarFront size={54} className="text-blue-200" />
                                        )}
                                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur">
                                            <CheckCircle2 size={13} /> Tersedia
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {vehicle.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {vehicle.brand} {vehicle.model} {vehicle.year}
                                        </p>

                                        <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                                            <p className="font-bold text-blue-700">
                                                {formatRupiah(vehicle.price_per_day)}
                                                <span className="ml-1 font-normal text-slate-500">/ hari</span>
                                            </p>
                                            <Link
                                                href={`/user/vehicles/${vehicle.id}`}
                                                aria-label={`Lihat detail ${vehicle.name}`}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            >
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Pemesanan Aktif */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Pemesanan Aktif
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Pantau status penyewaan kendaraanmu.
                        </p>
                    </div>

                    {activeBookings.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-9 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                                <CalendarDays size={26} />
                            </div>

                            <p className="font-semibold text-slate-900">
                                Belum ada pemesanan aktif.
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                Mulai cari kendaraan untuk perjalananmu.
                            </p>
                            <Link href="/user/vehicles" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                Jelajahi kendaraan <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                            <CarFront size={23} />
                                        </div>
                                        <div>
                                        <h3 className="font-bold text-slate-900">
                                            {booking.vehicle_name}
                                        </h3>

                                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                                            <CalendarDays size={14} />
                                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                        </p>

                                        <p className="mt-2 font-semibold text-slate-900">
                                            {formatRupiah(booking.total_price)}
                                        </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ring-black/5 ${statusColor[booking.status] || "bg-slate-100 text-slate-600"}`}>
                                            {statusLabel[booking.status] || booking.status}
                                        </span>

                                        <Link
                                            href={`/user/bookings/${booking.id}`}
                                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                                        >
                                            Detail <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Pemesanan Terbaru */}
                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Pemesanan Terbaru
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Lihat aktivitas pemesanan terakhirmu.
                            </p>
                        </div>

                        <Link
                            href="/user/bookings"
                            className="group flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                        >
                            Lihat Semua
                            <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {recentBookings.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-9 text-center shadow-sm">
                            <Clock className="mx-auto mb-3 text-slate-300" size={36} />
                            <p className="text-slate-500">
                                Belum ada riwayat pemesanan.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">No</th>
                                        <th className="px-5 py-4">Kendaraan</th>
                                        <th className="px-5 py-4">Tanggal Pesan</th>
                                        <th className="px-5 py-4">Total Harga</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {recentBookings.map((booking, index) => (
                                        <tr key={booking.id} className="transition hover:bg-blue-50/40">
                                            <td className="px-5 py-4 text-slate-400">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4 font-semibold text-slate-800">
                                                {booking.vehicle_name}
                                            </td>

                                            <td className="px-5 py-4 text-slate-500">
                                                {formatDate(booking.created_at)}
                                            </td>

                                            <td className="px-5 py-4 font-medium">
                                                {formatRupiah(booking.total_price)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ring-black/5 ${statusColor[booking.status] || "bg-slate-100 text-slate-600"}`}>
                                                    {statusLabel[booking.status] || booking.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/user/bookings/${booking.id}`}
                                                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}
