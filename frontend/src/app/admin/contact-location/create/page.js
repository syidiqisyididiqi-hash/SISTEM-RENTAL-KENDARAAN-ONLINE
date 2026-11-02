"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import rentalLocationService from "@/services/rentalLocationService";
import { getErrorMessage, setFlash } from "@/lib/rentalLocationHelpers";

const INITIAL_FORM = {
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    maps_url: "",
    phone: "",
    whatsapp: "",
    email: "",
    opening_hours: "",
    image: null,
    is_active: true,
};

export default function CreateRentalLocationPage() {
    const router = useRouter();

    const [form, setForm] = useState(INITIAL_FORM);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!form.image) {
            setPreview(null);
            return;
        }

        const imageUrl = URL.createObjectURL(form.image);
        setPreview(imageUrl);

        return () => URL.revokeObjectURL(imageUrl);
    }, [form.image]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "file"
                    ? files?.[0] || null
                    : type === "checkbox"
                        ? checked
                        : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            await rentalLocationService.create(formData);

            setFlash("Informasi toko berhasil ditambahkan.");
            router.push("/admin/contact-location");
        } catch (err) {
            setError(
                getErrorMessage(err, "Gagal menambahkan informasi toko.")
            );
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-4 sm:p-8">
            <Link
                href="/admin/contact-location"
                className="text-sm text-teal-700 hover:underline"
            >
                ← Kembali ke informasi toko
            </Link>

            <header className="mb-6 mt-4">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Tambah Informasi Toko
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Masukkan profil dan informasi resmi toko rental.
                </p>
            </header>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
            >
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Nama Toko
                    </label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                        placeholder="Masukkan nama toko"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Alamat Lengkap
                    </label>
                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                        placeholder="Masukkan alamat toko"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Latitude
                        </label>
                        <input
                            name="latitude"
                            value={form.latitude}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                            placeholder="-6.200000"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Longitude
                        </label>
                        <input
                            name="longitude"
                            value={form.longitude}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                            placeholder="106.816666"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Link Google Maps
                    </label>
                    <input
                        name="maps_url"
                        type="url"
                        value={form.maps_url}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                        placeholder="https://maps.google.com/..."
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Nomor Telepon
                        </label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Nomor WhatsApp
                        </label>
                        <input
                            name="whatsapp"
                            value={form.whatsapp}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                        placeholder="email@contoh.com"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Jam Operasional
                    </label>
                    <textarea
                        name="opening_hours"
                        value={form.opening_hours}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                        placeholder="Senin - Minggu, 08.00 - 17.00"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Foto Bangunan Toko
                    </label>

                    <input
                        type="file"
                        name="image"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                    />

                    {preview && (
                        <img
                            src={preview}
                            alt="Preview foto toko"
                            className="mt-4 h-64 w-full rounded-lg object-cover"
                        />
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        checked={form.is_active}
                        onChange={handleChange}
                        className="h-4 w-4"
                    />
                    <label htmlFor="is_active" className="text-sm">
                        Informasi toko aktif
                    </label>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                    <Link
                        href="/admin/contact-location"
                        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm"
                    >
                        Batal
                    </Link>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                        {saving ? "Menyimpan..." : "Simpan Informasi"}
                    </button>
                </div>
            </form>
        </div>
    );
}