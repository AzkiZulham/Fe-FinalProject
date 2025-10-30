"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function TenantLanding() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* ===== Navbar Custom ===== */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="StayFinder" width={180} height={40} />
          </Link>

          {/* Menu */}
          <nav>
            <Link
              href="/"
              className="text-gray-700 font-semibold hover:text-[#2f567a] transition"
            >
              Homepage
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 flex-1">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-200 text-blue-800 rounded-full mb-4">
              Terpercaya 2025
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Daftar & Kelola{" "}
              <span className="text-[#2f567a]">Properti Anda</span> dengan Mudah
            </h1>
            <p className="text-gray-600 mb-8">
              Bergabunglah dengan platform StayFinder untuk mendapatkan
              visibilitas lebih banyak tenant dan manajemen properti yang lebih
              efisien.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register/tenant"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#2f567a] to-[#3a6b97] text-white font-medium hover:scale-105 transition-transform"
              >
                Daftar Sekarang
              </Link>
              <Link
                href="/login/tenant"
                className="px-6 py-3 rounded-lg border border-[#2f567a] text-[#2f567a] font-medium hover:bg-[#e9f1f8] transition"
              >
                Login
              </Link>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <Image
              src="/hero-tenant.png"
              alt="Hero Tenant"
              width={580}
              height={450}
              priority
              className="drop-shadow-xl rounded-lg"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-14 text-gray-800"
        >
          Kenapa Bergabung di{" "}
          <span className="text-[#2f567a]">StayFinder?</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
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
              className="bg-white shadow-md rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-[#2f567a] text-xl font-bold">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[#2f567a]">
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
          className="text-center mt-16"
        >
          <Link
            href="/register/tenant"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#2f567a] to-[#3a6b97] text-white font-medium hover:scale-105 transition-transform"
          >
            Mulai Kelola Properti Anda Sekarang
          </Link>
        </motion.div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-[#2f567a] text-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
          {/* Logo + About */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4">STAYFINDER</h3>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">
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
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/register/tenant"
                  className="hover:text-white transition"
                >
                  Daftar Tenant
                </Link>
              </li>
              <li>
                <Link
                  href="/login/tenant"
                  className="hover:text-white transition"
                >
                  Login
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white transition">
                Facebook
              </Link>
              <Link href="#" className="hover:text-white transition">
                Instagram
              </Link>
              <Link href="#" className="hover:text-white transition">
                Twitter
              </Link>
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
