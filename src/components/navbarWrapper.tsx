"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const noNavbarRoutes = [
    "/reset-password",
    "/verify-password",
    "/forgot-password",
    "/about-me",
    "/404",
    "/403",
    "/500",
    "/legal",
  ];

  const hideNavbar =
    noNavbarRoutes.includes(pathname) ||
    pathname.startsWith("/tenant/dashboard") ||
    pathname.startsWith("/tenant") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/login");

  if (hideNavbar) return null;

  return <Navbar />;
}
