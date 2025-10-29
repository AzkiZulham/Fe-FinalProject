"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { axios } from "@/lib/axios";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
});

const COOLDOWN_KEY = 'forgotPasswordCooldownEnd';

export default function ForgotPasswordClient() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedEndTime = localStorage.getItem(COOLDOWN_KEY);
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime);
      const now = Date.now();
      if (now < endTime) {
        setIsCooldown(true);
        setCooldownTime(Math.floor((endTime - now) / 1000));
      } else {
        localStorage.removeItem(COOLDOWN_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (isCooldown && cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (cooldownTime === 0 && isCooldown) {
      setIsCooldown(false);
      localStorage.removeItem(COOLDOWN_KEY);
    }
  }, [isCooldown, cooldownTime]);

  async function handleSubmit(values: { email: string }) {
    setServerMessage(null);

    try {
      await axios.post("/api/auth/forgot-password", values);
      setServerMessage(" Link reset password telah dikirim ke email Anda.");
      setIsCooldown(true);
      setCooldownTime(3600);
      const endTime = Date.now() + 3600 * 1000;
      localStorage.setItem(COOLDOWN_KEY, endTime.toString());
    } catch (error: any) {
      setServerMessage(error.message || "Terjadi kesalahan. Coba lagi.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-6 sm:p-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#2f567a]">
            Lupa Password
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Masukkan email Anda untuk menerima link reset password.
          </p>
        </div>

        {/* Form */}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setShowModal(true);
            await handleSubmit(values);
            setSubmitting(false);
            setShowModal(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  className="mt-2 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isCooldown}
                className="w-full bg-[#2f567a] text-white px-4 py-3 rounded-4xl font-semibold hover:bg-[#3a6b97] transition disabled:opacity-60"
              >
                {isSubmitting
                  ? "Mengirim..."
                  : isCooldown
                  ? `Tunggu ${Math.floor(cooldownTime / 60)}:${(cooldownTime % 60).toString().padStart(2, '0')} untuk kirim ulang`
                  : "Kirim Link Reset"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Server Message */}
        {serverMessage && (
          <div
            className={`mt-4 text-sm text-center ${
              serverMessage.includes("Instruksi")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {serverMessage}
          </div>
        )}

        {/* Link balik login */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Kembali ke{" "}
          <a
            href="/login/user"
            className="font-semibold text-[#2f567a] hover:underline"
          >
            Login User
          </a>{" "}
          atau{" "}
          <a
            href="/login/tenant"
            className="font-semibold text-[#2f567a] hover:underline"
          >
            Login Tenant
          </a>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-4xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f567a] mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-[#2f567a] mb-2">
                Mengirim Link Reset Password
              </h3>
              <p className="text-sm text-gray-500">
                Harap tunggu sebentar, link reset password sedang dikirim ke email Anda.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
