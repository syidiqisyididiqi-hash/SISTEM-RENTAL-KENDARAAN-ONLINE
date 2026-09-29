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

        if (!selectedVehicle) {
            setError("Kendaraan tidak ditemukan.");
            return;
        }

        if (Number(selectedVehicle.stock) <= 0) {
            setError("Stok kendaraan habis.");
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
            <div className="max-w-4xl mx-auto pb-10">
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xs">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-sm font-medium text-gray-500">
                        Memuat data user dan kendaraan...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                                Tambah Booking
                            </h1>
                            <p className="text-sm text-gray-500">
                                Tambahkan data penyewaan kendaraan baru.
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
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                User / Pelanggan
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <select
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-8 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="">Pilih User</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Kendaraan
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM3 9l2-4h10l2 4M3 9h18v6H3V9z" />
                                    </svg>
                                </div>
                                <select
                                    name="vehicle_id"
                                    value={formData.vehicle_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-8 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="">Pilih Kendaraan</option>
                                    {vehicles.map((vehicle) => (
                                        <option
                                            key={vehicle.id}
                                            value={vehicle.id}
                                            disabled={Number(vehicle.stock) <= 0}
                                        >
                                            {vehicle.name ||
                                                vehicle.vehicle_name ||
                                                `${vehicle.brand || ""} ${
                                                    vehicle.model || ""
                                                }`}{" "}
                                            - Stok: {vehicle.stock ?? 0}
                                            {Number(vehicle.stock) <= 0
                                                ? " (Habis)"
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                    Tanggal Mulai
                                </label>
                                <div className="relative rounded-lg shadow-xs">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                    Tanggal Selesai
                                </label>
                                <div className="relative rounded-lg shadow-xs">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold tracking-wider text-gray-600 uppercase">
                                Status
                            </label>
                            <div className="relative rounded-lg shadow-xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-8 pl-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="pending">Menunggu</option>
                                    <option value="confirmed">Dikonfirmasi</option>
                                    <option value="ongoing">Sedang Berlansung</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200/80 bg-slate-50 p-5 shadow-xs">
                            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-200/60">
                                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Rincian Biaya
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Hari</span>
                                    <span className="font-medium text-gray-800">{totalDays} hari</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Harga / Hari</span>
                                    <span className="font-medium text-gray-800">
                                        Rp {pricePerDay.toLocaleString("id-ID")}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-200/80 pt-3 mt-3">
                                    <span className="font-semibold text-gray-700">Total Harga</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        Rp {totalPrice.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
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