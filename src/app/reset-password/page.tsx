"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .required("Password wajib diisi"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Konfirmasi password tidak sama")
    .required("Konfirmasi password wajib diisi"),
});

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return { level: "Lemah", color: "bg-red-500", width: "w-1/4" };
  if (score === 3)
    return { level: "Sedang", color: "bg-yellow-500", width: "w-2/4" };
  if (score === 4)
    return { level: "Kuat", color: "bg-blue-500", width: "w-3/4" };
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

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tokenChecked, setTokenChecked] = useState<
    "checking" | "valid" | "invalid"
  >("checking");

  // ==== Check token validity ====
  useEffect(() => {
    const checkToken = async () => {
      if (!token) return setTokenChecked("invalid");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-reset-token?token=${token}`
        );
        const data = await res.json();
        setTokenChecked(res.ok && data.valid ? "valid" : "invalid");
      } catch (err) {
        console.error("Token check failed:", err);
        setTokenChecked("invalid");
      }
    };
    checkToken();
  }, [token]);

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-md text-center">
          <h1 className="text-3xl font-semibold text-[#2f567a] mb-4">
            Reset Password gagal!
          </h1>
          <p className="text-sm text-gray-500">
            Silakan ulangi proses reset password melalui email.
          </p>
        </div>
      </main>
    );
  }

  if (tokenChecked === "checking") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-md text-center">
          <h1 className="text-2xl font-semibold text-[#2f567a] mb-4">
            Memverifikasi token...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f567a] mx-auto"></div>
        </div>
      </main>
    );
  }

  if (tokenChecked === "invalid") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-md text-center">
          <h1 className="text-3xl font-semibold text-[#2f567a] mb-4">
            Token tidak valid!
          </h1>
          <p className="text-sm text-gray-500">
            Token mungkin sudah kadaluarsa atau tidak valid. Silakan ulangi
            proses reset password.
          </p>
        </div>
      </main>
    );
  }

  const strength = getPasswordStrength(passwordInput);
  const checks = getPasswordChecks(passwordInput);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-4xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-[#2f567a] mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-12">
          Masukan password baru anda
        </p>

        {!success ? (
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={ResetPasswordSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      token,
                      password: values.password,
                    }),
                  }
                );

                if (res.ok) {
                  const data = await res.json();
                  setSuccess(true);
                  if (data.user?.role === "TENANT") {
                    setTimeout(() => router.push("/login/tenant"), 2000);
                  } else {
                    setTimeout(() => router.push("/login/user"), 2000);
                  }
                } else {
                  alert("Gagal reset password, coba lagi.");
                }
              } catch (err) {
                console.error(err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Password Baru */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      onKeyUp={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPasswordInput(e.target.value)
                      }
                      placeholder="Masukan password baru"
                      className="mt-2 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />

                  {/* Strength Bar */}
                  {passwordInput && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${strength.color} ${strength.width}`}
                        ></div>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        Kekuatan:{" "}
                        <span className="font-medium">{strength.level}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Checklist */}
                {passwordInput && (
                  <ul className="text-xs text-gray-600 space-y-1 mt-2">
                    {checks.map((c, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 ${
                          c.valid ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.valid ? "bg-green-600" : "bg-gray-300"
                          }`}
                        ></span>
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Konfirmasi Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Field
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Konfirmasi password baru"
                      className="mt-2 mb-6 w-full px-4 py-3 rounded-4xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-[#2f567a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mb-7 rounded-4xl bg-[#2f567a] px-4 py-2 font-medium text-white shadow hover:bg-[#23425e] transition disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <p className="text-green-600 text-center font-medium">
            Password berhasil direset! Mengalihkan ke login...
          </p>
        )}
      </div>
    </main>
  );
}
