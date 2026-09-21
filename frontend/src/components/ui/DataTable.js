"use client";

export default function DataTable({
    columns = [],
    data = [],
    loading = false,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600"
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-5 py-10 text-center text-sm text-gray-500"
                                >
                                    Memuat data...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-5 py-10 text-center text-sm text-gray-500"
                                >
                                    Belum ada data.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr
                                    key={row.id ?? index}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-5 py-4 text-gray-700"
                                        >
                                            {column.render
                                                ? column.render(
                                                      row,
                                                      index
                                                  )
                                                : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}