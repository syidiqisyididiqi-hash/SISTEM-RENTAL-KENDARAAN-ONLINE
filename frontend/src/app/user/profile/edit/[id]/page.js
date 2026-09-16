"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import userService from "@/services/userService";

export default function EditProfilePage() {
  const params = useParams();
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
  const [success, setSuccess] = useState("");

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
        console.error("Gagal mengambil data profile:", error);

        setError(
          error.response?.data?.message ||
            "Gagal mengambil data profile"
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
      setSuccess("");

      const response = await userService.updateProfile(formData);

      const updatedUser = response.data.data;

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setSuccess("Profile berhasil diperbarui.");

      setTimeout(() => {
        router.push("/user/profile");
      }, 1000);
    } catch (error) {
      console.error("Gagal memperbarui profile:", error);

      setError(
        error.response?.data?.message ||
          "Gagal memperbarui profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">
            Memuat data profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-6 sm:px-8">
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Profil
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Perbarui informasi akun kamu
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <div className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nama
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nomor Telepon
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Masukkan nomor telepon"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Alamat
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Masukkan alamat"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/user/profile")}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}