"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useState, useCallback } from "react";

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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    const closeToast = useCallback(() => {
        setToast((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    const router = useRouter();

    const handleChange = (e) => {
       const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: false,
        }));

        setError("");
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const newErrors = {
            name: !formData.name.trim(),
            email: !formData.email.trim(),
            password: !formData.password,
            confirmPassword: !formData.confirmPassword,
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) {
            setError("Field wajib harus diisi.");
            return;
        }

        if (formData.password.length < 6) {
            setErrors((prev) => ({
                ...prev,
                password: true,
            }));

            setError("Password minimal 6 karakter.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: true,
            }));

            setError("Konfirmasi password tidak sama.");
            return;
        }

        try {
            setLoading(true);

            const response = await authService.register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                password: formData.password,
            });

            if (response.data.success) {
                setToast({
                    open: true,
                    type: "success",
                    message: response.data.message || "Registrasi berhasil.",
                });

                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            } else {
                setToast({
                    open: true,
                    type: "error",
                    message: response.data.message || "Registrasi gagal.",
                });
            }

        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Registrasi gagal. Periksa koneksi ke backend.";

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
         <Toast
            open={toast.open}
            type={toast.type}
            message={toast.message}
            onClose={closeToast}
        />
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            
            <div className="mb-8 text-center">

                <h1 className="text-2xl font-bold text-slate-900">
                    Buat Akun
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Daftar untuk menggunakan layanan rental
                </p>
            </div>

            
            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
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
                       className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                            errors.confirmPassword
                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}
                    />
                </div>

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
                        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                            errors.email
                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}                    
                    />
                </div>

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
                        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                            errors.password
                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}
                />
                </div>

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
                        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
                            errors.confirmPassword
                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}
                    />
                </div>

                <Button
                    type="submit"
                    loading={loading}
                    variant="primary"
                    size="lg"
                    className="w-full"
                >
                    Register
                </Button>
                
            </form>

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
        </>
    );
}