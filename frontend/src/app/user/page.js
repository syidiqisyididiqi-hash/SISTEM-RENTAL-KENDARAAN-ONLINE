import Link from "next/link";
import { ArrowRight, CarFront, CalendarCheck, ShieldCheck } from "lucide-react";

export default function UserDashboard() {
  return (
    <div>
      <section className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-400">
              Rental Kendaraan Online
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Temukan kendaraan yang sesuai dengan kebutuhanmu
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Pilih kendaraan, tentukan tanggal rental, dan lakukan booking
              dengan mudah melalui sistem rental kendaraan online.
            </p>

            <div className="mt-8">
              <Link
                href="/user/vehicles"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Lihat Kendaraan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <CarFront className="h-8 w-8 text-blue-600" />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Banyak Pilihan Kendaraan
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Temukan berbagai jenis kendaraan sesuai kebutuhan perjalananmu.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <CalendarCheck className="h-8 w-8 text-blue-600" />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Booking Mudah
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tentukan kendaraan dan tanggal rental tanpa proses yang rumit.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <ShieldCheck className="h-8 w-8 text-blue-600" />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Proses Terpercaya
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kelola booking dan pembayaran melalui satu sistem terintegrasi.
          </p>
        </div>
      </section>
    </div>
  );
}