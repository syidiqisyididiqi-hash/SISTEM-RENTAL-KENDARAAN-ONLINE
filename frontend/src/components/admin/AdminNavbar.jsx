"use client";

import { useState } from "react";

export default function AdminNavbar() {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800">
                    Admin Panel
                </h2>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
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

                    <span className="text-gray-400">
                        ▼
                    </span>
                </button>

                {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white py-2 shadow-lg">
                        <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Profile
                        </button>

                        <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}