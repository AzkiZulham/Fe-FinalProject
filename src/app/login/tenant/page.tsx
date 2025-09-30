// app/login/tenant/page.tsx
import Image from "next/image";
import LoginForm from "../../../components/loginForm";

export const metadata = {
  title: "Login Tenant — StayFinder",
  description:
    "Masuk sebagai pemilik/tenant untuk mengelola properti dan listing Anda.",
};

export default function TenantLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-md">
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="StayFinder Logo"
            width={300}
            height={300}
            className="mx-auto mb-4"
          />
          <p className="text-md text-gray-500 mt-2">
            Kelola properti dan data tenant Anda dengan aman.
          </p>
        </div>

        {/* Form */}
        <LoginForm role="tenant" redirectOnSuccess="/tenant/dashboard" />
      </div>
    </main>
  );
}
