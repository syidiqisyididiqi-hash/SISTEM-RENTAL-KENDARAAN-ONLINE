"use client";

import Link from "next/link";

export default function LinkButton({
    children,
    href,
    variant = "edit",
}) {
    const variants = {
        edit: {
            color: "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-blue-500",
            size: "rounded-md px-3 py-1.5 text-xs",
        },

        add: {
            color: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
            size: "rounded-lg px-4 py-2.5 text-sm",
        },

        cancel: {
            color: "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-gray-500",
            size: "rounded-lg px-4 py-2.5 text-sm",
        },
    };

    const current = variants[variant] || variants.edit;

    return (
        <Link
            href={href}
            className={`
                inline-flex
                items-center
                justify-center
                whitespace-nowrap
                font-medium
                transition-all
                duration-200
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                ${current.size}
                ${current.color}
            `}
        >
            {children}
        </Link>
    );
}