import Link from "next/link";
import { ArrowLeft, CarFront, Check } from "lucide-react";

export default async function VehicleDetailPage({ params }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/user/vehicles"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke kendaraan
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="flex min-h-96 items-center justify-center rounded-xl bg-slate-100">
          <CarFront className="h-32 w-32 text-slate-300" />
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-600">
            DETAIL KENDARAAN
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Toyota Avanza
          </h1>

          <p className="mt-2 text-slate-500">
            Toyota · ID Kendaraan {id}
          </p>

          <p className="mt-6 text-3xl font-bold text-blue-600">
            Rp350.000
            <span className="text-base font-normal text-slate-500">
              {" "}
              / hari
            </span>
          </p>

          <div className="mt-8 rounded-xl border bg-white p-6">
            <h2 className="font-semibold text-slate-900">
              Informasi Kendaraan
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-600" />
                Kendaraan tersedia
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-600" />
                Kondisi kendaraan terawat
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Check className="h-4 w-4 text-green-600" />
                Harga rental per hari
              </div>
            </div>
          </div>

          <Link
            href="/user/bookings/create"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Booking Kendaraan
          </Link>
        </div>
      </div>
    </div>
  );
}