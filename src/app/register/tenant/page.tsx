"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import Link from "next/link";
import { axios } from "@/lib/axios";

type RegisterTenantValues = {
  email: string;
  role: "TENANT";
  username?: string; 
};

const RegisterTenantSchema = Yup.object().shape({
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
});

export default function RegisterTenant() {
  const [showModal, setShowModal] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);

  const checkEmail = async (email: string) => {
    if (!email) return;
    try {
      const res = await axios.get(`/api/auth/check-email`, {
        params: { email },
      });
      setIsEmailAvailable(res.data.available);
      if (!res.data.available) {
        setMessage("Email sudah terdaftar");
      } else {
        setMessage(null);
      }
    } catch (error) {
      console.error("Error checking email:", error);
    }
  };

  const handleSubmit = async (values: RegisterTenantValues) => {
    setMessage(null);
    try {
      await axios.post(`/api/auth/register`, {
        username: values.username || "",
        email: values.email,
        role: "TENANT",
      });
      setShowModal(true);
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Terjadi kesalahan. Coba lagi.");
    }
  };
  
        
  const closeModal = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setShowModal(false);
      setAnimateOut(false);
      window.location.href = "/";
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
          initialValues={{ email: "", role: "TENANT" as const }} 
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
                  onBlur={(e: any) => checkEmail(e.target.value)}
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
                disabled={isSubmitting || isEmailAvailable === false}
                className="w-full py-3 rounded-xl text-white bg-[#2f567a] hover:bg-[#3a6b97] font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
          className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-500 ease-in-out bg-black/30 ${
            animateOut ? "opacity-0 backdrop-blur-none" : "opacity-100 backdrop-blur-md"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl max-w-sm text-center space-y-4 transform transition-all duration-500 ${
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
              className="mt-2 px-4 py-2 bg-[#2f567a] hover:bg-[#3a6b97] text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 