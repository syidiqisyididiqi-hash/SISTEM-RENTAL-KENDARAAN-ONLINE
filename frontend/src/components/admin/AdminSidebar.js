"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const menus = [
    {
        name: "Dasbor",
        href: "/admin/dashboard",
        icon: "▦",
    },
    {
        name: "Pengguna",
        href: "/admin/users",
        icon: "♙",
    },
    {
        name: "Kategori",
        href: "/admin/categories",
        icon: "▤",
    },
    {
        name: "Kendaraan",
        href: "/admin/vehicles",
        icon: "▰",
    },
    {
        name: "Pemesanan",
        href: "/admin/bookings",
        icon: "▣",
    },
    {
        name: "Pembayaran",
        href: "/admin/payments",
        icon: "▤",
    },
];

export default function AdminSidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    aria-label="Tutup menu"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 text-white transition-transform duration-300 md:sticky md:top-0 md:z-auto md:translate-x-0 ${
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between border-b border-slate-700 px-6 py-5">
                    <div>
                        <h1 className="text-xl font-bold">
                            Rental Kendaraan
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Admin Panel
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
                        aria-label="Tutup menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="p-4">
                    <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Menu
                    </p>

                    <div className="space-y-1">
                        {menus.map((menu) => {
                            const isActive =
                                pathname === menu.href ||
                                pathname.startsWith(
                                    `${menu.href}/`
                                );

                            return (
                                <Link
                                    key={menu.href}
                                    href={menu.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    <span className="w-5 text-center">
                                        {menu.icon}
                                    </span>

                                    <span>
                                        {menu.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>
        </>
    );
}