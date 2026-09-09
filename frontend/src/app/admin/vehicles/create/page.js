"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import vehicleService from "@/services/vehicleService";
import categoryService from "@/services/categoryService";

export default function CreateVehiclePage() {
    const router = useRouter();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await categoryService.getAll();

                setCategories(response.data?.data || []);
            } catch (error) {
                console.error("Gagal mengambil kategori:", error);
                setError("Gagal mengambil data kategori.");
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;

        if (!file) {
            setFormData((prev) => ({
                ...prev,
                image: null,
            }));

            setImagePreview("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            image: file,
        }));

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const data = new FormData();

            data.append("category_id", formData.category_id);
            data.append("name", formData.name);
            data.append("brand", formData.brand);
            data.append("model", formData.model);
            data.append("year", formData.year);
            data.append("license_plate", formData.license_plate);
            data.append("price_per_day", formData.price_per_day);
            data.append("status", formData.status);

            if (formData.image) {
                data.append("image", formData.image);
            }

            await vehicleService.create(data);

            router.push("/admin/vehicles");
        } catch (error) {
            console.error("Gagal membuat kendaraan:", error);

            setError(
                error.response?.data?.message ||
                    "Gagal menambahkan kendaraan."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Tambah Kendaraan
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Tambahkan data kendaraan baru.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-gray-200 bg-white p-6"
            >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* KATEGORI */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Kategori
                        </label>

                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                            disabled={loadingCategories}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="">
                                {loadingCategories
                                    ? "Memuat kategori..."
                                    : "Pilih kategori"}
                            </option>

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

                    {/* NAMA */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nama Kendaraan
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Contoh: Avanza"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    {/* BRAND */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Brand
                        </label>

                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="Contoh: Toyota"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    {/* MODEL */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Model
                        </label>

                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="Contoh: 1.5 G"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    {/* TAHUN */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Tahun
                        </label>

                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="Contoh: 2024"
                            min="1900"
                            max="2100"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    {/* PLAT NOMOR */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Plat Nomor
                        </label>

                        <input
                            type="text"
                            name="license_plate"
                            value={formData.license_plate}
                            onChange={handleChange}
                            placeholder="Contoh: D 1234 ABC"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-black"
                        />
                    </div>

                    {/* HARGA */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Harga / Hari
                        </label>

                        <input
                            type="number"
                            name="price_per_day"
                            value={formData.price_per_day}
                            onChange={handleChange}
                            placeholder="Contoh: 350000"
                            min="0"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="available">
                                Available
                            </option>

                            <option value="rented">
                                Rented
                            </option>

                            <option value="maintenance">
                                Maintenance
                            </option>
                        </select>
                    </div>

                {/* FOTO */}
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Foto Kendaraan
                    </label>

                    {imagePreview && (
                        <div className="mb-4">
                            <p className="mb-2 text-xs text-gray-500">
                                Preview Foto:
                            </p>

                            <Image
                                src={imagePreview}
                                alt="Preview kendaraan"
                                width={192}
                                height={128}
                                unoptimized
                                className="h-32 w-48 rounded-lg border border-gray-200 object-cover"
                            />
                        </div>
                    )}

                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                        Format JPG, JPEG, PNG.
                    </p>
                </div>
                {/* BUTTON */}
                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/vehicles")}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Menyimpan..."
                            : "Simpan Kendaraan"}
                    </button>
                </div>
                </div>
            </form>
        </div>
    );
}