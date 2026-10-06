"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = sessionStorage.getItem("token");
            const storedUser = sessionStorage.getItem("user");

            if (!token || !storedUser) {
                setAuthorized(false);
                router.replace("/login");
                return;
            }

            try {
                const user = JSON.parse(storedUser);

                if (user.role !== "admin") {
                    setAuthorized(false);
                    router.replace("/user/dashboard");
                    return;
                }

                setAuthorized(true);
            } catch (error) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                setAuthorized(false);
                router.replace("/login");
            }
        };

        checkAuth();

        const handleAuthChange = () => {
            checkAuth();
        };

        const handleAuthForbidden = () => {
            setAuthorized(false);
            router.replace("/user/dashboard");
        };

        window.addEventListener("auth-change", handleAuthChange);
        window.addEventListener("auth-forbidden", handleAuthForbidden);

        return () => {
            window.removeEventListener("auth-change", handleAuthChange);
            window.removeEventListener("auth-forbidden", handleAuthForbidden);
        };
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
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="shrink-0">
                    <AdminNavbar
                        onMenuClick={() => setSidebarOpen(true)}
                    />
                </div>

                <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}