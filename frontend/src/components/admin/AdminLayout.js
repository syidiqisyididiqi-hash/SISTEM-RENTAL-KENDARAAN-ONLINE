import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({
    children,
}) {
    return (
        <div className="min-h-screen bg-gray-100">
            <AdminSidebar />

            <div className="ml-64">
                <AdminNavbar />

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}