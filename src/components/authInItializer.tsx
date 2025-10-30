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

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const tokenFromUrl = searchParams.get("token");

    const processJWT = (token: string) => {
      try {
        const payload = jwtDecode<JWTPayload>(token);
        const now = Date.now() / 1000;

        if (!payload.exp || payload.exp > now) {
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

          if (
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/verify-password"
          ) {
            if (payload.role === "TENANT") router.replace("/tenant/dashboard");
            else router.replace("/");
          }
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("JWT decode failed", err);
        localStorage.removeItem("token");
      }
    };

    if (tokenFromUrl) {
      const isJWT = tokenFromUrl.split(".").length === 3;
      const isHexToken = /^[a-f0-9]{64}$/.test(tokenFromUrl);

      if (isJWT) {
        processJWT(tokenFromUrl);
      } else if (pathname.includes("reset-password")) {
      } else if (pathname.includes("verify-password")) {
      } else if (isHexToken) {
        router.replace(`/reset-password?token=${tokenFromUrl}`);
      } else {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-password?token=${tokenFromUrl}`;
      }
    }

    setInitialized(true);
  }, [login, router, searchParams, pathname, initialized]);

  if (!initialized) return null;

  return <>{children}</>;
}
