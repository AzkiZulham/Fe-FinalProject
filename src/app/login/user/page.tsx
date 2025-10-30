import Image from "next/image";
import { Suspense } from "react";
import LoginFormClient from "../user/loginFormClient";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Login User — StayFinder",
  description: "Masuk sebagai user untuk mengelola preferensi dan pemesanan di StayFinder.",
};

export default function UserLoginPage() {
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
            Akses akun user untuk melihat transaksi dan preferensi.
            </p>
          </div>

          {/* Form */}
          <Suspense fallback={<div>Loading...</div>}>
            <LoginFormClient
              role="USER"
              redirectOnSuccess="/"
            />
          </Suspense>
        </div>
    </main>
  );
}