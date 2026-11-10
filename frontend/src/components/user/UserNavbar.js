"use client";

import Link from "next/link";
import {
  CarFront,
  Car,
  House,
  Menu,
  X,
  LogIn,
  UserPlus,
  BookOpen,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: House,
    },
    {
      label: "Kendaraan",
      href: "/user/vehicles",
      icon: Car,
    },
    {
      label: "Panduan Rental",
      href: "/user/rental-guide",
      icon: BookOpen,
    },
    {
      label: "Informasi Toko",
      href: "/user/contact-location",
      icon: MapPin,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-xs backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3.5 focus:outline-none"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 transition-all duration-300 group-hover:rotate-[-4deg] group-hover:scale-105">
            <CarFront className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              R E<span className="text-blue-600 font-extrabold">V </span>
            </span>
            <span className="text-[10px] font-semibold tracking-[2.5px] text-slate-400">
              RENTAL VIHICLE
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-all duration-200 hover:bg-blue-50/80 hover:text-blue-600"
              >
                {Icon && (
                  <Icon className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:scale-110 group-hover:text-blue-600" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogIn className="h-4 w-4 text-slate-400" />
            Login
          </Link>

          <Link
            href="/register"
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:translate-y-0"
          >
            <UserPlus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Register
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 lg:hidden focus:outline-none"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-5 w-5 transition-transform duration-200 rotate-90 scale-110" />
          ) : (
            <Menu className="h-5 w-5 transition-transform duration-200" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 bg-white/95 px-4 py-5 shadow-2xl backdrop-blur-2xl lg:hidden sm:px-6">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1.5">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <span className="flex items-center gap-3">
                    {Icon && (
                      <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600" />
                    )}
                    {item.label}
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                </Link>
              );
            })}

            <div className="my-2 border-t border-slate-100" />

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200/80"
            >
              <LogIn className="h-4 w-4 text-slate-500" />
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:from-blue-700 hover:to-blue-800"
            >
              <UserPlus className="h-4 w-4" />
              Register
              <ChevronRight className="h-4 w-4" />
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}