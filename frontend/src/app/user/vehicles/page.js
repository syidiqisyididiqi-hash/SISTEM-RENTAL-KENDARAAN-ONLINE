import Link from "next/link";
import { CarFront, ArrowRight } from "lucide-react";

const vehicles = [
  {
    id: 1,
    name: "Toyota Avanza",
    brand: "Toyota",
    price: 350000,
    status: "available",
  },
  {
    id: 2,
    name: "Honda Brio",
    brand: "Honda",
    price: 300000,
    status: "available",
  },
  {
    id: 3,
    name: "Toyota Innova",
    brand: "Toyota",
    price: 500000,
    status: "available",
  },
];

export default function VehiclesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          KATALOG KENDARAAN
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Pilih Kendaraan
        </h1>

        <p className="mt-2 text-slate-500">
          Pilih kendaraan yang sesuai dengan kebutuhan rental kamu.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="overflow-hidden rounded-xl border bg-white shadow-sm"
          >
            <div className="flex h-48 items-center justify-center bg-slate-100">
              <CarFront className="h-20 w-20 text-slate-300" />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {vehicle.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {vehicle.brand}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                  Tersedia
                </span>
              </div>

              <p className="mt-5 text-lg font-bold text-blue-600">
                Rp{vehicle.price.toLocaleString("id-ID")}
                <span className="text-sm font-normal text-slate-500">
                  {" "}
                  / hari
                </span>
              </p>

              <Link
                href={`/user/vehicles/${vehicle.id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Lihat Detail
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}