"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, User, LogOut } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const subscribeToUser = (onChange) => {
    const handleChange = () => onChange();

    window.addEventListener("storage", handleChange);
    window.addEventListener("auth-change", handleChange);

    return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener("auth-change", handleChange);
    };
};

const getUserSnapshot = () => {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("user");
};

export default function AdminNavbar({ onMenuClick }) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const storedUser = useSyncExternalStore(
        subscribeToUser,
        getUserSnapshot,
        () => null
    );

    let user = null;

    if (storedUser) {
        try {
            user = JSON.parse(storedUser);
        } catch {
            user = null;
        }
    }

    const userName = user?.name || "Administrator";
    const userRole = user?.role || "Admin";
    const userEmail = user?.email || "admin@rental.com";
    const userInitial = userName.charAt(0).toUpperCase();

    const handleProfile = () => {
        setShowMenu(false);
        router.push("/admin/profile");
    };

    const handleLogoutClick = () => {
        setShowMenu(false);
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
    };

    return (
        <>
            <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md px-4 md:px-8">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
                        aria-label="Buka menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="hidden sm:block">
                        <h2 className="text-base font-bold text-gray-800">
                            Admin Panel
                        </h2>
                        <p className="text-[11px] text-gray-400">
                            Kelola sistem dan reservasi
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-3 rounded-xl p-1.5 transition-all duration-150 hover:bg-gray-50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
                            {userInitial}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-bold text-gray-900 leading-tight">
                                {userName}
                            </p>
                            <p className="text-[11px] font-medium text-gray-400">
                                {userRole}
                            </p>
                        </div>

                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowMenu(false)} 
                            />
                            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl transition-all">
                                <div className="border-b border-gray-100 px-3 py-2.5">
                                    <p className="text-xs font-bold text-gray-900">{userName}</p>
                                    <p className="truncate text-[11px] text-gray-400">{userEmail}</p>
                                </div>

                                <div className="py-1">
                                    <button
                                        type="button"
                                        onClick={handleProfile}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                                    >
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span>Profil Saya</span>
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleLogoutClick}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4 text-red-500" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>

            <ConfirmDialog
                open={showLogoutConfirm}
                onCancel={() => setShowLogoutConfirm(false)}
                onConfirm={handleConfirmLogout}
                title="Konfirmasi Keluar"
                description="Apakah Anda yakin ingin keluar dari halaman admin?"
                confirmText="Keluar"
                cancelText="Batal"
                type="danger"
            />
        </>
    );
}