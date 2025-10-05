"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      // Simpan token di localStorage
      localStorage.setItem("auth_token", token);

      // deteksi role dari URL
      const path = window.location.pathname.includes("tenant")
        ? "/tenant/dashboard"
        : "/";

      // redirect
      router.replace(path);
    } else {
      router.replace("/login?error=no_token");
    }
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-600 text-lg">Sedang memproses login...</p>
    </div>
  );
}
