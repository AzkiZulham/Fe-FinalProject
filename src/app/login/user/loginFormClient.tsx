"use client";

import LoginForm from "../../../components/loginForm";
import { useSearchParams } from "next/navigation";

export default function LoginFormClient({ role = "USER", redirectOnSuccess = "/user/profile" }) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <>
      {error === "email_registered_with_different_role" && (
        <p className="text-red-600 text-center mb-4">
          Email ini sudah terdaftar dengan role berbeda. Silakan masuk sesuai role akunmu.
        </p>
      )}

      <LoginForm role={role as "USER" | "TENANT"} redirectOnSuccess={redirectOnSuccess} />
    </>
  );
}
