"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Properti", href: "/properti" },
    { name: "Daftar Properti Anda", href: "/tenant", special: true },
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
              link.special ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 rounded-full border text-sm font-medium transition-colors"
                  style={{
                    borderColor: "#2f567a",
                    color: "#2f567a",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#7ba2c5";
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
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: "#2f567a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#7ba2c5")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2f567a")}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* Desktop Action */}
          <div className="hidden md:flex items-center gap-3">
            <button
              className="px-5 py-2 rounded-full border text-sm font-medium transition-colors"
              style={{ borderColor: "#7ba2c5", color: "#2f567a" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4f8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Masuk
            </button>
            <button
              className="px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
              style={{ backgroundColor: "#2f567a", color: "white" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7ba2c5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2f567a")}
            >
              Daftar
            </button>
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

        {/* Mobile Menu with smooth transition */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-750 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100 mt-2 pb-4" : "max-h-0 opacity-0"
          } border-t border-gray-200`}
        >
          {navLinks.map((link) =>
            link.special ? (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{ border: "1px solid #2f567a", color: "#2f567a" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#7ba2c5";
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
                className="block px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: "#2f567a" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#7ba2c5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#2f567a")}
              >
                {link.name}
              </Link>
            )
          )}
          <div className="flex flex-col gap-2 mt-3 px-4">
            <button
              className="w-full px-4 py-2 rounded-full border text-sm font-medium transition-colors"
              style={{ borderColor: "#7ba2c5", color: "#2f567a" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4f8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Masuk
            </button>
            <button
              className="w-full px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
              style={{ backgroundColor: "#2f567a", color: "white" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7ba2c5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2f567a")}
            >
              Daftar
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
