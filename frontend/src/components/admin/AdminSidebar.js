"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { 
    X, 
    LayoutDashboard, 
    Users, 
    Tags, 
    CarFront, 
    CalendarCheck, 
    CreditCard, 
    LogOut,
    User
} from "lucide-react";

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

const menus = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Pengguna", href: "/admin/users", icon: Users },
    { name: "Kategori", href: "/admin/categories", icon: Tags },
    { name: "Kendaraan", href: "/admin/vehicles", icon: CarFront },
    { name: "Pemesanan", href: "/admin/bookings", icon: CalendarCheck },
    { name: "Pembayaran", href: "/admin/payments", icon: CreditCard },
];

export default function AdminSidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
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
    const userEmail = user?.email || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity md:hidden"
                    aria-label="Tutup menu"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 flex-col bg-white border-r border-gray-200 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-auto md:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-30 shrink-0 items-center justify-between border-b border-gray-400 px-11.5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex shrink-0 items-center justify-center">
                            <Image
                                src="/images/logo.png"
                                alt="Logo"
                                width={80} 
                                height={80}
                                className="h-30 w-45 object-contain" 
                            />
                        </div>
                        
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
                        aria-label="Tutup menu"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3.5 py-4 custom-scrollbar">
                    <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Menu Utama
                    </p>

                    <div className="space-y-1">
                        {menus.map((menu) => {
                            const isActive =
                                pathname === menu.href ||
                                pathname.startsWith(`${menu.href}/`);

                            const Icon = menu.icon;

                            return (
                                <Link
                                    key={menu.href}
                                    href={menu.href}
                                    onClick={onClose}
                                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600 font-semibold"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                >
                                    <Icon 
                                        className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                                            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                        }`} 
                                    />
                                    <span className="truncate">{menu.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="shrink-0 border-t border-gray-100 p-3">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-2.5 border border-gray-100">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <User className="h-4.5 w-4.5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-gray-900">
                                {userName}
                            </p>
                            <p className="truncate text-[11px] text-gray-500">
                                {userEmail}
                            </p>
                        </div>

                        <button 
                            type="button"
                            onClick={() => setShowLogoutDialog(true)}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Keluar"
                            aria-label="Keluar"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>
            </aside>
            <ConfirmDialog
                open={showLogoutDialog}
                type="warning"
                title="Keluar dari akun?"
                description="Anda akan keluar dari akun admin saat ini."
                confirmText="Ya, keluar"
                cancelText="Tidak"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutDialog(false)}
            />
        </>
    );
}