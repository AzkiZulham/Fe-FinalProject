"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import LoginForm from "../../../components/loginForm";

export default function LoginFormClient({
  role = "TENANT",
  redirectOnSuccess = "/tenant/dashboard",
}) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) return;

    const timeout = setTimeout(() => {
      if (error === "email_registered_with_different_role") {
        toast.error("Email ini sudah terdaftar dengan role berbeda. Silakan login sesuai role akunmu.");
      } else if (error === "email_registered") {
        toast.error("Email ini sudah terdaftar. Silakan login dengan akun yang sama.");
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto">
      <LoginForm role={role as "USER" | "TENANT"} redirectOnSuccess={redirectOnSuccess} />
    </div>
  );
}
