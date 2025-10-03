"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const noNavbarRoutes = [
    "/login/tenant", 
    "/login/user" ,
    "/register/tenant", 
    "/register/user" ,
    "/reset-password", 
    "/verify-password", 
    "/forgot-password",
    "/tenant/dashboard",
    "/tenant", 
    "/404" ,
    "/403",
    "/404",
    "/500",
    "/legal"
  ];

  if (noNavbarRoutes.includes(pathname)) return null;

  return <Navbar />;
}
