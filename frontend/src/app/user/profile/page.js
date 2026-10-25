"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Pencil, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import userService from "@/services/userService";
import LinkButton from "@/components/ui/LinkButton";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Halo");

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 11) {
      setGreeting("Selamat Pagi");
    } else if (currentHour < 15) {
      setGreeting("Selamat Siang");
    } else if (currentHour < 18) {
      setGreeting("Selamat Sore");
    } else {
      setGreeting("Selamat Malam");
    }

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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm animate-pulse">
          <div className="h-40 bg-slate-100" />
          <div className="p-8 space-y-6">
            <div className="h-6 bg-slate-100 rounded-md w-1/3" />
            <div className="space-y-4">
              <div className="h-14 bg-slate-50 rounded-2xl" />
              <div className="h-14 bg-slate-50 rounded-2xl" />
              <div className="h-14 bg-slate-50 rounded-2xl" />
              <div className="h-14 bg-slate-50 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200/70 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <User className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Data profile tidak ditemukan
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Sesi Anda mungkin telah berakhir. Silakan login kembali untuk melihat profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-all">
        
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-8 sm:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="relative z-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20">
                <User className="h-10 w-10 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-slate-950">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                {greeting},
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user.name}
              </h1>
              <p className="mt-0.5 text-sm text-slate-300">
                {user.email}
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                {user.role === "admin" ? "Administrator" : "User Account"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Informasi Profil
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Detail informasi akun yang terdaftar dalam sistem
              </p>
            </div>

            <LinkButton
                href={`/user/profile/edit/${user.id}`}
                variant="edit"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profil
              </LinkButton>
          </div>

          <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-2xs">
            
            <div className="flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Nama Lengkap
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {user.name || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Alamat Email
                </p>
                <p className="mt-0.5 break-all text-sm font-medium text-slate-900">
                  {user.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Nomor Telepon
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {user.phone || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Alamat Tempat Tinggal
                </p>
                <p className="mt-0.5 text-sm font-medium leading-relaxed text-slate-900">
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