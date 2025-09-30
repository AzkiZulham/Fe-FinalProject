"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

type Props = {
  children: ReactNode;
  role?: "user" | "tenant"; // opsional: kalau halaman khusus role
};

export default function ProtectedPage({ children, role }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // belum login → redirect home
      router.replace("/");
    } else if (!user.verified) {
      // belum verifikasi → redirect home
      router.replace("/");
    } else if (role && user.role !== role) {
      // role salah → redirect 403
      router.replace("/403");
    }
  }, [user, role, router]);

  if (!user || !user.verified || (role && user.role !== role)) {
    return null; // jangan render apapun sebelum cek selesai
  }

  return <>{children}</>;
}
