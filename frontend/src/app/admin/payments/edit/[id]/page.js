"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import paymentService from "@/services/paymentService";

export default function EditPaymentPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id;

    const [form, setForm] = useState({
        booking_id: "",
        payment_method: "bank_transfer",
        amount: "",
        payment_proof: "",
        status: "pending",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) {
            return;
        }

        const loadPayment = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await paymentService.getById(id);

                const payment = response.data?.data;

                if (!payment) {
                    setError(
                        "Data pembayaran tidak ditemukan."
                    );
                    return;
                }

                setForm({
                    booking_id:
                        payment.booking_id || "",
                    payment_method:
                        payment.payment_method ||
                        "bank_transfer",
                    amount: payment.amount || "",
                    payment_proof:
                        payment.payment_proof || "",
                    status:
                        payment.status || "pending",
                });
            } catch (error) {
                console.error(
                    "Error mengambil data pembayaran:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data pembayaran."
                );
            } finally {
                setLoading(false);
            }
        };

        loadPayment();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");

        try {
            await paymentService.update(id, {
                booking_id: Number(form.booking_id),
                payment_method:
                    form.payment_method,
                amount: Number(form.amount),
                payment_proof:
                    form.payment_proof || null,
                status: form.status,
            });

            router.push("/admin/payments");
        } catch (error) {
            console.error(
                "Error memperbarui pembayaran:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Pembayaran gagal diperbarui."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div>
                <p className="text-sm text-gray-500">
                    Memuat data pembayaran...
                </p>
            </div>
        );
    }

    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Payment
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Ubah data pembayaran.
                </p>
            </div>

            <div className="mt-6 max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
                {error && (
                    <div className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Booking ID
                        </label>

                        <input
                            type="number"
                            name="booking_id"
                            value={form.booking_id}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Metode Pembayaran
                        </label>

                        <select
                            name="payment_method"
                            value={
                                form.payment_method
                            }
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="bank_transfer">
                                Bank Transfer
                            </option>

                            <option value="cash">
                                Cash
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Jumlah
                        </label>

                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Bukti Pembayaran
                        </label>

                        <input
                            type="text"
                            name="payment_proof"
                            value={
                                form.payment_proof
                            }
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            placeholder="URL bukti pembayaran"
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
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="pending">
                                Pending
                            </option>

                            <option value="paid">
                                Paid
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/admin/payments"
                                )
                            }
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Menyimpan..."
                                : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
