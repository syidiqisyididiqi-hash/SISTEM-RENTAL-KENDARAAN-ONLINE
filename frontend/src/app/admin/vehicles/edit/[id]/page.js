"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import vehicleService from "@/services/vehicleService";
import categoryService from "@/services/categoryService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    AlertCircle,
    BadgeCheck,
    Banknote,
    Boxes,
    CalendarDays,
    CarFront,
    Factory,
    Hash,
    ImageUp,
    Pencil,
    Settings2,
    Tags,
} from "lucide-react";

const getImageUrl = (image) => {
    if (!image) return "";

    if (
        typeof image === "string" &&
        (image.startsWith("http://") ||
            image.startsWith("https://"))
    ) {
        return image;
    }

    if (typeof image === "object") {
        image = image.url || image.path || image.filename || "";
    }

    if (!image) return "";

    const imagePath = String(image).trim();

    if (!imagePath || imagePath === "[object Object]") {
        return "";
    }

    const normalizedPath = imagePath.replace(/^[/\\]+/, "");

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

    const [showUpdateDialog, setShowUpdateDialog] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    const [form, setForm] = useState({
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
                    year: vehicle.year ? String(vehicle.year) : "",
                    license_plate: vehicle.license_plate || "",
                    price_per_day: vehicle.price_per_day || "",
                    stock: vehicle.stock ?? 1,
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

    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");
        setShowUpdateDialog(true);
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            setError("");

            const formData = new FormData();

            formData.append("category_id", form.category_id);
            formData.append("name", form.name);
            formData.append("brand", form.brand);
            formData.append("model", form.model);
            formData.append("year", form.year);
            formData.append("license_plate", form.license_plate);
            formData.append("price_per_day", form.price_per_day);
            formData.append("stock", form.stock);
            formData.append("status", form.status);

            if (form.image) {
                formData.append("image", form.image);
            }

            await vehicleService.update(id, formData);

            setShowUpdateDialog(false);

            setToast({
                open: true,
                type: "success",
                message: "Kendaraan berhasil diperbarui.",
            });

            setTimeout(() => {
                router.push("/admin/vehicles");
            }, 1500);
        } catch (err) {
            console.error("Error memperbarui kendaraan:", err);

            setShowUpdateDialog(false);

            const message =
                err.response?.data?.message ||
                "Gagal memperbarui data kendaraan.";

            setError(message);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl pb-10">
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xs">
                    <div className="mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="text-sm font-medium text-gray-600">
                        Memuat data kendaraan...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl pb-10">
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                        <Pencil size={19} strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Edit Kendaraan
                        </h1>
                        <p className="text-sm text-gray-500">
                            Perbarui informasi dan ketersediaan kendaraan.
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                {error && (
                    <div className="mx-6 mt-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 md:mx-8">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Nama Kendaraan
                            </label>
                            <div className="relative">
                                <CarFront className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Avanza"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Kategori
                            </label>
                            <div className="relative">
                                <Tags className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="">Pilih kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Brand
                            </label>
                            <div className="relative">
                                <Factory className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="brand"
                                    value={form.brand}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: Toyota"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Model
                            </label>
                            <div className="relative">
                                <Settings2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="model"
                                    value={form.model}
                                    onChange={handleChange}
                                    placeholder="Contoh: 1.5 G"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Tahun
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={
                                        form.year
                                            ? new Date(Number(form.year), 0, 1)
                                            : null
                                    }
                                    onChange={(date) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            year: date ? date.getFullYear() : "",
                                        }))
                                    }
                                    showYearPicker
                                    dateFormat="yyyy"
                                    placeholderText="Pilih tahun"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    wrapperClassName="w-full"
                                    required
                                />
                                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Plat Nomor
                            </label>
                            <div className="relative">
                                <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="license_plate"
                                    value={form.license_plate}
                                    onChange={handleChange}
                                    required
                                    placeholder="Contoh: D 1234 ABC"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm uppercase text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Harga Per Hari
                            </label>
                            <div className="relative">
                                <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    name="price_per_day"
                                    value={form.price_per_day}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="Contoh: 350000"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Stok
                            </label>
                            <div className="relative">
                                <Boxes className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    name="stock"
                                    value={form.stock}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    placeholder="Contoh: 5"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500">
                                Jumlah unit kendaraan yang tersedia.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Status
                            </label>
                            <div className="relative">
                                <BadgeCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="available">Tersedia</option>
                                    <option value="rented">Disewa</option>
                                    <option value="maintenance">Dalam Perawatan</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Foto Kendaraan
                            </label>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-start">
                                <div className="relative">
                                    <ImageUp className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Pilih foto kendaraan baru untuk mengganti foto saat ini.
                                    </p>
                                </div>
                                {preview ? (
                                    <Image
                                        src={preview}
                                        alt="Preview kendaraan"
                                        width={240}
                                        height={160}
                                        unoptimized
                                        className="h-40 w-full rounded-lg border border-gray-200 object-cover"
                                        onError={() => setPreview("")}
                                    />
                                ) : (
                                    <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                                        <CarFront className="h-7 w-7" />
                                        <span className="text-xs">Belum ada foto</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <LinkButton href="/admin/vehicles" variant="cancel">
                            Batal
                        </LinkButton>
                        <Button type="submit" variant="primary" loading={saving}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmDialog
                open={showUpdateDialog}
                type="warning"
                title="Perbarui Kendaraan?"
                description="Apakah kamu yakin ingin menyimpan perubahan data kendaraan ini?"
                confirmText="Ya, Perbarui"
                cancelText="Batal"
                onConfirm={handleUpdate}
                onCancel={() => {
                    if (!saving) {
                        setShowUpdateDialog(false);
                    }
                }}
                loading={saving}
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
