import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <User className="h-7 w-7 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Profil Saya
            </h1>

            <p className="text-sm text-slate-500">
              Kelola informasi akun kamu
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Nama
            </label>

            <input
              type="text"
              placeholder="Nama pengguna"
              className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Email pengguna"
              className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Nomor Telepon
            </label>

            <input
              type="text"
              placeholder="Nomor telepon"
              className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Alamat
            </label>

            <textarea
              placeholder="Alamat"
              rows={4}
              className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}