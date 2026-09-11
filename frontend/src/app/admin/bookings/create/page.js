"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import bookingService from "@/services/bookingService";
import userService from "@/services/userService";
import vehicleService from "@/services/vehicleService";

export default function CreateBookingPage() {
    const router = useRouter();

    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [form, setForm] = useState({
        user_id: "",
        vehicle_id: "",
        start_date: "",
        end_date: "",
        status: "pending",
    });

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersResponse, vehiclesResponse] =
                    await Promise.all([
                        userService.getAll(),
                        vehicleService.getAll(),
                    ]);

                setUsers(usersResponse.data?.data || []);
                setVehicles(vehiclesResponse.data?.data || []);
            } catch (error) {
                console.error(error);
                setError("Gagal mengambil data user atau kendaraan.");
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const selectedVehicle = vehicles.find(
        (vehicle) => String(vehicle.id) === String(form.vehicle_id)
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

        return difference >= 0 ? Math.ceil(difference) + 1 : 0;
    };

    const totalDays = calculateDays();

    const pricePerDay = Number(
        selectedVehicle?.price_per_day ||
            selectedVehicle?.rental_price ||
            selectedVehicle?.price ||
            0
    );

    const totalPrice = totalDays * pricePerDay;

    const handleSubmit = async (e) => {
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

        if (new Date(form.end_date) < new Date(form.start_date)) {
            setError(
                "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."
            );
            return;
        }

        try {
            setLoading(true);

            await bookingService.create({
                user_id: Number(form.user_id),
                vehicle_id: Number(form.vehicle_id),
                start_date: form.start_date,
                end_date: form.end_date,
                total_days: totalDays,
                price_per_day: pricePerDay,
                total_price: totalPrice,
                status: form.status,
            });

            alert("Booking berhasil ditambahkan.");

            router.push("/admin/bookings");
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                    "Gagal menambahkan booking."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="p-6">
                <p className="text-sm text-gray-500">
                    Memuat data...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Tambah Booking
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Tambahkan data penyewaan kendaraan baru.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-gray-200 bg-white p-6"
            >
                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            User
                        </label>

                        <select
                            name="user_id"
                            value={form.user_id}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
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
                            value={form.vehicle_id}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
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
                                value={form.start_date}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Tanggal Selesai
                            </label>

                            <input
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="pending">
                                Pending
                            </option>

                            <option value="confirmed">
                                Confirmed
                            </option>

                            <option value="ongoing">
                                Ongoing
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="cancelled">
                                Cancelled
                            </option>

                            <option value="rejected">
                                Rejected
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
                                {pricePerDay.toLocaleString("id-ID")}
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between border-t pt-3">
                            <span className="font-semibold text-gray-700">
                                Total Harga
                            </span>

                            <span className="font-bold text-blue-600">
                                Rp{" "}
                                {totalPrice.toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                        <Link
                            href="/admin/bookings"
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Menyimpan..."
                                : "Simpan Booking"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}