"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Check, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tokenChecked, setTokenChecked] = useState<"checking" | "valid" | "invalid">("checking");

  const criteria = [
    { label: "Minimal 8 karakter", test: (pwd: string) => pwd.length >= 8, tip: "Gunakan setidaknya 8 karakter." },
    { label: "Huruf besar", test: (pwd: string) => /[A-Z]/.test(pwd), tip: "Tambahkan huruf besar seperti A, B, C." },
    { label: "Huruf kecil", test: (pwd: string) => /[a-z]/.test(pwd), tip: "Tambahkan huruf kecil seperti a, b, c." },
    { label: "Angka", test: (pwd: string) => /[0-9]/.test(pwd), tip: "Tambahkan angka seperti 1, 2, 3." },
    { label: "Simbol", test: (pwd: string) => /[\W_]/.test(pwd), tip: "Tambahkan simbol seperti !, @, #, $." },
  ];

  const validateAllCriteria = (pwd: string) => criteria.every(c => c.test(pwd));
  const strengthScore = criteria.reduce((acc, c) => acc + (c.test(password) ? 1 : 0), 0);
  const getStrengthColor = (score: number) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-400";
    return "bg-green-500";
  };
  const strengthLabel = ["Sangat lemah","Lemah","Sedang","Cukup Kuat","Kuat","Sangat Kuat"][strengthScore];

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenChecked("invalid");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-token?token=${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setTokenChecked("invalid");
          return;
        }

        setTokenChecked("valid");
      } catch (err) {
        console.error("Token check failed:", err);
        setTokenChecked("invalid");
      }
    };

    checkToken();
  }, [token]);

  if (tokenChecked === "checking") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#eaf3fc] dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300 text-sm">Memeriksa token verifikasi...</p>
      </main>
    );
  }

  if (tokenChecked === "invalid") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#eaf3fc] dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#2f567a] dark:text-white mb-4">404</h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">Token tidak valid atau sudah kedaluwarsa.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-5 py-2 bg-[#2f567a] text-white rounded-xl hover:bg-[#3a6b97] transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setMessage("Token verifikasi tidak ditemukan.");
    if (!validateAllCriteria(password)) return setMessage("Password belum memenuhi semua kriteria.");
    if (password !== confirmPassword) return setMessage("Konfirmasi password tidak sama!");

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
        const loginRoute = data.user?.role === "TENANT" ? "/login/tenant" : "/login/user";
        setTimeout(() => router.push(loginRoute), 2000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Terjadi kesalahan saat memverifikasi akun.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#eaf3fc] dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-8 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#2f567a] dark:text-white mb-2">
          Verifikasi Akun
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
          Masukkan password baru untuk menyelesaikan verifikasi akun Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Baru */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password Baru
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-2 top-12 -translate-y-1/2 text-gray-500 dark:text-gray-400 p-1"
            >
              {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
            </button>
          </div>

          {/* Strength Bar + Criteria (muncul hanya saat user mulai mengetik) */}
          {password && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              {/* Strength Bar */}
              <div className="w-full h-2 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(strengthScore / criteria.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-2 rounded-full ${getStrengthColor(strengthScore)}`}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs mt-1 text-gray-700 dark:text-gray-300"
              >
                {strengthLabel}
              </motion.p>

              {/* Criteria List */}
              <ul className="mt-2 text-sm space-y-1 pl-2">
                {criteria.map((c) => {
                  const passed = c.test(password);
                  return (
                    <motion.li
                      key={c.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-1 relative group ${
                        passed ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {passed ? <Check size={16} /> : <X size={16} />}
                      {c.label}
                      {!passed && (
                        <span className="absolute left-full ml-2 w-44 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Info size={12} className="inline mr-1" />
                          {c.tip}
                        </span>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          )}

          {/* Konfirmasi Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konfirmasi Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-2 top-12 -translate-y-1/2 text-gray-500 dark:text-gray-400 p-1"
            >
              {showConfirmPassword ? <EyeOff size={25} /> : <Eye size={25} />}
            </button>

            <AnimatePresence>
              {confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs mt-1 ${password === confirmPassword ? "text-green-600" : "text-red-500"}`}
                >
                  {password === confirmPassword ? "Password cocok" : "Password tidak cocok"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Server message */}
          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center text-sm ${isSuccess ? "text-green-600" : "text-red-500"}`}
            >
              {message}
            </motion.div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2f567a] hover:bg-[#3a6b97] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
