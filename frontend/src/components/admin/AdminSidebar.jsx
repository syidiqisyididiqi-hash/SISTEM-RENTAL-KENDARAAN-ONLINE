"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: "▦",
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: "♙",
    },
    {
        name: "Categories",
        href: "/admin/categories",
        icon: "▤",
    },
    {
        name: "Vehicles",
        href: "/admin/vehicles",
        icon: "▰",
    },
    {
        name: "Bookings",
        href: "/admin/bookings",
        icon: "▣",
    },
    {
        name: "Payments",
        href: "/admin/payments",
        icon: "▤",
    },
    {
        name: "Profile",
        href: "/admin/profile",
        icon: "●",
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white">
            <div className="border-b border-slate-700 px-6 py-5">
                <h1 className="text-xl font-bold">
                    Rental Kendaraan
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Admin Panel
                </p>
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
    );
}