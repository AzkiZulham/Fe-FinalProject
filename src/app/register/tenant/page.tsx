"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";

const RegisterTenantSchema = Yup.object().shape({
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
});

export default function RegisterTenant() {
  const [showModal, setShowModal] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string }) => {
    setMessage(null);
    try {
      const res = await fetch("/api/registerTenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(true);
      } else {
        setMessage(data.error || "Terjadi kesalahan. Coba lagi.");
      }
    } catch {
      setMessage("Terjadi kesalahan jaringan. Coba lagi.");
    }
  };

  const closeModal = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setShowModal(false);
      setAnimateOut(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buat Akun Tenant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Form email */}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={RegisterTenantSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await handleSubmit(values);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Alamat email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-gray-50 dark:bg-gray-800"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-white bg-[#2f567a] hover:bg-[#3a6b97] font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Lanjutkan dengan Email
              </button>
            </Form>
          )}
        </Formik>

        {/* Error message */}
        {message && (
          <p className="text-center text-sm mt-2 text-red-600 dark:text-red-400">
            {message}
          </p>
        )}

        {/* Separator */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          <span className="mx-3 text-sm text-gray-500 dark:text-gray-400">
            atau gunakan salah satu opsi ini
          </span>
          <hr className="flex-grow border-gray-300 dark:border-gray-600" />
        </div>

        {/* Social login buttons */}
        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/api/auth/google")}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-shadow shadow-md hover:shadow-lg"
          >
            <FaGoogle className="w-5 h-5" />
            Daftar dengan Google
          </button>

          <button
            onClick={() => (window.location.href = "/api/auth/facebook")}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-shadow shadow-md hover:shadow-lg"
          >
            <FaFacebook className="w-5 h-5" />
            Daftar dengan Facebook
          </button>
        </div>

        {/* Disclaimer dengan link */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          Dengan mendaftar, Anda menyetujui{" "}
          <Link
            href="/legal"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Ketentuan Layanan dan Kebijakan Privasi
          </Link>{" "}
          kami.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out ${
            animateOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-w-sm text-center space-y-4 transform transition-transform duration-300 ${
              animateOut ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Verifikasi Email
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Registrasi berhasil! Silakan cek email Anda untuk memverifikasi
              akun.
            </p>
            <button
              onClick={closeModal}
              className="mt-2 px-4 py-2 bg-[#2f567a] hover:bg-[#3a6b97] text-white rounded-lg font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
