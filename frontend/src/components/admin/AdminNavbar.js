"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

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
    const userInitial = userName.charAt(0).toUpperCase();

    const handleProfile = () => {
        setShowMenu(false);
        router.push("/admin/profile");
    };

    const handleLogout = () => {
        setShowMenu(false);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
                    aria-label="Buka menu"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <h2 className="text-lg font-semibold text-gray-800">
                    Admin Panel
                </h2>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-gray-100 md:gap-3 md:px-3"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        {userInitial}
                    </div>

                    <div className="hidden text-left sm:block">
                        <p className="text-sm font-semibold text-gray-800">
                            {userName}
                        </p>

                        <p className="text-xs text-gray-500">
                            {userRole}
                        </p>
                    </div>

                    <span className="text-xs text-gray-400">
                        ▼
                    </span>
                </button>

                {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                            type="button"
                            onClick={handleProfile}
                            className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                        >
                            Profile
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-gray-100"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}