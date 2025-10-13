"use client";

import { useState } from "react";
import { Menu, X, LogOut, Home, User, ShoppingBag, LayoutDashboard, Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext"; // ambil role & logout dari context

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role || "guest" || "USER" || "TENANT"; 

const navLinks =
  role === "USER"
    ? [
        { name: "Home", href: "/", icon: <Home size={18} /> },
        { name: "Properti", href: "/property", icon: <Building size={18} /> },
        { name: "Pesanan", href: "/user/orders", icon: <ShoppingBag size={18} /> },
        { name: "Profile", href: "/user/profile", icon: <User size={18} /> },
      ]
    : role === "TENANT"
    ? [
        { name: "Home", href: "/", icon: <Home size={18} /> },
        { name: "Properti", href: "/property", icon: <Building size={18} /> },
        { name: "Dashboard", href: "/tenant/dashboard", icon: <LayoutDashboard size={18} /> },
      ]
    : [
        { name: "Home", href: "/", icon: <Home size={18} /> },
        { name: "Properti", href: "/property", icon: <Building size={18} /> },
        {
          name: "Daftarkan Properti Anda",
          href: "/tenant",
          highlight: true,
        },
      ];


  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="StayFinder Logo"
              width={0}
              height={0}
              sizes="(max-width: 768px) 150px, 250px"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.highlight ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
                  style={{ borderColor: "#2f567a", color: "#2f567a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2f567a";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#2f567a";
                  }}
                >
                  {link.name}
                </Link>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
                  style={{ color: "#2f567a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#7ba2c5")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2f567a")}
                >
                  {link.icon}
                  {link.name}
                </Link>
              )
            )}

            {/* 🔹 Logout button kalau role !== guest */}
            {role !== "guest" && (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
                style={{ borderColor: "#7ba2c5", color: "#2f567a" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4f8")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <LogOut size={16} className="inline-block mr-1" />
                Logout
              </button>
            )}

            {/* Kalau guest → tombol masuk/daftar */}
            {role === "guest" && (
              <>
                <button
                  onClick={() => router.push('/login/user')}
                  className="px-5 py-2 rounded-full border text-sm font-medium transition-colors"
                  style={{ borderColor: "#7ba2c5", color: "#2f567a" }}
                >
                  Masuk
                </button>
                <button
                  onClick={() => router.push('/register/user')}
                  className="px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
                  style={{ backgroundColor: "#2f567a", color: "white" }}
                >
                  Daftar
                </button>
              </>
            )}
          </div>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
            style={{ color: "#2f567a" }}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100 mt-2 pb-4" : "max-h-0 opacity-0"
          } border-t border-gray-200`}
        >
          {navLinks.map((link) =>
            link.highlight ? (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-2 rounded-full text-sm font-medium transition-colors border mt-2"
                style={{ borderColor: "#2f567a", color: "#2f567a" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2f567a";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#2f567a";
                }}
              >
                {link.name}
              </Link>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: "#2f567a" }}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          )}

          {role !== "guest" ? (
            <button
              onClick={logout}
              className="w-full mt-3 px-4 py-2 rounded-full border text-sm font-medium transition-colors"
              style={{ borderColor: "#7ba2c5", color: "#2f567a" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4f8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut size={16} className="inline-block mr-1" />
              Logout
            </button>
          ) : (
            <div className="flex flex-col gap-2 mt-3 px-4">
              <button
                onClick={() => router.push('/login/user')}
                className="w-full px-4 py-2 rounded-full border text-sm font-medium"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push('/register/user')}
                className="w-full px-4 py-2 rounded-full text-sm font-medium shadow-sm text-white"
                style={{ backgroundColor: "#2f567a" }}
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
