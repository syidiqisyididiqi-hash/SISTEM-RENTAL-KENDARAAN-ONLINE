"use client";

import Link from "next/link";
import {
  CarFront,
  Menu,
  User,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const subscribeToAuth = (onChange) => {
  const handleChange = () => onChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener("auth-change", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("auth-change", handleChange);
  };
};

const getTokenSnapshot = () =>
  typeof window === "undefined" ? null : localStorage.getItem("token");

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const token = useSyncExternalStore(subscribeToAuth, getTokenSnapshot, () => null);
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href={isLoggedIn ? "/user/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <CarFront className="h-7 w-7 text-blue-600" />

          <span className="text-xl font-bold text-slate-900">
            RentalKendaraan
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          {!isLoggedIn ? (
            <>
              {/* BELUM LOGIN */}

              <Link
                href="/"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Beranda
              </Link>

              <Link
                href="/user/vehicles"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Kendaraan
              </Link>

              <a
                href="#cara-rental"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Cara Rental
              </a>

              <a
                href="#tentang"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Tentang
              </a>

              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </>
          ) : (
            <>
              {/* SUDAH LOGIN */}

              <Link
                href="/user/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/user/vehicles"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Kendaraan
              </Link>

              <Link
                href="/user/bookings"
                className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                Booking
              </Link>

              <Link
                href="/user/profile"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
              >
                <User className="h-4 w-4" />
                Profil
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">

            {!isLoggedIn ? (
              <>
                {/* BELUM LOGIN */}

                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Beranda
                </Link>

                <Link
                  href="/user/vehicles"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Kendaraan
                </Link>

                <a
                  href="#cara-rental"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cara Rental
                </a>

                <a
                  href="#tentang"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Tentang
                </a>

                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 rounded-lg bg-slate-100 px-3 py-3 text-center text-sm font-semibold text-slate-700"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {/* SUDAH LOGIN */}

                <Link
                  href="/user/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Dashboard
                </Link>

                <Link
                  href="/user/vehicles"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Kendaraan
                </Link>

                <Link
                  href="/user/bookings"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Booking
                </Link>

                <Link
                  href="/user/profile"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Profil
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}