"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function TenantLanding() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleTouchStart = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setActiveButton(null), 150);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* ===== Navbar Custom ===== */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 transition-transform duration-200 active:scale-95 touch-manipulation"
          >
            <Image 
              src="/logo.png" 
              alt="StayFinder" 
              width={160} 
              height={35}
              className="w-32 sm:w-40 md:w-48"
              priority
            />
          </Link>

          {/* Menu - Improved Button */}
          <nav>
            <Link
              href="/"
              className="text-gray-700 font-semibold hover:text-[#2f567a] hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200 px-3 py-2 rounded-lg touch-manipulation border border-transparent hover:border-blue-200 hover:bg-blue-50 active:bg-blue-100 text-sm sm:text-base"
              onTouchStart={() => handleTouchStart('homepage')}
              onTouchEnd={handleTouchEnd}
            >
              <span className={`transition-all duration-200 ${
                activeButton === 'homepage' ? 'text-[#2f567a] font-bold hover:scale-105' : ''
              }`}>
                Homepage
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-200 text-blue-800 rounded-full mb-4">
              Terpercaya 2025
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              Daftar & Kelola{" "}
              <span className="text-[#2f567a]">Properti Anda</span> dengan Mudah
            </h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              Bergabunglah dengan platform StayFinder untuk mendapatkan
              visibilitas lebih banyak tenant dan manajemen properti yang lebih
              efisien.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link
                href="/register/tenant"
                className="px-5 sm:px-6 py-3 rounded-lg bg-gradient-to-r from-[#2f567a] to-[#3a6b97] text-white font-medium hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation shadow-lg hover:shadow-xl text-center text-sm sm:text-base"
                onTouchStart={() => handleTouchStart('register')}
                onTouchEnd={handleTouchEnd}
              >
                <span className={`transition-all duration-200 ${
                  activeButton === 'register' ? 'font-bold' : ''
                }`}>
                  Daftar Sekarang
                </span>
              </Link>
              <Link
                href="/login/tenant"
                className="px-5 sm:px-6 py-3 rounded-lg border border-[#2f567a] text-[#2f567a] font-medium hover:bg-[#d3e9fd] hover:scale-105 active:bg-blue-100 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation shadow-lg hover:shadow-xl text-center text-sm sm:text-base"
                onTouchStart={() => handleTouchStart('login')}
                onTouchEnd={handleTouchEnd}
              >
                <span className={`transition-all duration-200 ${
                  activeButton === 'login' ? 'font-bold' : ''
                }`}>
                  Login
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center order-first md:order-last"
          >
            <Image
              src="/hero-tenant.png"
              alt="Hero Tenant"
              width={580}
              height={450}
              priority
              className="drop-shadow-xl rounded-lg w-full max-w-md md:max-w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-14 text-gray-800"
        >
          Kenapa Bergabung di{" "}
          <span className="text-[#2f567a]">StayFinder?</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              title: "Manajemen Properti",
              desc: "Kelola semua properti Anda di satu tempat dengan dashboard modern.",
            },
            {
              title: "Meningkatkan Visibilitas",
              desc: "Dapatkan exposure lebih banyak tenant dan penyewa potensial.",
            },
            {
              title: "Transaksi Aman",
              desc: "Semua transaksi dan komunikasi dilakukan secara aman di platform kami.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white shadow-md rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer touch-manipulation active:scale-95"
              onTouchStart={() => handleTouchStart(`feature-${i}`)}
              onTouchEnd={handleTouchEnd}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeButton === `feature-${i}` 
                  ? 'bg-[#2f567a] scale-110' 
                  : 'bg-blue-100 group-hover:bg-[#2f567a]'
              }`}>
                <span className={`text-xl font-bold transition-all duration-300 ${
                  activeButton === `feature-${i}` 
                    ? 'text-white' 
                    : 'text-[#2f567a] group-hover:text-white'
                }`}>
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 sm:mb-3 text-[#2f567a]">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12 sm:mt-16"
        >
          <Link
            href="/register/tenant"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#2f567a] to-[#3a6b97] text-white font-medium hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation shadow-lg hover:shadow-xl text-sm sm:text-base"
            onTouchStart={() => handleTouchStart('cta')}
            onTouchEnd={handleTouchEnd}
          >
            <span className={`transition-all duration-200 ${
              activeButton === 'cta' ? 'font-bold' : ''
            }`}>
              Mulai Kelola Properti Anda Sekarang
            </span>
          </Link>
        </motion.div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-[#2f567a] text-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Logo + About */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">STAYFINDER</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              StayFinder membantu Anda mengelola properti lebih mudah, aman, dan
              efisien. Dapatkan lebih banyak tenant dengan platform terpercaya.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold mb-3 sm:mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/register/tenant", label: "Daftar Tenant" },
                { href: "/login/tenant", label: "Login" },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="hover:text-white transition-all duration-200 cursor-pointer touch-manipulation active:text-blue-200 block py-1"
                    onTouchStart={() => handleTouchStart(`footer-${index}`)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <span className={`transition-all duration-200 ${
                      activeButton === `footer-${index}` ? 'font-semibold underline' : ''
                    }`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="font-semibold mb-3 sm:mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              {['Facebook', 'Instagram', 'Twitter'].map((social, index) => (
                <Link 
                  key={index}
                  href="#" 
                  className="hover:text-white transition-all duration-200 cursor-pointer touch-manipulation active:text-blue-200 text-sm"
                  onTouchStart={() => handleTouchStart(`social-${index}`)}
                  onTouchEnd={handleTouchEnd}
                >
                  <span className={`transition-all duration-200 ${
                    activeButton === `social-${index}` ? 'font-semibold underline' : ''
                  }`}>
                    {social}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-blue-700 text-center py-4 text-sm text-gray-400">
          © {new Date().getFullYear()} StayFinder. All rights reserved.
        </div>
      </footer>
    </main>
  );
}