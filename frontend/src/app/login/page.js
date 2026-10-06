import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Suspense fallback={<p className="text-center text-sm text-slate-500">Memuat halaman login...</p>}>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}