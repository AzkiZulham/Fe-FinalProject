"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
});

export default function ForgotPasswordClient() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  async function handleSubmit(values: { email: string }) {
    setServerMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerMessage(data.error || "Terjadi kesalahan. Coba lagi.");
        return;
      }

      setServerMessage(
        "Instruksi reset password telah dikirim ke email Anda."
      );
    } catch {
      setServerMessage("Terjadi kesalahan jaringan. Coba lagi.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-6 sm:p-8">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#2f567a]">Lupa Password</h1>
          <p className="text-sm text-gray-500 mt-2">
            Masukkan email Anda untuk menerima link reset password.
          </p>
        </div>

        {/* Form */}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await handleSubmit(values);
            setSubmitting(false);
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
                disabled={isSubmitting}
                className="w-full bg-[#2f567a] text-white px-4 py-3 rounded-4xl font-semibold hover:bg-[#3a6b97] transition disabled:opacity-60"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
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
    </main>
  );
}
