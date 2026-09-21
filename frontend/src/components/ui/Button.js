"use client";

import { Loader2 } from "lucide-react";

export default function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    onClick,
    className = "",
}) {
    const variants = {
        
        primary:
            "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:ring-blue-500",

       
        success:
            "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md focus-visible:ring-emerald-500",

       
        warning:
            "bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md focus-visible:ring-amber-500",

       
        danger:
            "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:ring-red-500",

       
        secondary:
            "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus-visible:ring-gray-400",

       
        ghost:
            "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400",
    };

    const sizes = {
        sm: "h-9 rounded-md px-3 text-xs",
        md: "h-10 rounded-lg px-4 text-sm",
        lg: "h-11 rounded-lg px-5 text-sm",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            aria-busy={loading}
            className={`
                inline-flex
                items-center
                justify-center
                gap-2
                whitespace-nowrap
                font-medium
                transition-all
                duration-200
                outline-none
                select-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                active:scale-[0.98]
                disabled:pointer-events-none
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${sizes[size] || sizes.md}
                ${variants[variant] || variants.primary}
                ${className}
            `}
        >
            {loading && (
                <Loader2
                    size={16}
                    className="animate-spin"
                />
            )}

            <span>
                {loading ? "Memproses..." : children}
            </span>
        </button>
    );
}