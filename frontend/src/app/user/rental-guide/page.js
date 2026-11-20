"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    CircleAlert,
    RefreshCw,
} from "lucide-react";

import rentalGuideService from "@/services/rentalGuideService";
import { resolveImage } from "@/lib/rentalLocationHelpers";

function GuideSkeleton() {
    return (
        <div className="space-y-4" aria-label="Memuat panduan rental" aria-busy="true">
            {[1, 2, 3].map((step) => (
                <div
                    key={step}
                    className="grid animate-pulse gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_180px] sm:items-center sm:p-6"
                >
                    <div className="space-y-3">
                        <div className="h-4 w-20 rounded bg-slate-100" />
                        <div className="h-6 w-2/3 rounded bg-slate-100" />
                        <div className="h-4 w-full rounded bg-slate-100" />
                        <div className="h-4 w-4/5 rounded bg-slate-100" />
                    </div>
                    <div className="h-32 rounded-xl bg-slate-100" />
                </div>
            ))}
        </div>
    );
}

export default function UserRentalGuidePage() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchGuides = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await rentalGuideService.getActive();
                const guideList = response.data.data;

                if (isMounted) {
                    setGuides(Array.isArray(guideList) ? guideList : []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        "Gagal mengambil panduan rental."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchGuides();

        return () => {
            isMounted = false;
        };
    }, [reloadKey]);

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold text-blue-700">
                            PANDUAN PENYEWAAN
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Cara rental kendaraan
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                            Ikuti langkah-langkah berikut untuk menyewa kendaraan
                            dengan mudah dan memulai perjalananmu dengan tenang.
                        </p>
                        <a
                            href="#langkah-rental"
                            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            Lihat langkah rental
                            <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </header>

            <section
                id="langkah-rental"
                className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
            >
                <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Langkah penyewaan
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Semua yang perlu kamu ketahui sebelum berkendara.
                        </p>
                    </div>
                    {!loading && !error && guides.length > 0 && (
                        <p className="text-sm text-slate-500">
                            {guides.length} {guides.length === 1 ? "langkah" : "langkah"} panduan
                        </p>
                    )}
                </div>

                {loading ? (
                    <GuideSkeleton />
                ) : error ? (
                    <div
                        role="alert"
                        className="rounded-2xl border border-red-200 bg-white p-6 text-center"
                    >
                        <CircleAlert className="mx-auto text-red-600" size={24} />
                        <h3 className="mt-3 font-semibold text-slate-900">
                            Panduan belum dapat dimuat
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => setReloadKey((key) => key + 1)}
                            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            <RefreshCw size={15} />
                            Coba lagi
                        </button>
                    </div>
                ) : guides.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
                        <BookOpen className="mx-auto text-slate-400" size={30} />
                        <h3 className="mt-4 font-semibold text-slate-900">
                            Panduan belum tersedia
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Panduan penyewaan kendaraan belum ditambahkan.
                        </p>
                    </div>
                ) : (
                    <ol className="space-y-4">
                        {guides.map((guide, index) => {
                            const imageUrl = resolveImage(guide.image);

                            return (
                                <li key={guide.id}>
                                    <article className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center sm:p-6">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-50 px-1.5">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <span>Langkah {index + 1}</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {guide.title}
                                            </h3>
                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                                {guide.description}
                                            </p>
                                        </div>

                                        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-slate-100">
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={guide.title}
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 640px) 100vw, 200px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-400">
                                                    <BookOpen size={28} />
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ol>
                )}

                {!loading && !error && guides.length > 0 && (
                    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Siap memilih kendaraan?
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Temukan kendaraan yang sesuai dengan perjalananmu.
                            </p>
                        </div>
                        <Link
                            href="/user/vehicles"
                            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            Lihat kendaraan
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
