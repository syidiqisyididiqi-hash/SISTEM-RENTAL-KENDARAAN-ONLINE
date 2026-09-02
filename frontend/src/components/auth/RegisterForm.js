"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
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

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Field wajib harus diisi.");
            return;
        }

        if (formData.password.length < 6) {
            setError(
                "Password minimal 6 karakter."
            );
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "Konfirmasi password tidak sama."
            );
            return;
        }

        console.log(
            "Register data:",
            formData
        );

        // Sementara frontend saja
        alert(
            "Registrasi berhasil (dummy frontend)."
        );
    };

    return (
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
                    RK
                </div>

                <h1 className="text-2xl font-bold text-slate-900">
                    Buat Akun
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Daftar untuk menggunakan layanan rental
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
                className="space-y-4"
            >
                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nama Lengkap
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

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

                {/* Phone */}
                <div>
                    <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nomor Telepon
                    </label>

                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Masukkan nomor telepon"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Address */}
                <div>
                    <label
                        htmlFor="address"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Alamat
                    </label>

                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Masukkan alamat"
                        rows={3}
                        className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        placeholder="Minimal 6 karakter"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Confirm Password */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Konfirmasi Password
                    </label>

                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Ulangi password"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    Register
                </button>
            </form>

            {/* Login */}
            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                    Sudah punya akun?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}