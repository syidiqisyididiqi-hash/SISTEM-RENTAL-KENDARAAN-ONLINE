"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import userService from "@/services/userService";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";

export default function EditProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await userService.getProfile();
        const user = response.data.data;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        });
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);

        setError(
          error.response?.data?.message ||
            "Gagal mengambil data profil."
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await userService.updateProfile(formData);
      const updatedUser = response.data.data;

      sessionStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setToast({
        open: true,
        type: "success",
        message: "Profil berhasil diperbarui.",
      });

      setTimeout(() => {
        router.push("/user/profile");
      }, 1500);
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);

      setToast({
        open: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Gagal memperbarui profil.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="animate-pulse space-y-6 rounded-3xl border border-slate-200/60 bg-white p-8 shadow-2xs">
          <div className="h-7 w-1/4 rounded-lg bg-slate-100" />

          <div className="space-y-4">
            <div className="h-12 rounded-xl bg-slate-50" />
            <div className="h-12 rounded-xl bg-slate-50" />
            <div className="h-12 rounded-xl bg-slate-50" />
            <div className="h-24 rounded-xl bg-slate-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xs transition-all">

        <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Edit Profil
          </h1>

          <p className="mt-0.5 text-xs text-slate-500">
            Perbarui informasi data akun pribadi Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {error && (
            <p className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="space-y-4">

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              >
                Nama Lengkap
              </label>

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              >
                Alamat Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan alamat email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              >
                Nomor Telepon
              </label>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Masukkan nomor telepon"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              >
                Alamat Tempat Tinggal
              </label>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/40 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            </div>

          </div>

          <div className="mt-8 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-5">
              <LinkButton
                  href="/user/profile"
                  variant="cancel"
                >
                  Batal
              </LinkButton>
              
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saving}
                disabled={saving}
                // className="rounded-xl px-5"
              >
                Simpan Perubahan
              </Button>
          </div>
        </form>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}