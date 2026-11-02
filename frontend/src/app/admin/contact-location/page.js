"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import rentalLocationService from "@/services/rentalLocationService";
import {
    getErrorMessage,
    resolveImage,
    unwrap,
} from "@/lib/rentalLocationHelpers";

function InfoItem({ icon, label, children }) {
    return (
        <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <span>{icon}</span>
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <div className="mt-1 break-words text-sm font-medium text-slate-700">
                    {children || "-"}
                </div>
            </div>
        </div>
    );
}

export default function AdminRentalLocationsPage() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [toast, setToast] = useState(null);
    const [imageError, setImageError] = useState(false);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
    }, []);

    useEffect(() => {
        try {
            const flash = sessionStorage.getItem(
                "rental-location-flash"
            );

            if (flash) {
                sessionStorage.removeItem("rental-location-flash");

                showToast("success", flash);
            }
        } catch { }
    }, [showToast]);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 3500);

        return () => clearTimeout(timer);
    }, [toast]);

    const fetchLocation = useCallback(async () => {
        setLoading(true);
        setLoadError("");
        setImageError(false);

        try {
            const res = await rentalLocationService.getAll();
            const data = unwrap(res);

            const records = Array.isArray(data)
                ? data
                : Array.isArray(data?.locations)
                    ? data.locations
                    : Array.isArray(data?.rows)
                        ? data.rows
                        : null;

            const store = records
                ? records[0] || null
                : data?.location ?? data;

            setLocation(store);
        } catch (error) {
            setLoadError(
                getErrorMessage(
                    error,
                    "Gagal mengambil informasi toko rental."
                )
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl p-4 sm:p-8">
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Memuat informasi toko rental...
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="mx-auto max-w-5xl p-4 sm:p-8">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Informasi Toko Rental
                </h1>

                <div className="mt-6 rounded-xl border border-red-200 bg-white p-6">
                    <p className="text-sm text-red-600">
                        {loadError}
                    </p>

                    <button
                        type="button"
                        onClick={fetchLocation}
                        className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (!location) {
        return (
            <div className="mx-auto max-w-5xl p-4 sm:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Informasi Toko Rental
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Kelola profil dan informasi resmi toko rental kendaraan.
                    </p>
                </div>

                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl">
                        🏪
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        Informasi Toko Belum Tersedia
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                        Tambahkan informasi toko rental agar pelanggan dapat melihat alamat, kontak, foto bangunan, dan jam operasional toko.
                    </p>

                    <Link
                        href="/admin/contact-location/create"
                        className="mt-6 inline-flex rounded-md bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
                    >
                        + Tambah Informasi Toko
                    </Link>
                </div>
            </div>
        );
    }

    const image = resolveImage(location.image);

    return (
        <div className="mx-auto max-w-5xl p-4 sm:p-8">

            <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Informasi Toko Rental
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Kelola profil, alamat, dan informasi resmi toko rental.
                    </p>
                </div>

                <Link
                    href={`/admin/contact-location/edit/${location.id}`}
                    className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
                >
                    <span>✎</span>
                    Edit Informasi Toko
                </Link>
            </header>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="relative bg-slate-100">
                    {image && !imageError ? (
                        <img
                            key={image}
                            src={image}
                            alt={location.name || "Foto Bangunan Toko"}
                            className="h-64 w-full object-cover sm:h-80"
                            onError={() => {
                                console.error("Gagal memuat gambar:", image);
                                setImageError(true);
                            }}
                        />
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center sm:h-80">
                            <span className="text-4xl">🏪</span>

                            <p className="text-sm text-slate-500">
                                {image
                                    ? "Foto gagal dimuat. Periksa alamat gambar di backend."
                                    : "Foto bangunan toko belum tersedia"}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-5 sm:p-8">

                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                            Profil Toko
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                            {location.name || "-"}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Informasi resmi toko rental kendaraan.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h3 className="mb-5 text-base font-semibold text-slate-900">
                            Alamat dan Lokasi
                        </h3>

                        <div className="space-y-5">
                            <InfoItem
                                icon="📍"
                                label="Alamat Lengkap"
                            >
                                {location.address}
                            </InfoItem>

                            {(location.latitude || location.longitude) && (
                                <InfoItem
                                    icon="🌐"
                                    label="Koordinat Lokasi"
                                >
                                    {location.latitude || "-"},{" "}
                                    {location.longitude || "-"}
                                </InfoItem>
                            )}

                            <section className="mt-8">
                                <h3 className="mb-5 text-base font-semibold text-slate-900">
                                    Google Maps
                                </h3>

                                {location.latitude && location.longitude ? (
                                    <div className="overflow-hidden rounded-xl border border-slate-200">
                                        <iframe
                                            title={`Lokasi ${location.name || "Toko Rental"}`}
                                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                                                `${location.latitude},${location.longitude}`
                                            )}&output=embed`}
                                            width="100%"
                                            height="400"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />

                                        <div className="border-t border-slate-200 bg-white p-4">
                                            <a
                                                href={
                                                    location.maps_url ||
                                                    `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-teal-700 underline"
                                            >
                                                Buka di Google Maps
                                            </a>
                                        </div>
                                    </div>
                                ) : location.maps_url ? (
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="mb-3 text-sm text-slate-500">
                                            Koordinat lokasi belum tersedia. Silakan buka lokasi melalui Google Maps.
                                        </p>

                                        <a
                                            href={location.maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-teal-700 underline"
                                        >
                                            Buka di Google Maps
                                        </a>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                                        <p className="text-sm text-slate-500">
                                            Lokasi Google Maps belum tersedia.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </section>

                    <div className="mb-8 border-t border-slate-100" />

                    <section className="mb-8">
                        <h3 className="mb-5 text-base font-semibold text-slate-900">
                            Informasi Kontak
                        </h3>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <InfoItem
                                icon="☎️"
                                label="Nomor Telepon"
                            >
                                {location.phone}
                            </InfoItem>

                            <InfoItem
                                icon="💬"
                                label="WhatsApp"
                            >
                                {location.whatsapp}
                            </InfoItem>

                            <InfoItem
                                icon="✉️"
                                label="Email"
                            >
                                {location.email}
                            </InfoItem>
                        </div>
                    </section>

                    <div className="mb-8 border-t border-slate-100" />

                    <section>
                        <h3 className="mb-5 text-base font-semibold text-slate-900">
                            Jam Operasional
                        </h3>

                        <InfoItem
                            icon="🕒"
                            label="Waktu Operasional Toko"
                        >
                            {location.opening_hours}
                        </InfoItem>
                    </section>

                </div>
            </div>

            {toast && (
                <div
                    role="status"
                    className={`fixed bottom-5 right-5 z-[60] rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error"
                        ? "bg-red-600"
                        : "bg-teal-700"
                        }`}
                >
                    {toast.message}
                </div>
            )}

        </div>
    );
}