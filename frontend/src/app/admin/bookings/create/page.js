"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import bookingService from "@/services/bookingService";
import userService from "@/services/userService";
import vehicleService from "@/services/vehicleService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import LinkButton from "@/components/ui/LinkButton";
import Button from "@/components/ui/Button";

export default function CreateBookingPage() {
    const router = useRouter();

    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const getToday = () => {
        const today = new Date();

        return `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}-${String(
            today.getDate()
        ).padStart(2, "0")}`;
    };

    const [formData, setFormData] = useState({
        user_id: "",
        vehicle_id: "",
        start_date: getToday(),
        end_date: "",
        status: "pending",
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersResponse, vehiclesResponse] =
                    await Promise.all([
                        userService.getCustomers(),
                        vehicleService.getAll(),
                    ]);

                setUsers(usersResponse.data?.data || []);
                setVehicles(vehiclesResponse.data?.data || []);
            } catch (error) {
                console.error(
                    "Error mengambil data user atau kendaraan:",
                    error
                );

                setError(
                    "Gagal mengambil data user atau kendaraan."
                );
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const selectedVehicle = vehicles.find(
        (vehicle) =>
            String(vehicle.id) === String(formData.vehicle_id)
    );

    const calculateDays = () => {
        if (!formData.start_date || !formData.end_date) {
            return 0;
        }

        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);

        const difference =
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24);

        return difference >= 0
            ? Math.ceil(difference) + 1
            : 0;
    };

    const totalDays = calculateDays();

    const pricePerDay = Number(
        selectedVehicle?.price_per_day ||
            selectedVehicle?.rental_price ||
            selectedVehicle?.price ||
            0
    );

    const totalPrice = totalDays * pricePerDay;

    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");

        if (!formData.user_id) {
            setError("User wajib dipilih.");
            return;
        }

        if (!formData.vehicle_id) {
            setError("Kendaraan wajib dipilih.");
            return;
        }

        if (!formData.start_date) {
            setError("Tanggal mulai wajib diisi.");
            return;
        }

        if (!formData.end_date) {
            setError("Tanggal selesai wajib diisi.");
            return;
        }

        if (
            new Date(formData.end_date) <
            new Date(formData.start_date)
        ) {
            setError(
                "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."
            );
            return;
        }

        setShowSaveDialog(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError("");

            await bookingService.create({
                user_id: Number(formData.user_id),
                vehicle_id: Number(formData.vehicle_id),
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_days: totalDays,
                price_per_day: pricePerDay,
                total_price: totalPrice,
                status: formData.status,
            });

            setShowSaveDialog(false);

            setToast({
                open: true,
                type: "success",
                message: "Booking berhasil ditambahkan.",
            });

            setTimeout(() => {
                router.push("/admin/bookings");
            }, 1500);
        } catch (error) {
            console.error(
                "Error menambahkan booking:",
                error
            );

            setShowSaveDialog(false);

            const message =
                error.response?.data?.message ||
                "Gagal menambahkan booking.";

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

    if (loadingData) {
        return (
            <div>
                <p className="text-sm text-gray-500">
                    Memuat data...
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Tambah Booking
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Tambahkan data penyewaan kendaraan baru.
                </p>
            </div>

            <div className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                User
                            </label>

                            <select
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    Pilih User
                                </option>

                                {users.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Kendaraan
                            </label>

                            <select
                                name="vehicle_id"
                                value={formData.vehicle_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    Pilih Kendaraan
                                </option>

                                {vehicles.map((vehicle) => (
                                    <option
                                        key={vehicle.id}
                                        value={vehicle.id}
                                    >
                                        {vehicle.name ||
                                            vehicle.vehicle_name ||
                                            `${vehicle.brand || ""} ${
                                                vehicle.model || ""
                                            }`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tanggal Mulai
                                </label>

                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tanggal Selesai
                                </label>

                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="pending">
                                    Menunggu
                                </option>

                                <option value="confirmed">
                                    Dikonfirmasi
                                </option>

                                <option value="ongoing">
                                    Sedang Berlansung
                                </option>

                                <option value="completed">
                                    Selesai
                                </option>

                                <option value="cancelled">
                                    Dibatalkan
                                </option>

                                <option value="rejected">
                                    Ditolak
                                </option>
                            </select>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Total Hari
                                </span>

                                <span className="font-medium text-gray-800">
                                    {totalDays} hari
                                </span>
                            </div>

                            <div className="mt-2 flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Harga / Hari
                                </span>

                                <span className="font-medium text-gray-800">
                                    Rp{" "}
                                    {pricePerDay.toLocaleString(
                                        "id-ID"
                                    )}
                                </span>
                            </div>

                            <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                                <span className="font-semibold text-gray-700">
                                    Total Harga
                                </span>

                                <span className="font-bold text-blue-600">
                                    Rp{" "}
                                    {totalPrice.toLocaleString(
                                        "id-ID"
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <LinkButton
                            href="/admin/bookings"
                            variant="cancel"
                        >
                            Batal
                        </LinkButton>

                        <Button
                            type="submit"
                            variant="success"
                            loading={loading}
                        >
                            Simpan Booking
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmDialog
                open={showSaveDialog}
                type="success"
                title="Simpan Booking?"
                description="Apakah kamu yakin ingin menyimpan data booking ini?"
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