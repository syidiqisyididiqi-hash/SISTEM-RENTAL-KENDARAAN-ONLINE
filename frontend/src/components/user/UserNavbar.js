"use client";

import Link from "next/link";
import { CarFront, Menu, User, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/user" className="flex items-center gap-2">
          <CarFront className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">
            RentalKendaraan
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/user"
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
        </nav>

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

      {isOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            <Link
              href="/user"
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
          </nav>
        </div>
      )}
    </header>
  );
}