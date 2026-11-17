
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CarFront,
  ArrowRight,
  CircleAlert,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import vehicleService from "@/services/vehicleService";

const getImageUrl = (image) => {
  if (!image) return null;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `http://localhost:5000${image}`;
  }

  return `http://localhost:5000/${image}`;
};

function VehicleSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await vehicleService.getAll({
          search: search.trim(),
          status: "available",
          sortBy,
          sortOrder,
          page,
          limit: 10,
        });

        if (!isMounted) return;

        const result = response.data;
        const vehicleList = Array.isArray(result.data) ? result.data : [];

        setVehicles(vehicleList);

        setPagination(
          result.pagination || {
            total: vehicleList.length,
            page: 1,
            limit: 10,
            totalPages: vehicleList.length ? 1 : 0,
          }
        );
      } catch (error) {
        if (!isMounted) return;

        console.error("Gagal mengambil data kendaraan:", error);

        setError(
          error.response?.data?.message ||
            "Gagal mengambil data kendaraan"
        );

        setVehicles([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVehicles();

    return () => {
      isMounted = false;
    };
  }, [search, sortBy, sortOrder, page, reloadKey]);

  const handleReset = () => {
    setSearch("");
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  };

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
            Temukan kendaraan yang sesuai dengan kebutuhan rental kamu.
          </p>
        </header>

        {/* Search & Filter */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, merek, atau model kendaraan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 md:w-64">
              <SlidersHorizontal className="h-5 w-5 shrink-0 text-slate-400" />

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [column, order] = e.target.value.split("-");
                  setSortBy(column);
                  setSortOrder(order);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="created_at-desc">Terbaru</option>
                <option value="price_per_day-asc">Harga termurah</option>
                <option value="price_per_day-desc">Harga termahal</option>
                <option value="name-asc">Nama A - Z</option>
                <option value="name-desc">Nama Z - A</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              {loading
                ? "Memuat kendaraan..."
                : `${pagination.total} kendaraan ditemukan`}
            </p>

            {(search || sortBy !== "created_at" || sortOrder !== "desc") && (
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Reset pencarian
              </button>
            )}
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
            className="mt-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Kendaraan tidak dapat dimuat
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                onClick={() => setReloadKey((prev) => prev + 1)}
                className="mt-3 text-sm font-semibold text-red-800 underline"
              >
                Coba muat ulang
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && vehicles.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <CarFront className="h-8 w-8 text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              {search
                ? "Kendaraan tidak ditemukan"
                : "Belum ada kendaraan tersedia"}
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "Coba gunakan kata kunci pencarian yang berbeda."
                : "Saat ini belum ada kendaraan yang dapat disewa."}
            </p>

            {search && (
              <button
                onClick={handleReset}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Reset pencarian
              </button>
            )}
          </div>
        )}

        {/* Vehicle List */}
        {!loading && !error && vehicles.length > 0 && (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => {
                const imageUrl = getImageUrl(vehicle.image);

                return (
                  <article
                    key={vehicle.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:border-slate-300 hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={vehicle.name || "Kendaraan"}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <CarFront className="h-16 w-16 text-slate-300" />
                        </div>
                      )}

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-green-700 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Tersedia
                      </span>
                    </div>

                    {/* Content */}
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
                        <div className="flex items-baseline justify-between gap-2 border-t border-slate-100 pt-4">
                          <span className="text-sm text-slate-500">
                            Harga sewa
                          </span>

                          <p className="text-xl font-bold text-blue-600">
                            Rp{Number(vehicle.price_per_day).toLocaleString("id-ID")}
                            <span className="text-sm font-normal text-slate-500">
                              {" "}/ hari
                            </span>
                          </p>
                        </div>

                        <Link
                          href={`/user/vehicles/${vehicle.id}`}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        >
                          Lihat Detail
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>

                <span className="text-sm font-medium text-slate-600">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
