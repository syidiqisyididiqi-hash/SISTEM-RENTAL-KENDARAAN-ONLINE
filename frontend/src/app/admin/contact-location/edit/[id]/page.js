"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import rentalLocationService from "@/services/rentalLocationService";
import {
    getErrorMessage,
    resolveImage,
    setFlash,
    unwrap,
} from "@/lib/rentalLocationHelpers";

export default function EditRentalLocationPage() {
    const router = useRouter();
    const { id } = useParams();

    const [form, setForm] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchLocation = async () => {
            try {
                setLoading(true);
                setLoadError("");

                const res = await rentalLocationService.getById(id);
                const location = unwrap(res);

                if (cancelled) return;

                setForm({
                    name: location.name ?? "",
                    address: location.address ?? "",
                    latitude: location.latitude ?? "",
                    longitude: location.longitude ?? "",
                    maps_url: location.maps_url ?? "",
                    phone: location.phone ?? "",
                    whatsapp: location.whatsapp ?? "",
                    email: location.email ?? "",
                    opening_hours: location.opening_hours ?? "",
                    image: location.image ?? "",
                    is_active: location.is_active ?? true,
                });
            } catch (err) {
                if (!cancelled) {
                    setLoadError(
                        getErrorMessage(
                            err,
                            "Gagal mengambil informasi toko."
                        )
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (id) fetchLocation();

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (!form?.image) {
            setPreview(null);
            return;
        }

        if (form.image instanceof File) {
            const imageUrl = URL.createObjectURL(form.image);
            setPreview(imageUrl);

            return () => URL.revokeObjectURL(imageUrl);
        }

        setPreview(resolveImage(form.image));
    }, [form?.image]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file") {
            const selectedFile = files?.[0];

            if (!selectedFile) return;

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError("Format gambar harus JPG, PNG, atau WEBP.");
                e.target.value = "";
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("Ukuran gambar maksimal 5 MB.");
                e.target.value = "";
                return;
            }

            setError("");

            setForm((prev) => ({
                ...prev,
                image: selectedFile,
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");

        try {
            const formData = new FormData();

            formData.append("name", form.name);
            formData.append("address", form.address);
            formData.append("latitude", form.latitude);
            formData.append("longitude", form.longitude);
            formData.append("maps_url", form.maps_url);
            formData.append("phone", form.phone);
            formData.append("whatsapp", form.whatsapp);
            formData.append("email", form.email);
            formData.append("opening_hours", form.opening_hours);
            formData.append("is_active", String(form.is_active));

            if (form.image instanceof File) {
                formData.append("image", form.image);
            }

            const response = await rentalLocationService.update(
                id,
                formData
            );

            console.log("Update lokasi berhasil:", response.data);

            setFlash("Informasi toko berhasil diperbarui.");

            router.push("/admin/contact-location");
        } catch (err) {
            console.error("Gagal memperbarui lokasi:", err);

            setError(
                getErrorMessage(
                    err,
                    "Gagal memperbarui informasi toko."
                )
            );

            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl p-8 text-center text-slate-500">
                Memuat informasi toko...
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="mx-auto max-w-4xl p-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {loadError}
                </div>
            </div>
        );
    }

    if (!form) return null;

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
                    Edit Informasi Toko
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Perbarui profil dan informasi resmi toko rental.
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
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Foto Bangunan Toko
                    </label>

                    {preview ? (
                        <img
                            src={preview}
                            alt="Foto bangunan toko"
                            className="mb-4 h-64 w-full rounded-lg border border-slate-200 object-cover"
                            onError={() =>
                                console.error("Gagal memuat foto:", preview)
                            }
                        />
                    ) : (
                        <div className="mb-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400">
                            Foto bangunan belum tersedia
                        </div>
                    )}

                    <input
                        type="file"
                        name="image"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        Pilih foto baru jika ingin mengganti foto sebelumnya.
                        Kosongkan jika ingin mempertahankan foto lama.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        checked={Boolean(form.is_active)}
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
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </div>
    );
}