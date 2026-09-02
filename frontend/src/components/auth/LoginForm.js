"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Email dan password wajib diisi.");
            return;
        }

        console.log("Login data:", formData);

        // Sementara frontend saja
        alert("Login berhasil (dummy frontend).");
    };

    return (
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
                    RK
                </div>

                <h1 className="text-2xl font-bold text-slate-900">
                    Selamat Datang
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Login ke akun Rental Kendaraan
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Masukkan email"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Password */}
                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Masukkan password"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Remember */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300"
                        />

                        Ingat saya
                    </label>

                    <button
                        type="button"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        Lupa password?
                    </button>
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    Login
                </button>
            </form>

            {/* Register */}
            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    Belum punya akun?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Daftar sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}