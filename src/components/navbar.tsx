"use client";

import { useState } from "react";
import { Menu, X, LogOut, Home, User, ShoppingBag, LayoutDashboard, Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role || "guest";

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

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setActiveItem(null);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setMenuOpen(false);
    setActiveItem(null);
  };

  const handleTouchStart = (itemName: string) => {
    setActiveItem(itemName);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setActiveItem(null), 150);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 transition-transform duration-200 active:scale-95"
          >
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
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            {navLinks.map((link) =>
              link.highlight ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-5 py-2.5 rounded-full border-2 text-sm font-semibold transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95"
                  style={{ 
                    borderColor: "#2f567a", 
                    color: "#2f567a",
                    backgroundColor: "transparent"
                  }}
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
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer hover:bg-blue-100 hover:shadow-md hover:scale-105 active:scale-95 group border border-transparent hover:border-blue-200"
                  style={{ color: "#2f567a" }}
                >
                  <span className="transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-700">
                    {link.icon}
                  </span>
                  <span className="group-hover:text-blue-700 group-hover:font-semibold transition-all duration-300">
                    {link.name}
                  </span>
                </Link>
              )
            )}

            {/* Logout button untuk user yang login */}
            {role !== "guest" && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 cursor-pointer hover:bg-red-100 hover:text-red-700 hover:border-red-300 hover:shadow-md hover:scale-105 active:scale-95 border-red-200"
                style={{ 
                  borderColor: "#7ba2c5", 
                  color: "#2f567a" 
                }}
              >
                <LogOut size={16} className="hover:scale-110 transition-transform" />
                <span className="hover:font-semibold transition-all">Logout</span>
              </button>
            )}

            {/* Tombol masuk/daftar untuk guest */}
            {role === "guest" && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/login/user')}
                  className="px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-300 cursor-pointer hover:bg-blue-50 hover:shadow-md hover:scale-105 active:scale-95 hover:border-blue-300 hover:text-blue-700"
                  style={{ 
                    borderColor: "#7ba2c5", 
                    color: "#2f567a" 
                  }}
                >
                  <span className="hover:font-semibold transition-all">Masuk</span>
                </button>
                <button
                  onClick={() => router.push('/register/user')}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: "#2f567a", 
                    color: "white" 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1e3a5c";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2f567a";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <span className="hover:font-bold transition-all">Daftar</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-3 rounded-lg transition-all duration-200 active:scale-95 active:bg-blue-200 touch-manipulation"
            aria-label="Toggle menu"
            style={{ color: "#2f567a" }}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu - OPTIMIZED FOR TOUCH */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-gray-200 ${
            menuOpen 
              ? "max-h-96 opacity-100 shadow-inner" 
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-2 space-y-1">
            {navLinks.map((link) =>
              link.highlight ? (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.href)}
                  onTouchStart={() => handleTouchStart(link.name)}
                  onTouchEnd={handleTouchEnd}
                  className={`block w-full text-left px-6 py-4 text-sm font-semibold transition-colors duration-150 active:scale-95 touch-manipulation mx-2 rounded-xl ${
                    activeItem === link.name 
                      ? 'bg-blue-100 scale-95 border border-blue-300' 
                      : 'bg-transparent'
                  }`}
                  style={{ 
                    borderColor: "#2f567a", 
                    color: "#2f567a",
                  }}
                >
                  {link.name}
                </button>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.href)}
                  onTouchStart={() => handleTouchStart(link.name)}
                  onTouchEnd={handleTouchEnd}
                  className={`flex items-center gap-4 w-full px-6 py-4 text-sm font-medium transition-colors duration-150 active:scale-95 touch-manipulation mx-2 rounded-xl ${
                    activeItem === link.name 
                      ? 'bg-blue-100 scale-95 border border-blue-200' 
                      : 'bg-transparent'
                  }`}
                  style={{ color: "#2f567a" }}
                >
                  <span className={`transition-transform duration-150 ${
                    activeItem === link.name ? 'scale-110 text-blue-700' : ''
                  }`}>
                    {link.icon}
                  </span>
                  <span className={`transition-all duration-150 ${
                    activeItem === link.name ? 'text-blue-700 font-semibold' : ''
                  }`}>
                    {link.name}
                  </span>
                </button>
              )
            )}

            {/* Logout untuk user login */}
            {role !== "guest" ? (
              <button
                onClick={handleLogout}
                onTouchStart={() => handleTouchStart('logout')}
                onTouchEnd={handleTouchEnd}
                className={`flex items-center gap-4 w-full px-6 py-4 text-sm font-medium transition-colors duration-150 active:scale-95 touch-manipulation mx-2 rounded-xl mt-2 ${
                  activeItem === 'logout' 
                    ? 'bg-red-100 scale-95 border border-red-200' 
                    : 'bg-transparent'
                }`}
                style={{ color: "#2f567a" }}
              >
                <LogOut size={16} className={activeItem === 'logout' ? 'text-red-700' : ''} />
                <span className={activeItem === 'logout' ? 'text-red-700 font-semibold' : ''}>
                  Logout
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-3 mt-3 px-4">
                <button
                  onClick={() => handleNavigation('/login/user')}
                  onTouchStart={() => handleTouchStart('masuk')}
                  onTouchEnd={handleTouchEnd}
                  className={`w-full px-6 py-4 rounded-full border text-sm font-medium transition-colors duration-150 active:scale-95 touch-manipulation ${
                    activeItem === 'masuk' 
                      ? 'bg-blue-50 scale-95 border-blue-300' 
                      : 'border-gray-300'
                  }`}
                  style={{ color: "#2f567a" }}
                >
                  <span className={activeItem === 'masuk' ? 'font-semibold text-blue-700' : ''}>
                    Masuk
                  </span>
                </button>
                <button
                  onClick={() => handleNavigation('/register/user')}
                  onTouchStart={() => handleTouchStart('daftar')}
                  onTouchEnd={handleTouchEnd}
                  className={`w-full px-6 py-4 rounded-full text-sm font-semibold transition-all duration-150 active:scale-95 touch-manipulation ${
                    activeItem === 'daftar' 
                      ? 'bg-blue-800 scale-95 shadow-lg' 
                      : 'shadow-sm'
                  }`}
                  style={{ 
                    backgroundColor: activeItem === 'daftar' ? "#1e3a5c" : "#2f567a", 
                    color: "white" 
                  }}
                >
                  <span className={activeItem === 'daftar' ? 'font-bold' : ''}>
                    Daftar
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}