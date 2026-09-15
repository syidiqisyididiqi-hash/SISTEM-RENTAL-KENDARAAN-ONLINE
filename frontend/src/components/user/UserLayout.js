"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import UserFooter from "@/components/user/UserFooter";
import UserAuthNavbar from "@/components/user/UserAuthNavbar";

export default function UserLayout({ children }) {
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

            if (user.role !== "user") {
                router.replace("/admin/dashboard");
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
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    Memeriksa autentikasi...
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <UserAuthNavbar />

            <main className="flex-1">
                {children}
            </main>

            <UserFooter />
        </div>
    );
}