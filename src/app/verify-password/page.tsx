"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Check, X, Info, Shield, Lock, ArrowRight } from "lucide-react";
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
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return "Sangat Lemah";
    if (score <= 2) return "Lemah";
    if (score <= 3) return "Sedang";
    if (score <= 4) return "Kuat";
    return "Sangat Kuat";
  };

  const getStrengthTextColor = (score: number) => {
    if (score <= 1) return "text-red-600";
    if (score <= 2) return "text-orange-600";
    if (score <= 3) return "text-yellow-600";
    if (score <= 4) return "text-blue-600";
    return "text-green-600";
  };

  // ==== Check token validity ====
  useEffect(() => {
    const checkToken = async () => {
      if (!token) return setTokenChecked("invalid");

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-token?token=${token}`);
        const data = await res.json();
        setTokenChecked(res.ok && data.valid ? "valid" : "invalid");
      } catch (err) {
        console.error("Token check failed:", err);
        setTokenChecked("invalid");
      }
    };
    checkToken();
  }, [token]);

  // ==== Loading / invalid token UI ====
  if (tokenChecked === "checking") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#2f567a] animate-pulse" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Memeriksa token verifikasi...</p>
        </div>
      </main>
    );
  }

  if (tokenChecked === "invalid") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Token Tidak Valid</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Token verifikasi tidak valid atau sudah kedaluwarsa.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-[#2f567a] text-white rounded-xl hover:bg-[#3a6b97] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
          >
            Kembali ke Beranda
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </main>
    );
  }

  // ==== Submit handler ====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setMessage("Token verifikasi tidak ditemukan.");
    if (!validateAllCriteria(password)) return setMessage("Password belum memenuhi semua kriteria keamanan.");
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
        setMessage("🎉 Password berhasil dibuat! Kamu akan diarahkan ke halaman login...");
        localStorage.removeItem("verifyToken");
        setTimeout(() => router.push(data.redirect || "/login/user"), 2000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Terjadi kesalahan saat memverifikasi akun.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  // ==== Render form ====
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 sm:p-10 border border-gray-100 dark:border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#2f567a] to-[#3a6b97] rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Buat Password Baru
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Lengkapi verifikasi akun dengan password yang aman
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Baru */}
          <div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Password Baru
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password baru yang kuat"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 pr-12 py-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2f567a] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-4 border border-blue-100 dark:border-gray-600"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Kekuatan Password</span>
                <span className={`text-sm font-bold ${getStrengthTextColor(strengthScore)}`}>
                  {getStrengthLabel(strengthScore)}
                </span>
              </div>
              
              {/* Strength Bar */}
              <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(strengthScore / criteria.length) * 100}%` }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className={`h-3 rounded-full ${getStrengthColor(strengthScore)}`}
                />
              </div>

              {/* Criteria List */}
              <div className="space-y-2">
                {criteria.map((criterion, index) => (
                  <motion.div
                    key={criterion.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-3 group relative"
                  >
                    {criterion.test(password) ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${criterion.test(password) ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                      {criterion.label}
                    </span>
                    {!criterion.test(password) && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Info className="w-4 h-4 text-gray-400" />
                        <div className="absolute left-full ml-2 w-48 bg-gray-800 text-white text-xs p-2 rounded-lg shadow-lg z-10">
                          {criterion.tip}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Konfirmasi Password */}
          <div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Konfirmasi Password
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 pr-12 py-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2f567a] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            <AnimatePresence>
              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-2 flex items-center space-x-2 text-sm ${
                    password === confirmPassword ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {password === confirmPassword ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span>{password === confirmPassword ? "Password cocok" : "Password tidak cocok"}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Server message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl text-center font-medium ${
                  isSuccess 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" 
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                }`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading || !password || !confirmPassword || password !== confirmPassword || !validateAllCriteria(password)}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#2f567a] to-[#3a6b97] hover:from-[#3a6b97] hover:to-[#2f567a] text-white font-bold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
            <span>{loading ? "Menyimpan Password..." : "Simpan Password"}</span>
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}