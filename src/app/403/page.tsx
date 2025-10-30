"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Suspense } from "react";

export default function ForbiddenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 text-center">
      {/* Card container */}
      <div className="relative max-w-md w-full bg-white dark:bg-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-10 overflow-hidden">
        
        {/* Animated Background Circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-br from-[#2f567a]/30 to-[#3a6b97]/30 rounded-full animate-pulse-slow z-0"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-br from-[#3a6b97]/20 to-[#2f567a]/20 rounded-full animate-pulse-slow z-0"></div>

        {/* Card content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Icon with subtle bounce */}
          <div className="flex justify-center mb-6 animate-bounce-slow shadow-lg rounded-full p-4 bg-white/20 dark:bg-gray-700/20">
            <Lock className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>

          {/* Code & Title */}
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Access Denied
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>

          {/* Button with gradient and shadow */}
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-[#7ba2c5] to-[#2f567a] hover:from-[#2f567a] hover:to-[#7ba2c5] text-white font-semibold rounded-full shadow-lg transition-all transform hover:-translate-y-1"
          >
            Kembali ke Home
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
        © 2025 StayFinder. All rights reserved.
      </p>

      {/* Tailwind animation classes */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
      `}</style>
    </main>
    </Suspense>
  );
}
