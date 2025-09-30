"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";

// Schema validasi
const ResendSchema = Yup.object().shape({
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
});

export default function ResendVerificationPage() {
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#eaf3fc] dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-4xl p-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-bold  text-[#2f567a] dark:text-white">
            Kirim Ulang Email Verifikasi
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-400">
          Silahkan masukkan email Anda <br /> untuk menerima link verifikasi baru.
          </p>
        </div>

        {/* Form */}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={ResendSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            setSuccessMsg("");
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(values),
                }
              );

              if (!res.ok) {
                const err = await res.json();
                throw new Error(
                  err.message || "Gagal mengirim email verifikasi"
                );
              }

              setSuccessMsg(
                "Email verifikasi berhasil dikirim. Silakan cek inbox Anda."
              );
            } catch (err: unknown) {
              if (err instanceof Error) {
                setError(err.message);
              } else {
                setError("Terjadi kesalahan yang tidak diketahui");
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {/* Input Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  className="mt-2 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Error & Success Message */}
              {error && (
                <div className="text-sm text-red-500 font-medium">{error}</div>
              )}
              {successMsg && (
                <div className="text-sm text-green-600 font-medium">
                  {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-4xl bg-[#2f567a] hover:bg-[#3a6b97] text-white font-semibold shadow-md transition-all"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Ulang Email"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </main>
  );
}
