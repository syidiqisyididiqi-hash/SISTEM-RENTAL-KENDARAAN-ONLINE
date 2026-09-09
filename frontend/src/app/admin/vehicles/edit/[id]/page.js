"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import vehicleService from "@/services/vehicleService";
import categoryService from "@/services/categoryService";

const getImageUrl = (image) => {
    if (!image) return "";

    if (
        typeof image === "string" &&
        (image.startsWith("http://") || image.startsWith("https://"))
    ) {
        return image;
    }

    if (typeof image === "object") {
        image = image.url || image.path || image.filename || "";
    }

    if (!image) return "";

        const imagePath = String(image).trim();

        if (!imagePath || imagePath === "[object Object]") return "";

        const normalizedPath = imagePath.replace(/^\/+/, "");
        const uploadPath = normalizedPath.startsWith("uploads/")
            ? normalizedPath
            : `uploads/vehicles/${normalizedPath}`;

        return `http://localhost:5000/${uploadPath}`;
};

export default function EditVehiclePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        category_id: "",
        name: "",
        brand: "",
        model: "",
        year: "",
        license_plate: "",
        price_per_day: "",
        status: "available",
        image: null,
    });

    const [preview, setPreview] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [vehicleResponse, categoryResponse] = await Promise.all([
                    vehicleService.getById(id),
                    categoryService.getAll(),
                ]);

                const vehicle = vehicleResponse.data?.data;
                const categoryData = categoryResponse.data?.data || [];

                setCategories(categoryData);

                if (!vehicle) {
                    setError("Data kendaraan tidak ditemukan.");
                    return;
                }

                setForm({
                    category_id: vehicle.category_id || "",
                    name: vehicle.name || "",
                    brand: vehicle.brand || "",
                    model: vehicle.model || "",
                    year: vehicle.year || "",
                    license_plate: vehicle.license_plate || "",
                    price_per_day: vehicle.price_per_day || "",
                    status: vehicle.status || "available",
                    image: null,
                });

                if (vehicle.image) {
                    setPreview(getImageUrl(vehicle.image));
                }
            } catch (err) {
                console.error("Error mengambil data kendaraan:", err);
                setError("Gagal mengambil data kendaraan.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setForm((prev) => ({
            ...prev,
            image: file,
        }));

        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append("category_id", form.category_id);
            formData.append("name", form.name);
            formData.append("brand", form.brand);
            formData.append("model", form.model);
            formData.append("year", form.year);
            formData.append("license_plate", form.license_plate);
            formData.append("price_per_day", form.price_per_day);
            formData.append("status", form.status);

            if (form.image) {
                formData.append("image", form.image);
            }

            await vehicleService.update(id, formData);

            setSuccess("Data kendaraan berhasil diperbarui.");

            setTimeout(() => {
                router.push("/admin/vehicles");
            }, 1000);
        } catch (err) {
            console.error("Error memperbarui kendaraan:", err);

            setError(
                err.response?.data?.message ||
                    "Gagal memperbarui data kendaraan."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Memuat data kendaraan...
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Kendaraan
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Perbarui informasi kendaraan.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-gray-200 bg-white p-6"
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nama Kendaraan
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: Avanza"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Kategori
                        </label>
                        <select
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="">Pilih kategori</option>
                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Brand
                        </label>
                        <input
                            type="text"
                            name="brand"
                            value={form.brand}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: Toyota"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Model
                        </label>
                        <input
                            type="text"
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            placeholder="Contoh: 1.5 G"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Tahun
                        </label>
                        <input
                            type="number"
                            name="year"
                            value={form.year}
                            onChange={handleChange}
                            min="1900"
                            max="2100"
                            placeholder="Contoh: 2024"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Plat Nomor
                        </label>
                        <input
                            type="text"
                            name="license_plate"
                            value={form.license_plate}
                            onChange={handleChange}
                            required
                            placeholder="Contoh: D 1234 ABC"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Harga Per Hari
                        </label>
                        <input
                            type="number"
                            name="price_per_day"
                            value={form.price_per_day}
                            onChange={handleChange}
                            required
                            min="0"
                            placeholder="Contoh: 350000"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="available">Available</option>
                            <option value="rented">Rented</option>
                            <option value="maintenance">
                                Maintenance
                            </option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Foto Kendaraan
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                        />

                        {preview && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs text-gray-500">
                                    Preview foto
                                </p>

                                <img
                                    src={preview}
                                    alt="Preview kendaraan"
                                    className="h-40 w-60 rounded-lg border border-gray-200 object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/vehicles")}
                        disabled={saving}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </div>
    );
}
