"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const noNavbarRoutes = [
    "/login/tenant",
    "/login/user",
    "/register/tenant",
    "/register/user",
    "/reset-password",
    "/verify-password",
    "/forgot-password",
    "/tenant/dashboard",
    "/tenant",
    "/tenant/dashboard/transactions",
    "/tenant/dashboard/properties",
    "/tenant/dashboard/properties/add",
    "/tenant/dashboard/categories",
    "/tenant/dashboard/rooms",
    "/tenant/dashboard/rooms/create",
    "/tenant/dashboard/sales",
    "/tenant/dashboard/property-report",
    "/404",
    "/403",
    "/500",
    "/legal",
  ];

  // Tambahkan pattern untuk halaman edit room dinamis
  const hideNavbar =
    noNavbarRoutes.includes(pathname) ||
    pathname.startsWith("/tenant/dashboard/properties/edit/") ||
    pathname.startsWith("/tenant/dashboard/rooms/edit/"); // ✅ ini tambahan penting

  if (hideNavbar) return null;

  return <Navbar />;
}
