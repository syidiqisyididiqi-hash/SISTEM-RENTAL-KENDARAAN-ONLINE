"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import vehicleService from "@/services/vehicleService";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import DataTable from "@/components/ui/DataTable";

const getImageUrl = (image) => {
    if (!image) {
        return "";
    }

    if (typeof image === "string") {
        const imagePath = image.trim();

        if (!imagePath || imagePath === "[object Object]") {
            return "";
        }

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }

        const normalizedPath = imagePath.replace(/^[/\\]+/, "");

        const uploadPath = normalizedPath.startsWith("uploads/")
            ? normalizedPath
            : `uploads/vehicles/${normalizedPath}`;

        return `http://localhost:5000/${uploadPath}`;
    }

    if (typeof image === "object") {
        const possibleKeys = [
            "url",
            "image_url",
            "imageUrl",
            "path",
            "filepath",
            "filePath",
            "filename",
            "fileName",
            "src",
            "image",
        ];

        for (const key of possibleKeys) {
            const value = image[key];

            if (
                typeof value === "string" &&
                value.trim() !== ""
            ) {
                const imagePath = value.trim();

                if (
                    imagePath.startsWith("http://") ||
                    imagePath.startsWith("https://")
                ) {
                    return imagePath;
                }

                const normalizedPath =
                    imagePath.replace(/^[/\\]+/, "");

                const uploadPath =
                    normalizedPath.startsWith("uploads/")
                        ? normalizedPath
                        : `uploads/vehicles/${normalizedPath}`;

                return `http://localhost:5000/${uploadPath}`;
            }
        }

        return "";
    }

    return "";
};

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [failedImages, setFailedImages] = useState(new Set());
    const [error, setError] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const response = await vehicleService.getAll();

                setVehicles(response.data?.data || []);
                setError("");
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data kendaraan."
                );
            } finally {
                setLoading(false);
            }
        };

        loadVehicles();
    }, []);

    const handleDelete = async () => {
        if (!selectedVehicle) {
            return;
        }

        try {
            setDeletingId(selectedVehicle.id);
            setError("");

            await vehicleService.remove(selectedVehicle.id);

            setVehicles((currentVehicles) =>
                currentVehicles.filter(
                    (item) => item.id !== selectedVehicle.id
                )
            );

            setShowDeleteDialog(false);
            setSelectedVehicle(null);

            setToast({
                open: true,
                type: "success",
                message: "Kendaraan berhasil dihapus.",
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Gagal menghapus kendaraan.";

            setShowDeleteDialog(false);
            setSelectedVehicle(null);

            setToast({
                open: true,
                type: "error",
                message,
            });
        } finally {
            setDeletingId(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price || 0);
    };

    const columns = [
        {
            key: "no",
            label: "No",
            render: (_, index) => index + 1,
        },
        {
            key: "image",
            label: "Foto",
            render: (vehicle) => {
                const imageUrl = getImageUrl(vehicle.image);

                return imageUrl &&
                    !failedImages.has(vehicle.id) ? (
                    <Image
                        src={imageUrl}
                        alt={vehicle.name || "Foto kendaraan"}
                        width={80}
                        height={56}
                        unoptimized
                        className="h-14 w-20 rounded-lg border border-gray-200 object-cover"
                        onError={() => {
                            setFailedImages((current) => {
                                const updated = new Set(current);
                                updated.add(vehicle.id);
                                return updated;
                            });
                        }}
                    />
                ) : (
                    <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        No Image
                    </div>
                );
            },
        },
        {
            key: "name",
            label: "Kendaraan",
            render: (vehicle) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {vehicle.name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {vehicle.brand} {vehicle.model || ""}
                        {vehicle.year
                            ? ` • ${vehicle.year}`
                            : ""}
                    </p>
                </div>
            ),
        },
        {
            key: "category_name",
            label: "Kategori",
            render: (vehicle) => (
                <span className="text-gray-600">
                    {vehicle.category_name || "-"}
                </span>
            ),
        },
        {
            key: "license_plate",
            label: "Plat Nomor",
            render: (vehicle) => (
                <span className="font-medium text-gray-700">
                    {vehicle.license_plate || "-"}
                </span>
            ),
        },
        {
            key: "price_per_day",
            label: "Harga / Hari",
            render: (vehicle) => (
                <span className="text-gray-600">
                    {formatPrice(vehicle.price_per_day)}
                </span>
            ),
        },
        {
            key: "stock",
            label: "Stok",
            render: (vehicle) => (
                <span className="font-medium text-gray-700">
                    {vehicle.stock ?? 0} unit
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (vehicle) =>
                vehicle.status === "available" ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                        Tersedia
                    </span>
                ) : vehicle.status === "rented" ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        Disewa
                    </span>
                ) : (
                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-600">
                        Dalam Perawatan
                    </span>
                ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (vehicle) => (
                <div className="flex gap-2">
                    <LinkButton
                        href={`/admin/vehicles/edit/${vehicle.id}`}
                    >
                        Edit
                    </LinkButton>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowDeleteDialog(true);
                        }}
                        disabled={deletingId === vehicle.id}
                    >
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Vehicles
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola data kendaraan.
                    </p>
                </div>

                <LinkButton
                    href="/admin/vehicles/create"
                    variant="add"
                >
                    + Tambah Kendaraan
                </LinkButton>
            </div>

            <div className="mt-6">
                {error ? (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={vehicles}
                        loading={loading}
                    />
                )}
            </div>

            <ConfirmDialog
                open={showDeleteDialog}
                type="danger"
                title="Hapus Kendaraan?"
                description={
                    selectedVehicle
                        ? `Apakah kamu yakin ingin menghapus kendaraan "${selectedVehicle.name}"? Data yang sudah dihapus tidak dapat dikembalikan.`
                        : "Apakah kamu yakin ingin menghapus kendaraan ini?"
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deletingId) {
                        setShowDeleteDialog(false);
                        setSelectedVehicle(null);
                    }
                }}
                loading={!!deletingId}
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