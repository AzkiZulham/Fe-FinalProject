"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth } from "../context/authContext";
import { jwtDecode } from "jwt-decode";

type JWTPayload = {
  id: string;
  role: "USER" | "TENANT";
  email?: string;
  verified?: boolean;
  exp?: number;
};

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const tokenFromUrl = searchParams.get("token");
    const tokenFromStorage = localStorage.getItem("token");

    const processJWT = (token: string) => {
      try {
        const payload = jwtDecode<JWTPayload>(token);
        const now = Date.now() / 1000;

        if (!payload.exp || payload.exp > now) {
          // Set user di context + simpan token
          login(
            {
              id: payload.id,
              role: payload.role,
              verified: payload.verified ?? true,
              email: payload.email || "",
            },
            token
          );
          localStorage.setItem("token", token);

          // Redirect sesuai role jika sedang di halaman login / root
          if (pathname === "/" || pathname === "/login" || pathname === "/verify-password") {
            if (payload.role === "TENANT") router.replace("/tenant/dashboard");
            else router.replace("/"); // USER
          }
        } else {
          // Token expired → bersihkan storage
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("JWT decode failed", err);
        localStorage.removeItem("token");
      }
    };

    if (tokenFromUrl) {
      const isJWT = tokenFromUrl.split(".").length === 3;
      if (isJWT) {
        processJWT(tokenFromUrl);
      } else {
        // Token verify-password
        localStorage.setItem("verifyToken", tokenFromUrl);
        if (pathname !== "/verify-password") {
          router.replace("/verify-password");
        }
      }
    } else if (tokenFromStorage) {
      processJWT(tokenFromStorage);
    }

    setInitialized(true);
  }, [login, router, searchParams, pathname, initialized]);

  if (!initialized) return null;

  return <>{children}</>;
}
