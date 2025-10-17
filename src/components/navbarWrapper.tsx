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
    "/404",
    "/403",
    "/500",
    "/legal",
  ];

  const hideNavbar =
    noNavbarRoutes.includes(pathname) ||
    pathname.startsWith("/tenant/dashboard/properties/edit/");

  if (hideNavbar) return null;

  return <Navbar />;
}
