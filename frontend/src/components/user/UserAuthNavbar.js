"use client";

import Link from "next/link";
import {
    CarFront,
    Car,
    CalendarCheck,
    User,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    BookOpen,
    MapPin,
    ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import UserNavbar from "@/components/user/UserNavbar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const protectedRoutes = [
    "/user/dashboard",
    "/user/bookings",
    "/user/profile",
];

export default function UserAuthNavbar() {
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    const requiresAuth = protectedRoutes.some(
        (route) =>
            pathname === route ||
            pathname.startsWith(`${route}/`)
    );

    useEffect(() => {
        const readAuth = () => {
            const storedToken = sessionStorage.getItem("token");
            const storedUser = sessionStorage.getItem("user");

            setToken(storedToken);

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setAuthChecked(true);
        };

        readAuth();

        window.addEventListener("auth-change", readAuth);
        window.addEventListener("storage", readAuth);

        return () => {
            window.removeEventListener("auth-change", readAuth);
            window.removeEventListener("storage", readAuth);
        };
    }, []);

    const isUserSession =
        user?.role?.toLowerCase() === "user";

    useEffect(() => {
        if (!authChecked || !requiresAuth) {
            return;
        }

        if (!token || !isUserSession) {
            const returnTo =
                `${pathname}${window.location.search}`;

            router.replace(
                `/login?message=login-required&returnTo=${encodeURIComponent(returnTo)}`
            );
        }
    }, [
        authChecked,
        token,
        isUserSession,
        pathname,
        requiresAuth,
        router,
    ]);

    if (!authChecked) {
        return null;
    }

    if (!token || !isUserSession) {
        return requiresAuth ? null : <UserNavbar />;
    }

    const handleLogoutClick = () => {
        setIsOpen(false);
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        router.replace("/login");
    };

    const navItems = [
        { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
        { label: "Kendaraan", href: "/user/vehicles", icon: Car },
        { label: "Panduan Rental", href: "/user/rental-guide", icon: BookOpen },
        { label: "Informasi Toko", href: "/user/contact-location", icon: MapPin },
        { label: "Booking", href: "/user/bookings", icon: CalendarCheck },
        { label: "Profil", href: "/user/profile", icon: User },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-xs backdrop-blur-xl transition-all">
                <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    <Link
                        href="/user/dashboard"
                        className="group flex shrink-0 items-center gap-3.5 focus:outline-none"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 transition-all duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
                            <CarFront className="h-5 w-5" strokeWidth={2.2} />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight text-slate-900">
                                R E<span className="text-blue-600 font-extrabold">V </span>
                            </span>
                            <span className="text-[10px] font-semibold tracking-[2.5px] text-slate-400">
                                RENTAL VIHICLE
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] lg:text-[13px] font-semibold transition-all duration-200 ${isActive
                                            ? "bg-blue-50 text-blue-600 shadow-xs"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                        }`}
                                >
                                    <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="mx-1.5 h-6 w-px bg-slate-200/80" />

                        <div className="flex items-center gap-2.5 pl-1">
                            <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-700">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[10px] font-bold text-white uppercase shadow-xs">
                                    {user?.name ? user.name.charAt(0) : "U"}
                                </div>
                                <span className="max-w-[90px] lg:max-w-[110px] truncate font-bold text-slate-800">
                                    {user?.name}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-95"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden lg:inline">Logout</span>
                            </button>
                        </div>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 md:hidden focus:outline-none"
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? (
                            <X className="h-5 w-5 transition-transform duration-200 rotate-90 scale-110" />
                        ) : (
                            <Menu className="h-5 w-5 transition-transform duration-200" />
                        )}
                    </button>
                </div>

                {isOpen && (
                    <div className="border-t border-slate-100 bg-white/95 px-4 py-5 shadow-2xl backdrop-blur-2xl md:hidden sm:px-6">
                        <nav className="mx-auto flex max-w-7xl flex-col gap-1.5">

                            <div className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white uppercase shadow-xs">
                                    {user?.name ? user.name.charAt(0) : "U"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-medium">Logged in as</span>
                                    <span className="text-sm font-bold text-slate-800">{user?.name}</span>
                                </div>
                            </div>

                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
                                            {item.label}
                                        </span>

                                        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                                    </Link>
                                );
                            })}

                            <div className="my-2 border-t border-slate-100" />

                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.99]"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            <ConfirmDialog
                open={showLogoutConfirm}
                onCancel={() => setShowLogoutConfirm(false)}
                onConfirm={handleConfirmLogout}
                title="Konfirmasi Logout"
                description="Apakah Anda yakin ingin keluar dari akun?"
                confirmText="Logout"
                cancelText="Batal"
                type="danger"
            />
        </>
    );
}