"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FieldInputProps } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

// VALIDASI FORM
const PasswordSchema = Yup.object().shape({
  password: Yup.string().required("Password wajib diisi"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password tidak sama")
    .required("Konfirmasi password wajib diisi"),
});

// FUNGSI CEK KEKUATAN PASSWORD
function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "Lemah", color: "bg-red-500", width: "w-1/4" };
  if (score === 3) return { level: "Sedang", color: "bg-yellow-500", width: "w-2/4" };
  if (score === 4) return { level: "Kuat", color: "bg-blue-500", width: "w-3/4" };
  return { level: "Sangat Kuat", color: "bg-green-500", width: "w-full" };
}

function getPasswordChecks(password: string) {
  return [
    { label: "Minimal 8 karakter", valid: password.length >= 8 },
    { label: "Mengandung huruf besar", valid: /[A-Z]/.test(password) },
    { label: "Mengandung huruf kecil", valid: /[a-z]/.test(password) },
    { label: "Mengandung angka", valid: /[0-9]/.test(password) },
    { label: "Mengandung simbol", valid: /[^A-Za-z0-9]/.test(password) },
  ];
}

// KOMPONEN PAGE
export default function VerifyPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  // PROTEKSI: redirect kalau tidak ada token
  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  if (!token) return null;

  const strength = passwordInput ? getPasswordStrength(passwordInput) : null;
  const checks = passwordInput ? getPasswordChecks(passwordInput) : [];

  // HANDLE SUBMIT
  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    setError("");
    setLoading(true);
    try {
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      // Simpan JWT di localStorage (atau bisa pakai cookie)
      localStorage.setItem("token", data.token);

      // Redirect sesuai role
      router.push(data.redirect || "/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#eaf3fc] dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-4xl p-10 sm:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#2f567a] dark:text-white mb-4">
          Verifikasi Akun
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
          Masukkan password baru untuk menyelesaikan verifikasi akun Anda.
        </p>

        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={PasswordSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="space-y-6">
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Field name="password">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordInput(e.target.value);
                        }}
                        className="mt-2 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                      />
                    )}
                  </Field>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Indikator Password */}
              {passwordInput && strength && (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full">
                    <div className={`h-2 rounded-full ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Kekuatan Password: <span className="font-medium">{strength.level}</span>
                  </p>
                  <ul className="text-xs space-y-1">
                    {checks.map((check, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                      >
                        {check.valid ? (
                          <CheckCircle2 className="text-green-500" size={16} />
                        ) : (
                          <XCircle className="text-red-500" size={16} />
                        )}
                        {check.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Field name="confirmPassword">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <input
                        {...field}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Konfirmasi password"
                        value={field.value}
                        onChange={field.onChange}
                        className="mt-2 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                      />
                    )}
                  </Field>
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Error Global */}
              {error && <div className="text-sm text-red-500 text-center">{error}</div>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2f567a] hover:bg-[#3a6b97] text-white font-semibold py-3 rounded-4xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Complete Registrasi"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
