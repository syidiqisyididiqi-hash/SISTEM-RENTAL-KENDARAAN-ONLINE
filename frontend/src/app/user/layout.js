"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

import UserFooter from "@/components/user/UserFooter";
import UserAuthNavbar from "@/components/user/UserAuthNavbar";

const subscribeToAuth = (onChange) => {
    window.addEventListener("storage", onChange);
    window.addEventListener("auth-change", onChange);

    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("auth-change", onChange);
    };
};

const getSessionValue = (key) => {
    if (typeof window === "undefined") {
        return null;
    }

    return sessionStorage.getItem(key);
};

export default function UserLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const isPublicRoute =
        pathname === "/user/vehicles" ||
        pathname.startsWith("/user/vehicles/");
    const token = useSyncExternalStore(
        subscribeToAuth,
        () => getSessionValue("token"),
        () => null
    );
    const storedUser = useSyncExternalStore(
        subscribeToAuth,
        () => getSessionValue("user"),
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

    const authorized = Boolean(token && user?.role === "user");

    useEffect(() => {
        if (isPublicRoute) {
            return;
        }

        if (!token || !storedUser || !user) {
            const returnTo = `${pathname}${window.location.search}`;
            router.replace(
                `/login?message=login-required&returnTo=${encodeURIComponent(returnTo)}`
            );
            return;
        }

        if (user.role !== "user") {
            router.replace("/admin/dashboard");
        }
    }, [isPublicRoute, pathname, router, storedUser, token, user]);

    if (!isPublicRoute && !authorized) {
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