"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    ShieldCheck, 
    Edit3, 
    AlertCircle, 
    RefreshCw 
} from "lucide-react";
import userService from "@/services/userService";

export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getProfile = useCallback(async () => {
        try {
            const response = await Promise.resolve().then(() =>
                userService.getProfile()
            );
            const profileData = response?.data?.data || response?.data || null;

            if (profileData) {
                setUser(profileData);
                localStorage.setItem("user", JSON.stringify(profileData));
                return;
            }

            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error(err);

            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            }

            setError(
                err.response?.data?.message ||
                    "Gagal mengambil data profile."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(getProfile);
    }, [getProfile]);

    const handleRetry = () => {
        setLoading(true);
        setError("");
        getProfile();
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-7 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-48 bg-gray-100 rounded-md animate-pulse" />
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-8">
                    <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
                        <div className="h-20 w-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
                        <div className="space-y-2.5 flex-1">
                            <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse" />
                            <div className="h-4 w-56 bg-gray-100 rounded-md animate-pulse" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="h-20 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl">
                <h1 className="text-xl font-bold text-gray-900">
                    Profile
                </h1>

                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-red-700">
                        {error || "Data profile tidak ditemukan."}
                    </p>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Coba Lagi</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        Profile
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Kelola informasi akun dan pengaturan identitas kamu.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        router.push(`/admin/profile/edit/${user.id}`)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
                >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-gray-100 pb-8 text-center sm:text-left">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 sm:text-xl truncate">
                            {user.name}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium truncate">
                            {user.email}
                        </p>
                        
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-100">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span className="capitalize">{user.role || "User"}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                        Rincian Informasi
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100/80 transition-all hover:bg-gray-50">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
                                <User className="h-4.5 w-4.5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-400">Nama Lengkap</p>
                                <p className="mt-0.5 text-xs font-bold text-gray-800 truncate">
                                    {user.name || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100/80 transition-all hover:bg-gray-50">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
                                <Mail className="h-4.5 w-4.5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-400">Alamat Email</p>
                                <p className="mt-0.5 text-xs font-bold text-gray-800 truncate">
                                    {user.email || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100/80 transition-all hover:bg-gray-50">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
                                <Phone className="h-4.5 w-4.5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-400">Nomor Telepon</p>
                                <p className="mt-0.5 text-xs font-bold text-gray-800 truncate">
                                    {user.phone || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100/80 transition-all hover:bg-gray-50">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
                                <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-400">Hak Akses / Role</p>
                                <p className="mt-0.5 text-xs font-bold text-gray-800 truncate capitalize">
                                    {user.role || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100/80 transition-all hover:bg-gray-50">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-2xs border border-gray-100">
                                <MapPin className="h-4.5 w-4.5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium text-gray-400">Alamat Lengkap</p>
                                <p className="mt-0.5 text-xs font-bold text-gray-800 leading-relaxed">
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