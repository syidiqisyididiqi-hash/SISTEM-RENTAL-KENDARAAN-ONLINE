"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import userService from "@/services/userService";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await userService.getProfile();

        setUser(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">
            Memuat profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <User className="mx-auto h-12 w-12 text-slate-300" />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Data profile tidak ditemukan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Silakan login kembali untuk melihat profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
              <User className="h-10 w-10 text-blue-600" />
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">
                {user.name}
              </h1>

              <p className="mt-1 text-sm text-blue-100">
                {user.email}
              </p>

              <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                {user.role === "admin" ? "Administrator" : "User"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between border-b pb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Informasi Profil
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informasi akun yang sedang digunakan
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/user/profile/edit/${user.id}`)}
              className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              <Pencil className="h-4 w-4" />
              Edit Profil
            </button>
          </div>

          <div className="mt-6 divide-y rounded-xl border">
            
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <User className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nama
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user.name || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-900">
                  {user.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nomor Telepon
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user.phone || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Alamat
                </p>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-900">
                  {user.address || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
