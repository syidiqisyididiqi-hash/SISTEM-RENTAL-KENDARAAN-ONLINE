"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800">
                    Admin Panel
                </h2>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-gray-100"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        A
                    </div>

                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">
                            Administrator
                        </p>

                        <p className="text-xs text-gray-500">
                            Admin
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