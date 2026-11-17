
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
} from "lucide-react";

import rentalGuideService from "@/services/rentalGuideService";
import { resolveImage } from "@/lib/rentalLocationHelpers";

export default function UserRentalGuidePage() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                setLoading(true);

                const response = await rentalGuideService.getActive();

                setGuides(response.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Gagal mengambil panduan rental."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="bg-blue-700 px-5 py-16 text-white">
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                        <BookOpen size={17} />
                        <span>Panduan Pengguna</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                        Cara Rental Kendaraan
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                        Ikuti langkah-langkah berikut untuk melakukan
                        penyewaan kendaraan dengan mudah dan praktis
                        melalui layanan rental kami.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-12">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-blue-600">
                        <ClipboardList size={20} />
                        <span className="text-sm font-semibold">
                            LANGKAH PENYEWAAN
                        </span>
                    </div>

                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                        Ikuti Proses Rental
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Berikut tahapan yang perlu kamu lakukan untuk
                        menyewa kendaraan.
                    </p>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-sm text-gray-500">
                        Memuat panduan rental...
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
                        {error}
                    </div>
                ) : guides.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center">
                        <BookOpen
                            size={42}
                            className="mx-auto text-gray-300"
                        />

                        <h3 className="mt-4 font-semibold text-gray-800">
                            Panduan belum tersedia
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            Panduan penyewaan kendaraan belum ditambahkan.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {guides.map((guide, index) => (
                            <article
                                key={guide.id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_280px]">
                                    <div className="flex items-center justify-center bg-blue-50 p-5 md:items-start">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center p-6">
                                        <div className="mb-3 flex items-center gap-2">
                                            <CheckCircle2
                                                size={17}
                                                className="text-green-600"
                                            />

                                            <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                                Langkah {index + 1}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900">
                                            {guide.title}
                                        </h3>

                                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                                            {guide.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center bg-gray-50 p-5">
                                        {guide.image ? (
                                            <img
                                                src={resolveImage(guide.image)}
                                                alt={guide.title}
                                                className="h-48 w-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                                <BookOpen size={40} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className="mt-12 rounded-xl bg-blue-50 p-7 text-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        Siap Menyewa Kendaraan?
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Temukan kendaraan yang sesuai dengan kebutuhan perjalananmu.
                    </p>

                    <Link
                        href="/user/vehicles"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Lihat Kendaraan
                        <ArrowRight size={17} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
