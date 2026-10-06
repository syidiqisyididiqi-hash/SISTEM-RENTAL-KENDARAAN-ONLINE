"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, CarFront, Check, CircleAlert } from "lucide-react";
import { useParams } from "next/navigation";
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

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-900">
        {children}
      </dd>
    </div>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await vehicleService.getById(id);

        setVehicle(response.data.data);
      } catch (requestError) {
        console.error(
          "Gagal mengambil detail kendaraan:",
          requestError
        );

        setError(
          requestError.response?.data?.message ||
            "Gagal mengambil detail kendaraan"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Memuat detail kendaraan...</span>

          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-slate-200 sm:h-96" />

            <div className="space-y-4">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-9 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <div
            className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
            role="alert"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <CircleAlert className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-4 text-lg font-semibold text-red-900">
              Detail kendaraan tidak dapat ditampilkan
            </h1>

            <p className="mt-1 text-sm text-red-700">
              {error || "Kendaraan tidak ditemukan"}
            </p>

            <Link
              href="/user/vehicles"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke kendaraan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(vehicle.image);
  const isAvailable = vehicle.status === "available";
  const stock = Number(vehicle.stock) || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/user/vehicles"
          className="group inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
          Kembali ke kendaraan
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Gambar */}
          <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-96 lg:sticky lg:top-8">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={vehicle.name || "Kendaraan"}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <CarFront className="h-28 w-28 text-slate-300" />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isAvailable
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAvailable ? "bg-green-500" : "bg-slate-500"
                }`}
              />
              {isAvailable ? "Tersedia" : vehicle.status}
            </span>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {vehicle.name}
            </h1>

            <p className="mt-2 text-slate-500">
              {vehicle.brand}
              {vehicle.model ? ` · ${vehicle.model}` : ""}
              {vehicle.year ? ` · ${vehicle.year}` : ""}
            </p>

            <p className="mt-6 text-3xl font-bold text-blue-600">
              Rp{Number(vehicle.price_per_day).toLocaleString("id-ID")}
              <span className="text-base font-normal text-slate-500">
                {" "}
                / hari
              </span>
            </p>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">
                Informasi Kendaraan
              </h2>

              <dl className="mt-2 divide-y divide-slate-100">
                <InfoRow label="Status">
                  <span className="inline-flex items-center gap-1.5">
                    {isAvailable && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {isAvailable ? "Tersedia" : vehicle.status}
                  </span>
                </InfoRow>

                <InfoRow label="Stok">{stock} unit</InfoRow>

                <InfoRow label="Kategori">
                  {vehicle.category_name || "-"}
                </InfoRow>

                <InfoRow label="Nomor plat">
                  {vehicle.license_plate || "-"}
                </InfoRow>
              </dl>

              {vehicle.description && (
                <div className="mt-2 border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-medium text-slate-900">
                    Deskripsi
                  </h3>

                  <p className="mt-2 max-w-prose text-sm leading-6 text-slate-600">
                    {vehicle.description}
                  </p>
                </div>
              )}
            </section>

            {isAvailable && stock > 0 && (
              <Link
                href={`/user/bookings/create?vehicleId=${vehicle.id}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:transition-none"
              >
                Booking Kendaraan
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}