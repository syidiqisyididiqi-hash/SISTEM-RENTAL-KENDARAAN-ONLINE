"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.replace("/login");
            return;
        }

        try {
            const user = JSON.parse(storedUser);

            if (user.role !== "admin") {
                router.replace("/user/dashboard");
                return;
            }

            requestAnimationFrame(() => setAuthorized(true));
        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.replace("/login");
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-sm text-slate-500">
                    Memeriksa autentikasi...
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            <aside className="w-64 shrink-0">
                <AdminSidebar />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="shrink-0">
                    <AdminNavbar />
                </div>

                <main className="min-h-0 flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}