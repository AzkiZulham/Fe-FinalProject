"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/authContext"; // sesuaikan path


type Props = {
  role: "USER" | "TENANT";
  redirectOnSuccess?: string;
};

interface LoginPayload {
  email: string;
  password: string;
  role: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .required("Password wajib diisi"),
});

export default function LoginForm({ role, redirectOnSuccess }: Props) {
  const router = useRouter();
  const { login } = useAuth(); // 🔹 ambil fungsi login dari context
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(values: { email: string; password: string }) {
    setServerError(null);

    const payload: LoginPayload = {
      email: values.email,
      password: values.password,
      role,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.message || data?.error || `Login gagal (status ${res.status})`);
        
        return;
      }
      const destination = redirectOnSuccess || (role === "TENANT" ? "/tenant/dashboard" : "/user/profile");
      router.push(data.redirect || destination);

      // 🔹 Simpan user + token ke context (dan localStorage otomatis)
      login(data.user, data.token);

      // Redirect
      router.push(data.redirect || (role === "TENANT" ? "/tenant/dashboard" : "/user/profile"));
    } catch (err: unknown) {
      console.error("Login error:", err);
      setServerError("Terjadi kesalahan jaringan. Coba lagi.");
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-4xl p-6 sm:p-8">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#2f567a] dark:text-white">
          Masuk sebagai {role === "TENANT" ? "TENANT" : "USER"}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Masukkan email dan password akunmu untuk melanjutkan.
        </p>
      </header>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form aria-label={`${role}-login-form`} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor={`email-${role}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <Field
                id={`email-${role}`}
                name="email"
                type="email"
                autoComplete="email"
                aria-required
                className="mt-2 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                placeholder="example@email.com"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor={`password-${role}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Field
                  id={`password-${role}`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-required
                  className="mt-2 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                  placeholder="Masukkan password"
                />
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
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Server error */}
            {serverError && (
              <div role="alert" className="text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center bg-[#2f567a] text-white px-4 py-3 rounded-4xl font-semibold hover:bg-[#3a6b97] transition disabled:opacity-60"
              >
                {isSubmitting ? "Memproses..." : "Masuk"}
              </button>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    aria-label="Remember me"
                  />
                  <span>Ingat Saya</span>
                </label>

                <a
                  href="/forgot-password"
                  className="hover:text-[#3a6b97] font-semibold hover:underline transition text-medium"
                >
                  Lupa password?
                </a>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Separator */}
      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        <span className="mx-3 text-sm text-gray-500 dark:text-gray-400">
          atau masuk dengan
        </span>
        <hr className="flex-grow border-gray-300 dark:border-gray-600" />
      </div>

      {/* Social login */}
      <div className="space-y-3">
        <button
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-4xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          <FaGoogle className="w-5 h-5" />
          Masuk dengan Google
        </button>

        <button
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-4xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          <FaFacebook className="w-5 h-5" />
          Masuk dengan Facebook
        </button>
      </div>

      <footer className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Belum punya akun?{" "}
        <a
          href={role === "TENANT" ? "/register/tenant" : "/register/user"}
          className="font-semibold text-[#2f567a] hover:underline"
        >
          Daftar
        </a>
      </footer>
    </div>
  );
}
