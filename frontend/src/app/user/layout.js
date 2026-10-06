"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import UserFooter from "@/components/user/UserFooter";
import UserAuthNavbar from "@/components/user/UserAuthNavbar";

export default function UserLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    const isPublicRoute =
        pathname === "/user/vehicles" ||
        pathname.startsWith("/user/vehicles/");

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

        return () => {
            window.removeEventListener("auth-change", readAuth);
        };
    }, []);

    useEffect(() => {
        if (!authChecked || isPublicRoute) {
            return;
        }

        if (!token || user?.role?.toLowerCase() !== "user") {
            const returnTo =
                `${pathname}${window.location.search}`;

            router.replace(
                `/login?message=login-required&returnTo=${encodeURIComponent(returnTo)}`
            );
        }
    }, [
        authChecked,
        isPublicRoute,
        pathname,
        router,
        token,
        user,
    ]);

    if (!authChecked && !isPublicRoute) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    Memeriksa autentikasi...
                </p>
            </div>
        );
    }

    if (
        authChecked &&
        !isPublicRoute &&
        (!token || user?.role?.toLowerCase() !== "user")
    ) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    Mengarahkan ke halaman login...
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