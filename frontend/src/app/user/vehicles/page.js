"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CarFront, ArrowRight, CircleAlert } from "lucide-react";
import vehicleService from "@/services/vehicleService";

const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `http://localhost:5000${image}`;
    }

    return `http://localhost:5000/${image}`;
  }

  return null;
};

function VehicleSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      aria-hidden="true"
    >
      <div className="h-52 animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-px bg-slate-100" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await vehicleService.getAvailable();

        setVehicles(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil data kendaraan:", error);

        setError(
          error.response?.data?.message ||
            "Gagal mengambil data kendaraan"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-blue-600">
            Katalog kendaraan
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pilih Kendaraan
          </h1>

          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Pilih kendaraan yang sesuai dengan kebutuhan rental kamu.
          </p>

          {!loading && !error && vehicles.length > 0 && (
            <p className="mt-4 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {vehicles.length}
              </span>{" "}
              kendaraan siap disewa
            </p>
          )}
        </header>

        {/* Loading */}
        {loading && (
          <div
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Memuat kendaraan...</span>
            {[...Array(6)].map((_, i) => (
              <VehicleSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="mt-10 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Kendaraan tidak dapat dimuat
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && vehicles.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <CarFront className="h-8 w-8 text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Belum ada kendaraan tersedia
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Saat ini belum ada kendaraan yang dapat dirental.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && vehicles.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => {
              const imageUrl = getImageUrl(vehicle.image);

              return (
                <article
                  key={vehicle.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:border-slate-300 hover:shadow-lg motion-reduce:transition-none"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={vehicle.name || "Kendaraan"}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <CarFront className="h-16 w-16 text-slate-300" />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-green-700 shadow-sm backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Tersedia
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div>
                      <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">
                        {vehicle.name}
                      </h2>

                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {vehicle.brand}
                        {vehicle.model ? ` • ${vehicle.model}` : ""}
                      </p>
                    </div>

                    <div className="mt-auto pt-5">
                      <div className="flex items-baseline justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm text-slate-500">
                          Harga sewa
                        </span>

                        <p className="text-xl font-bold text-blue-600">
                          Rp
                          {Number(vehicle.price_per_day).toLocaleString(
                            "id-ID"
                          )}
                          <span className="text-sm font-normal text-slate-500">
                            {" "}
                            / hari
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/user/vehicles/${vehicle.id}`}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none"
                      >
                        Lihat Detail
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}