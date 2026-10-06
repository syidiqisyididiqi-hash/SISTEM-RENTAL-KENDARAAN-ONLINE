"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CarFront,
    PackageCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import bookingService from "@/services/bookingService";
import vehicleService from "@/services/vehicleService";

const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

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

const toUtcDate = (date) => {
    const [year, month, day] = date.split("-").map(Number);

    return Date.UTC(year, month - 1, day);
};

function BookingFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const vehicleId = searchParams.get("vehicleId");

    const [vehicle, setVehicle] = useState(null);
    const [loadingVehicle, setLoadingVehicle] = useState(
        Boolean(vehicleId)
    );

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState(
        vehicleId
            ? ""
            : "Pilih kendaraan terlebih dahulu dari katalog."
    );

    const [formData, setFormData] = useState({
        start_date: getToday(),
        end_date: "",
        notes: "",
    });

    useEffect(() => {
        if (!vehicleId) {
            return;
        }

        let active = true;

        vehicleService
            .getById(vehicleId)
            .then((response) => {
                if (active) {
                    setVehicle(response.data?.data || null);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "Gagal mengambil data kendaraan."
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingVehicle(false);
                }
            });

        return () => {
            active = false;
        };
    }, [vehicleId]);

    const stock = Number(vehicle?.stock) || 0;

    const canBook =
        vehicle?.status === "available" &&
        stock > 0;

    const totalDays =
        formData.start_date &&
        formData.end_date &&
        formData.end_date >= formData.start_date
            ? (toUtcDate(formData.end_date) -
                  toUtcDate(formData.start_date)) /
                  86400000 +
              1
            : 0;

    const pricePerDay =
        Number(vehicle?.price_per_day) || 0;

    const totalPrice =
        totalDays * pricePerDay;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!canBook) {
            setError(
                "Kendaraan ini sedang tidak tersedia untuk booking."
            );
            return;
        }

        if (
            !formData.start_date ||
            !formData.end_date
        ) {
            setError(
                "Tanggal mulai dan tanggal selesai wajib diisi."
            );
            return;
        }

        if (
            formData.end_date <
            formData.start_date
        ) {
            setError(
                "Tanggal selesai tidak boleh sebelum tanggal mulai."
            );
            return;
        }

        try {
            setSubmitting(true);

            const response =
                await bookingService.create({
                    vehicle_id: Number(vehicle.id),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    notes:
                        formData.notes.trim() ||
                        null,
                });

            const bookingId =
                response.data?.data?.id;

            if (bookingId) {
                router.push(
                    `/user/payments/${bookingId}`
                );
            } else {
                router.push("/user/bookings");
            }
        } catch (requestError) {
            console.error("Gagal membuat booking:", requestError);

            const responseMessage =
                requestError.response?.data?.message ||
                requestError.response?.data?.error;

            if (responseMessage) {
                setError(responseMessage);
            } else if (requestError.response) {
                setError(
                    `Booking gagal dibuat (HTTP ${requestError.response.status}).`
                );
            } else {
                setError(
                    "Tidak dapat terhubung ke server booking. Pastikan backend berjalan, lalu coba lagi."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingVehicle) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
                Memuat kendaraan...
            </main>
        );
    }

    if (!vehicle) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="text-sm text-red-700">
                        {error}
                    </p>

                    <Link
                        href="/user/vehicles"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke kendaraan
                    </Link>
                </div>
            </main>
        );
    }

    const imageUrl =
        getImageUrl(vehicle.image);

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
                href={`/user/vehicles/${vehicle.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke detail kendaraan
            </Link>

            <div className="mb-6 mt-6">
                <p className="text-sm font-semibold text-blue-700">
                    PEMESANAN KENDARAAN
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                    Buat booking
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Tentukan periode rental untuk kendaraan pilihanmu.
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

            <form
                onSubmit={handleSubmit}
                className="grid gap-6 lg:grid-cols-[1fr_320px]"
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
                                {vehicle.name}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {[
                                    vehicle.brand,
                                    vehicle.model,
                                    vehicle.year,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>

                            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                                <PackageCheck className="h-4 w-4" />

                                {canBook
                                    ? `${stock} unit tersedia`
                                    : "Stok habis"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="start_date"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Tanggal mulai
                            </label>

                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                <input
                                    id="start_date"
                                    type="date"
                                    name="start_date"
                                    value={
                                        formData.start_date
                                    }
                                    min={getToday()}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="end_date"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Tanggal selesai
                            </label>

                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                <input
                                    id="end_date"
                                    type="date"
                                    name="end_date"
                                    value={
                                        formData.end_date
                                    }
                                    min={
                                        formData.start_date ||
                                        getToday()
                                    }
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="notes"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Catatan untuk rental
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            maxLength={500}
                            placeholder="Tambahkan catatan jika diperlukan"
                            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                        />
                    </div>
                </section>

                <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-semibold text-gray-900">
                        Rincian biaya
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {formatPrice(pricePerDay)} / hari
                    </p>

                    <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm">
                        <div className="flex justify-between gap-4 text-gray-600">
                            <span>Durasi</span>

                            <span className="font-medium text-gray-900">
                                {totalDays || 0} hari
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                            <span className="font-medium text-gray-700">
                                Total pembayaran
                            </span>

                            <span className="text-right font-semibold text-blue-700">
                                {formatPrice(
                                    totalPrice
                                )}
                            </span>
                        </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-gray-500">
                        Setelah booking berhasil dibuat,
                        kamu akan diarahkan ke halaman pembayaran
                        untuk melakukan pembayaran dan mengunggah
                        bukti pembayaran.
                    </p>

                    <button
                        type="submit"
                        disabled={
                            !canBook ||
                            submitting
                        }
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {submitting
                            ? "Menyimpan booking..."
                            : "Buat booking & lanjut pembayaran"}
                    </button>
                </aside>
            </form>
        </main>
    );
}

export default function CreateUserBookingPage() {
    return (
        <Suspense
            fallback={
                <main className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
                    Memuat form booking...
                </main>
            }
        >
            <BookingFormPage />
        </Suspense>
    );
}