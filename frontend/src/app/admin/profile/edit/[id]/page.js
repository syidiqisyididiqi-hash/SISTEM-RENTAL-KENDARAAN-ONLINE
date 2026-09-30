"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    UserRound, 
    Mail, 
    Phone, 
    MapPin, 
    ShieldCheck, 
    AlertCircle, 
    Pencil,
} from "lucide-react";
import userService from "@/services/userService";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";

export default function EditProfilePage() {
    const params = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "",
    });

    const [user, setUser] = useState(null);
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
        const getUser = async () => {
            try {
                setLoading(true);
                setError("");

                const response = params?.id 
                    ? await userService.getById(params.id) 
                    : await userService.getProfile();

                const userData =
                    response?.data?.data ||
                    response?.data ||
                    null;

                if (!userData) {
                    setError("Data user tidak ditemukan.");
                    return;
                }

                setUser(userData);

                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    address: userData.address || "",
                    role: userData.role || "user",
                });
            } catch (error) {
                console.error(error);

                setError(
                    error.response?.data?.message ||
                        "Gagal mengambil data user."
                );
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, [params?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");

        if (!formData.name || !formData.email) {
            setError("Nama dan email wajib diisi.");
            return;
        }

        if (!formData.role) {
            setError("Role wajib dipilih.");
            return;
        }

        setShowUpdateDialog(true);
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            setError("");

            const targetId = params?.id || user?.id;
            const response = await userService.update(
                targetId,
                formData
            );

            const updatedUser =
                response?.data?.data ||
                response?.data ||
                null;

            if (updatedUser) {
                setUser(updatedUser);

                setFormData({
                    name: updatedUser.name || "",
                    email: updatedUser.email || "",
                    phone: updatedUser.phone || "",
                    address: updatedUser.address || "",
                    role: updatedUser.role || "user",
                });

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );
            }

            setShowUpdateDialog(false);
            setToast({
                open: true,
                type: "success",
                message: "Profile berhasil diperbarui.",
            });

            setTimeout(() => {
                router.push("/admin/profile");
            }, 1500);
        } catch (error) {
            console.error(error);

            setShowUpdateDialog(false);
            const message =
                error.response?.data?.message ||
                "Gagal memperbarui profile.";

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
                        Memuat data profile...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-4xl pb-10">
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                            <Pencil size={19} strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Edit Profile
                            </h1>
                            <p className="text-sm text-gray-500">
                                Perbarui informasi profile kamu.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="mx-6 mt-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 md:mx-8">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <span>{error || "Data profile tidak ditemukan."}</span>
                    </div>
                    <div className="flex justify-end p-6 md:px-8">
                        <LinkButton href="/admin/profile" variant="cancel">
                            Kembali ke Profile
                        </LinkButton>
                    </div>
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
                            Edit Profile
                        </h1>
                        <p className="text-sm text-gray-500">
                            Ubah informasi profile dan identitas kamu.
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
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Masukkan alamat email"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Masukkan nomor telepon"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Hak Akses / Role
                            </label>
                            <div className="relative">
                                <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Alamat Lengkap
                            </label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Masukkan alamat lengkap"
                                    className="w-full resize-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                        <LinkButton href="/admin/profile" variant="cancel">
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
                title="Perbarui Profile?"
                description="Apakah kamu yakin ingin menyimpan perubahan profile ini?"
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