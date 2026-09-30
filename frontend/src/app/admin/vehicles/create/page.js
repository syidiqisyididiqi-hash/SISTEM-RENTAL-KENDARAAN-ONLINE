"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import vehicleService from "@/services/vehicleService";
import categoryService from "@/services/categoryService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import LinkButton from "@/components/ui/LinkButton";
import Button from "@/components/ui/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    BadgeInfo,
    Banknote,
    Building2,
    CalendarDays,
    Car,
    CircleCheck,
    Hash,
    ImagePlus,
    Package,
    Tag,
} from "lucide-react";

export default function CreateVehiclePage() {
    const router = useRouter();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState("");

    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    const [formData, setFormData] = useState({
        category_id: "",
        name: "",
        brand: "",
        model: "",
        year: "",
        license_plate: "",
        price_per_day: "",
        stock: 1,
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

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

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

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setFormData((prev) => ({
            ...prev,
            image: file,
        }));

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setShowSaveDialog(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError("");

            const data = new FormData();
            data.append("category_id", formData.category_id);
            data.append("name", formData.name);
            data.append("brand", formData.brand);
            data.append("model", formData.model);
            data.append("year", formData.year);
            data.append("license_plate", formData.license_plate);
            data.append("price_per_day", formData.price_per_day);
            data.append("stock", formData.stock);
            data.append("status", formData.status);

            if (formData.image) {
                data.append("image", formData.image);
            }

            await vehicleService.create(data);

            setShowSaveDialog(false);

            setToast({
                open: true,
                type: "success",
                message: "Kendaraan berhasil ditambahkan.",
            });

            setTimeout(() => {
                router.push("/admin/vehicles");
            }, 1500);
        } catch (error) {
            console.error("Gagal menambahkan kendaraan:", error);

            setShowSaveDialog(false);

            const message =
                error.response?.data?.message ||
                "Gagal menambahkan kendaraan.";

            setError(message);

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
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                            <Car className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                                Tambah Kendaraan
                            </h1>
                            <p className="text-sm text-gray-500">
                                Tambahkan data kendaraan baru ke dalam sistem.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-all">
                {error && (
                    <div className="m-6 mb-0 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                        <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Kategori
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <Tag className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingCategories}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        {loadingCategories
                                            ? "Memuat kategori..."
                                            : "Pilih kategori"}
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Nama Kendaraan
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <Car className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Contoh: Avanza"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Brand
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <Building2 className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="Contoh: Toyota"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Model
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <BadgeInfo className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="Contoh: 1.5 G"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Tahun
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={
                                        formData.year
                                            ? new Date(Number(formData.year), 0, 1)
                                            : null
                                    }
                                    onChange={(date) =>
                                        setFormData({
                                            ...formData,
                                            year: date ? date.getFullYear() : "",
                                        })
                                    }
                                    showYearPicker
                                    dateFormat="yyyy"
                                    placeholderText="Pilih tahun"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    wrapperClassName="w-full"
                                    required
                                />
                                <CalendarDays
                                    size={18}
                                    strokeWidth={2}
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Plat Nomor
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <Hash className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="license_plate"
                                    value={formData.license_plate}
                                    onChange={handleChange}
                                    placeholder="Contoh: D 1234 ABC"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm uppercase text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Harga / Hari
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <Banknote className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="price_per_day"
                                    value={formData.price_per_day}
                                    onChange={handleChange}
                                    placeholder="Contoh: 350000"
                                    min="0"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Stok
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <Package className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="Contoh: 5"
                                    min="1"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Jumlah unit kendaraan yang tersedia.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Status
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <CircleCheck className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-gray-400" />
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-8 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="available">Tersedia</option>
                                    <option value="rented">Disewa</option>
                                    <option value="maintenance">Dalam Perawatan</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Foto Kendaraan
                            </label>

                            {imagePreview && (
                                <div className="mb-4">
                                    <p className="mb-2 text-xs font-medium text-gray-500">
                                        Preview Foto:
                                    </p>
                                    <Image
                                        src={imagePreview}
                                        alt="Preview kendaraan"
                                        width={192}
                                        height={128}
                                        unoptimized
                                        className="h-32 w-48 rounded-lg border border-gray-200 object-cover shadow-xs"
                                    />
                                </div>
                            )}

                            <div className="relative rounded-lg shadow-xs">
                                <ImagePlus className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Format JPG, JPEG, PNG.
                            </p>
                        </div>

                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                        <LinkButton
                            href="/admin/vehicles"
                            variant="cancel"
                        >
                            Batal
                        </LinkButton>

                        <Button
                            type="submit"
                            variant="success"
                            loading={loading}
                        >
                            Simpan Kendaraan
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmDialog
                open={showSaveDialog}
                type="success"
                title="Simpan Kendaraan?"
                description="Apakah kamu yakin ingin menyimpan data kendaraan ini?"
                confirmText="Ya, Simpan"
                cancelText="Batal"
                onConfirm={handleSave}
                onCancel={() => {
                    if (!loading) {
                        setShowSaveDialog(false);
                    }
                }}
                loading={loading}
            />

            <Toast
                open={toast.open}
                type={toast.type}
                message={toast.message}
                onClose={() =>
                    setToast({
                        open: false,
                        type: "success",
                        message: "",
                    })
                }
            />
        </div>
    );
}