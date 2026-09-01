const statistics = [
    {
        title: "Total Users",
        value: "120",
        description: "Pengguna terdaftar",
    },
    {
        title: "Total Vehicles",
        value: "25",
        description: "Kendaraan tersedia",
    },
    {
        title: "Total Bookings",
        value: "86",
        description: "Total pemesanan",
    },
    {
        title: "Total Revenue",
        value: "Rp 24.500.000",
        description: "Pendapatan keseluruhan",
    },
];

const recentBookings = [
    {
        id: "#BK001",
        user: "Budi Santoso",
        vehicle: "Toyota Avanza",
        date: "01 Sep 2026",
        total: "Rp 350.000",
        status: "Confirmed",
    },
    {
        id: "#BK002",
        user: "Andi Saputra",
        vehicle: "Honda Brio",
        date: "01 Sep 2026",
        total: "Rp 300.000",
        status: "Pending",
    },
    {
        id: "#BK003",
        user: "Siti Rahma",
        vehicle: "Toyota Innova",
        date: "31 Aug 2026",
        total: "Rp 600.000",
        status: "Completed",
    },
    {
        id: "#BK004",
        user: "Rizky Maulana",
        vehicle: "Daihatsu Xenia",
        date: "31 Aug 2026",
        total: "Rp 400.000",
        status: "Pending",
    },
];

function StatusBadge({ status }) {
    const styles = {
        Confirmed:
            "bg-blue-100 text-blue-700",
        Pending:
            "bg-yellow-100 text-yellow-700",
        Completed:
            "bg-green-100 text-green-700",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
                styles[status]
            }`}
        >
            {status}
        </span>
    );
}

export default function AdminDashboardPage() {
    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Selamat datang kembali,
                    Administrator.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {statistics.map((item) => (
                    <div
                        key={item.title}
                        className="rounded-xl border bg-white p-6 shadow-sm"
                    >
                        <p className="text-sm font-medium text-gray-500">
                            {item.title}
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-800">
                            {item.value}
                        </h2>

                        <p className="mt-2 text-xs text-gray-500">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Recent Bookings */}
                <div className="xl:col-span-2">
                    <div className="rounded-xl border bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="font-semibold text-gray-800">
                                    Recent Bookings
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Pemesanan terbaru
                                </p>
                            </div>

                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                View All
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4">
                                            ID
                                        </th>

                                        <th className="px-6 py-4">
                                            User
                                        </th>

                                        <th className="px-6 py-4">
                                            Vehicle
                                        </th>

                                        <th className="px-6 py-4">
                                            Date
                                        </th>

                                        <th className="px-6 py-4">
                                            Total
                                        </th>

                                        <th className="px-6 py-4">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {recentBookings.map(
                                        (booking) => (
                                            <tr
                                                key={
                                                    booking.id
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 font-medium">
                                                    {
                                                        booking.id
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    {
                                                        booking.user
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    {
                                                        booking.vehicle
                                                    }
                                                </td>

                                                <td className="px-6 py-4 text-gray-500">
                                                    {
                                                        booking.date
                                                    }
                                                </td>

                                                <td className="px-6 py-4 font-medium">
                                                    {
                                                        booking.total
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatusBadge
                                                        status={
                                                            booking.status
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="font-semibold text-gray-800">
                            Booking Summary
                        </h2>

                        <p className="text-sm text-gray-500">
                            Status pemesanan
                        </p>
                    </div>

                    <div className="space-y-5 p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Pending
                            </span>

                            <span className="font-semibold text-yellow-600">
                                10
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Confirmed
                            </span>

                            <span className="font-semibold text-blue-600">
                                18
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Ongoing
                            </span>

                            <span className="font-semibold text-purple-600">
                                7
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Completed
                            </span>

                            <span className="font-semibold text-green-600">
                                45
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Cancelled
                            </span>

                            <span className="font-semibold text-gray-600">
                                6
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}