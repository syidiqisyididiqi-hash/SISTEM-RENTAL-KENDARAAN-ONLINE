
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    BookOpen,
    Image as ImageIcon,
    RefreshCw,
} from "lucide-react";

import rentalGuideService from "@/services/rentalGuideService";
import { resolveImage } from "@/lib/rentalLocationHelpers";

export default function RentalGuidePage() {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchGuides = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await rentalGuideService.getAll();

            setGuides(response.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Gagal mengambil data panduan rental."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGuides();
    }, [fetchGuides]);

    const filteredGuides = useMemo(() => {
        return guides.filter((guide) => {
            const matchSearch = guide.title
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchStatus =
                filterStatus === "all" ||
                Number(guide.is_active) === Number(filterStatus);

            return matchSearch && matchStatus;
        });
    }, [guides, search, filterStatus]);

    const handleStatus = async (guide) => {
        try {
            setError("");
            setSuccess("");

            const newStatus = Number(guide.is_active) === 1 ? 0 : 1;

            await rentalGuideService.updateStatus(
                guide.id,
                newStatus
            );

            setSuccess("Status panduan berhasil diperbarui.");
            fetchGuides();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Gagal mengubah status panduan."
            );
        }
    };

    const handleDelete = async () => {
        if (!selectedGuide) return;

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await rentalGuideService.remove(selectedGuide.id);

            setSelectedGuide(null);
            setSuccess("Panduan rental berhasil dihapus.");

            await fetchGuides();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Gagal menghapus panduan rental."
            );
        } finally {
            setDeleting(false);
        }
    };

    const activeCount = guides.filter(
        (guide) => Number(guide.is_active) === 1
    ).length;

    const inactiveCount = guides.length - activeCount;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen size={16} />
                        <span>Informasi</span>
                        <span>/</span>
                        <span className="text-gray-900">
                            Cara Rental
                        </span>
                    </div>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900">
                        Manajemen Cara Rental
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola langkah-langkah panduan penyewaan kendaraan.
                    </p>
                </div>

                <Link
                    href="/admin/rental-guide/create"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Tambah Panduan
                </Link>
            </div>

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Total Panduan
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {guides.length}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Panduan Aktif
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-600">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        Panduan Nonaktif
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-500">
                        {inactiveCount}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul panduan..."
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="all">Semua Status</option>
                        <option value="1">Aktif</option>
                        <option value="0">Nonaktif</option>
                    </select>

                    <button
                        type="button"
                        onClick={fetchGuides}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                                <th className="px-4 py-3 font-semibold">
                                    No
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Gambar
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Judul Panduan
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Urutan
                                </th>
                                <th className="px-4 py-3 font-semibold">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-center font-semibold">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="py-12 text-center text-gray-500"
                                    >
                                        Memuat data panduan...
                                    </td>
                                </tr>
                            ) : filteredGuides.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="py-12 text-center"
                                    >
                                        <BookOpen
                                            size={36}
                                            className="mx-auto mb-3 text-gray-300"
                                        />
                                        <p className="font-medium text-gray-700">
                                            Panduan tidak ditemukan
                                        </p>
                                        <p className="mt-1 text-gray-500">
                                            Belum ada data yang sesuai.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredGuides.map((guide, index) => (
                                    <tr
                                        key={guide.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-4 text-gray-600">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-4">
                                            {guide.image ? (
                                                <img
                                                    src={resolveImage(guide.image)}
                                                    alt={guide.title}
                                                    className="h-14 w-20 rounded-lg border border-gray-200 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                                    <ImageIcon size={22} />
                                                </div>
                                            )}
                                        </td>

                                        <td className="max-w-xs px-4 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {guide.title}
                                            </p>
                                            <p className="mt-1 truncate text-gray-500">
                                                {guide.description}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-gray-700">
                                            {guide.step_order}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    Number(guide.is_active) === 1
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {Number(guide.is_active) === 1
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatus(guide)}
                                                    title={
                                                        Number(guide.is_active) === 1
                                                            ? "Nonaktifkan"
                                                            : "Aktifkan"
                                                    }
                                                    className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                                >
                                                    {Number(guide.is_active) === 1 ? (
                                                        <EyeOff size={16} />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>

                                                <Link
                                                    href={`/admin/rental-guide/${guide.id}/edit`}
                                                    title="Edit"
                                                    className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Pencil size={16} />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedGuide(guide)}
                                                    title="Hapus"
                                                    className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    Menampilkan {filteredGuides.length} dari {guides.length} panduan
                </div>
            </div>

            {selectedGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-gray-900">
                            Hapus Panduan Rental
                        </h2>

                        <p className="mt-3 text-sm text-gray-600">
                            Apakah kamu yakin ingin menghapus panduan{" "}
                            <strong>{selectedGuide.title}</strong>?
                            Gambar yang terkait juga akan dihapus.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setSelectedGuide(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleDelete}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
