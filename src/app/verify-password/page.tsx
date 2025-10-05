"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Konfirmasi password tidak sama!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Password berhasil dibuat! Kamu akan diarahkan ke halaman login...");

        localStorage.removeItem("verifyToken");        
        // ✅ Tentukan redirect sesuai role dari backend
        const loginRoute =
          data.user?.role === "TENANT" ? "/login/tenant" : "/login/user";

        // Delay 2 detik sebelum redirect ke halaman login
        setTimeout(() => {
          router.push(loginRoute);
        }, 2000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Terjadi kesalahan saat memverifikasi akun.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#eaf3fc] dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-3xl p-10 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#2f567a] dark:text-white mb-4">
          Verifikasi Akun
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
          Masukkan password baru untuk menyelesaikan verifikasi akun Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password Baru
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
              required
            />
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full px-4 py-3 rounded-3xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
              required
            />
          </div>

          {/* Pesan Feedback */}
          {message && (
            <div
              className={`text-center text-sm mt-2 ${
                isSuccess ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </div>
          )}

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2f567a] hover:bg-[#3a6b97] text-white font-semibold py-3 rounded-3xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
