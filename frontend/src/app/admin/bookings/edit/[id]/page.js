"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import bookingService from "@/services/bookingService";
import userService from "@/services/userService";
import vehicleService from "@/services/vehicleService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import {
    AlertCircle,
    BadgeCheck,
    CalendarDays,
    CarFront,
    CircleDollarSign,
    Pencil,
    UserRound,
} from "lucide-react";

export default function EditBookingPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id;

    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [form, setForm] = useState({
        user_id: "",
        vehicle_id: "",
        start_date: "",
        end_date: "",
        status: "pending",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showUpdateDialog, setShowUpdateDialog] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        type: "success",
        message: "",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const [
                    bookingResponse,
                    usersResponse,
                    vehiclesResponse,
                ] = await Promise.all([
                    bookingService.getById(id),
                    userService.getAll(),
                    vehicleService.getAll(),
                ]);

                const booking =
                    bookingResponse.data?.data;

                setUsers(usersResponse.data?.data || []);

                setVehicles(
                    vehiclesResponse.data?.data || []
                );

                if (!booking) {
                    setError("Data booking tidak ditemukan.");
                    return;
                }

                setForm({
                    user_id: booking.user_id || "",
                    vehicle_id: booking.vehicle_id || "",
                    start_date: booking.start_date
                        ? booking.start_date.substring(0, 10)
                        : "",
                    end_date: booking.end_date
                        ? booking.end_date.substring(0, 10)
                        : "",
                    status: booking.status || "pending",
                });

                setError("");
            } catch (error) {
                console.error(
                    "Error mengambil data booking:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data booking."
                );
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

    const selectedVehicle = vehicles.find(
        (vehicle) =>
            String(vehicle.id) ===
            String(form.vehicle_id)
    );

    const calculateDays = () => {
        if (!form.start_date || !form.end_date) {
            return 0;
        }

        const start = new Date(form.start_date);
        const end = new Date(form.end_date);

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

        if (!form.user_id) {
            setError("User wajib dipilih.");
            return;
        }

        if (!form.vehicle_id) {
            setError("Kendaraan wajib dipilih.");
            return;
        }

        if (!form.start_date) {
            setError("Tanggal mulai wajib diisi.");
            return;
        }

        if (!form.end_date) {
            setError("Tanggal selesai wajib diisi.");
            return;
        }

        if (
            new Date(form.end_date) <
            new Date(form.start_date)
        ) {
            setError(
                "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."
            );
            return;
        }

        setShowUpdateDialog(true);
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            setError("");

            await bookingService.update(id, {
                user_id: Number(form.user_id),
                vehicle_id: Number(form.vehicle_id),
                start_date: form.start_date,
                end_date: form.end_date,
                total_days: totalDays,
                price_per_day: pricePerDay,
                total_price: totalPrice,
                status: form.status,
            });

            setShowUpdateDialog(false);

            setToast({
                open: true,
                type: "success",
                message: "Booking berhasil diperbarui.",
            });

            setTimeout(() => {
                router.push("/admin/bookings");
            }, 1500);
        } catch (error) {
            console.error(
                "Error mengubah booking:",
                error
            );

            setShowUpdateDialog(false);

            const message =
                error.response?.data?.message ||
                "Gagal memperbarui booking.";

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
                        Memuat data booking...
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
                            Edit Booking
                        </h1>
                        <p className="text-sm text-gray-500">
                            Ubah data penyewaan kendaraan.
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
                                User
                            </label>
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="user_id"
                                    value={form.user_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
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
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Kendaraan
                            </label>
                            <div className="relative">
                                <CarFront className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="vehicle_id"
                                    value={form.vehicle_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="">Pilih Kendaraan</option>
                                    {vehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.name ||
                                                vehicle.vehicle_name ||
                                                `${vehicle.brand || ""} ${vehicle.model || ""}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Tanggal Mulai
                            </label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Tanggal Selesai
                            </label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
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
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="pending">Menunggu</option>
                                    <option value="confirmed">Dikonfirmasi</option>
                                    <option value="ongoing">Sedang Berlangsung</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <CircleDollarSign className="h-4 w-4 text-blue-600" />
                                Ringkasan Biaya
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-gray-500">Total Hari</p>
                                    <p className="mt-1 font-medium text-gray-800">
                                        {totalDays} hari
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Harga / Hari</p>
                                    <p className="mt-1 font-medium text-gray-800">
                                        Rp {pricePerDay.toLocaleString("id-ID")}
                                    </p>
                                </div>
                                <div className="col-span-2 border-t border-gray-200 pt-3 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                                    <p className="text-xs text-gray-500">Total Harga</p>
                                    <p className="mt-1 text-lg font-bold text-blue-700">
                                        Rp {totalPrice.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <LinkButton href="/admin/bookings" variant="cancel">
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
                title="Perbarui Booking?"
                description="Apakah kamu yakin ingin menyimpan perubahan data booking ini?"
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