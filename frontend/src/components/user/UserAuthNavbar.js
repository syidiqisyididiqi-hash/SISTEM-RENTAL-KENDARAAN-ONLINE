"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  CarFront,
  CalendarCheck,
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import UserNavbar from "@/components/user/UserNavbar";

const subscribeToAuth = (onChange) => {
  const handleChange = () => onChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener("auth-change", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener("auth-change", handleChange);
  };
};

const getTokenSnapshot = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

const getUserSnapshot = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("user");
};

const protectedRoutes = [
  "/user/dashboard",
  "/user/bookings",
  "/user/profile",
];

export default function UserAuthNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const token = useSyncExternalStore(
    subscribeToAuth,
    getTokenSnapshot,
    () => null
  );

  const storedUser = useSyncExternalStore(
    subscribeToAuth,
    getUserSnapshot,
    () => null
  );

  const requiresAuth = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const isUserSession =
    user?.role?.toLowerCase() === "user";

  useEffect(() => {
    if (!token && requiresAuth) {
      router.replace("/login");
    }
  }, [token, requiresAuth, router]);

  if (!token || !isUserSession) {
    return requiresAuth ? null : <UserNavbar />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsOpen(false);

    window.dispatchEvent(new Event("auth-change"));

    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link
          href="/user/dashboard"
          className="flex items-center gap-2"
        >
          <CarFront className="h-7 w-7 text-blue-600" />

          <span className="text-xl font-bold text-slate-900">
            RentalKendaraan
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">

          <Link
            href="/user/dashboard"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/user/vehicles"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <CarFront className="h-4 w-4" />
            Kendaraan
          </Link>

          <Link
            href="/user/bookings"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <CalendarCheck className="h-4 w-4" />
            Booking
          </Link>

          <Link
            href="/user/profile"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <User className="h-4 w-4" />
            Profil
          </Link>

          {user && (
            <>
              <div className="ml-2 h-6 w-px bg-slate-200" />

              <span className="px-3 text-sm font-medium text-slate-700">
                {user.name}
              </span>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

        </nav>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">

            <Link
              href="/user/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/user/vehicles"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <CarFront className="h-5 w-5" />
              Kendaraan
            </Link>

            <Link
              href="/user/bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <CalendarCheck className="h-5 w-5" />
              Booking
            </Link>

            <Link
              href="/user/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <User className="h-5 w-5" />
              Profil
            </Link>

            <div className="my-2 border-t border-slate-200" />

            {user && (
              <div className="px-4 py-2 text-sm font-medium text-slate-700">
                {user.name}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>

          </nav>
        </div>
      )}
    </header>
  );
}
