import UserFooter from "@/components/user/UserFooter";
import UserAuthNavbar from "@/components/user/UserAuthNavbar";

export default function UserLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <UserAuthNavbar />

            <main className="flex-1">
                {children}
            </main>

            <UserFooter />
        </div>
    );
}