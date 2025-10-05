"use client";

import { useAuth } from "@/src/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  role?: "USER" | "TENANT";
  children: React.ReactNode;
};

export default function ProtectedPage({ role, children }: Props) {
  const { user, initialized } = useAuth();
  const router = useRouter();
//
useEffect(() => {
  if (!initialized) return;

  if (!user) {
    router.replace("/"); // belum login → ke home/login
  } else if (role && user.role !== role) {
    router.replace("/403"); // login tapi role salah
  }
}, [user, role, router, initialized]);

if (!initialized || !user) return null; // tunggu context siap

return <>{children}</>;
}
