"use client";

import { ArrowLeft, Users, Target, Award, Heart, Star, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AboutContent() {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const stats = [
    { number: "1K+", label: "Properti Terdaftar", icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { number: "50+", label: "Kota Terjangkau", icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { number: "4.8", label: "Rating Rata-rata", icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { number: "100K+", label: "Pelanggan Puas", icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ];

  const values = [
    {
      icon: <Shield className="w-7 h-7 sm:w-8 sm:h-8" />,
      title: "Keamanan & Kepercayaan",
      description: "Kami memastikan setiap properti terverifikasi dan transaksi aman dengan sistem enkripsi terkini."
    },
    {
      icon: <Heart className="w-7 h-7 sm:w-8 sm:h-8" />,
      title: "Pengalaman Pelanggan",
      description: "Tim support kami siap membantu 24/7 untuk memastikan pengalaman menyewa yang menyenangkan."
    },
    {
      icon: <Award className="w-7 h-7 sm:w-8 sm:h-8" />,
      title: "Kualitas Terbaik",
      description: "Hanya properti berkualitas tinggi yang kami tampilkan, dari apartemen hingga villa mewah."
    },
  ];

  const handleTouchStart = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setActiveButton(null), 150);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Tentang{" "}
              <span className="bg-gradient-to-r from-[#2f567a] to-[#7ba2c5] bg-clip-text text-transparent">
                STAYFINDER
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-6 sm:mb-8 px-4">
              Platform penyewaan properti terpercaya yang menghubungkan pemilik properti
              dengan pencari hunian impian. Kami berkomitmen untuk memberikan pengalaman
              terbaik dalam menemukan tempat tinggal yang sempurna.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 dark:border-gray-700">
                <span className="text-[#2f567a] dark:text-[#7ba2c5] font-semibold text-sm sm:text-base">Didirikan 2025</span>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 dark:border-gray-700">
                <span className="text-[#2f567a] dark:text-[#7ba2c5] font-semibold text-sm sm:text-base">50+ Kota</span>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 dark:border-gray-700">
                <span className="text-[#2f567a] dark:text-[#7ba2c5] font-semibold text-sm sm:text-base">10K+ Properti</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group p-4 sm:p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer active:scale-95 touch-manipulation"
                onTouchStart={() => handleTouchStart(`stat-${index}`)}
                onTouchEnd={handleTouchEnd}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#2f567a]/10 dark:bg-[#7ba2c5]/10 rounded-full mb-3 sm:mb-4 transition-all duration-300 ${
                  activeButton === `stat-${index}` ? 'scale-110 bg-[#2f567a]/20' : 'group-hover:scale-110'
                }`}>
                  <div className="text-[#2f567a] dark:text-[#7ba2c5]">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#2f567a]/5 to-[#7ba2c5]/5 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Misi Kami
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Menjadikan penyewaan properti lebih mudah, transparan, dan terpercaya
                untuk semua orang di Indonesia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer active:scale-95 touch-manipulation"
                  onTouchStart={() => handleTouchStart(`value-${index}`)}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#2f567a]/10 dark:bg-[#7ba2c5]/10 rounded-full mb-4 sm:mb-6 transition-all duration-300 ${
                    activeButton === `value-${index}` ? 'scale-110 bg-[#2f567a]/20' : 'group-hover:scale-110'
                  }`}>
                    <div className="text-[#2f567a] dark:text-[#7ba2c5]">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#2f567a] to-[#7ba2c5]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Siap Memulai Perjalanan Anda?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Temukan properti impian Anda sekarang juga. Ribuan pilihan menunggu Anda!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link
              href="/property"
              className="w-full sm:w-auto bg-white text-[#2f567a] font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation text-center"
              onTouchStart={() => handleTouchStart('explore')}
              onTouchEnd={handleTouchEnd}
            >
              Jelajahi Properti
            </Link>
            <Link
              href="/tenant"
              className="w-full sm:w-auto border-2 border-white text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-white hover:text-[#2f567a] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation text-center"
              onTouchStart={() => handleTouchStart('register')}
              onTouchEnd={handleTouchEnd}
            >
              Daftarkan Properti Anda
            </Link>
          </div>
        </div>
      </section>

      {/* Back button */}
      <div className="py-6 sm:py-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#2f567a] hover:bg-[#3a6b97] text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all hover:shadow-lg active:scale-95 cursor-pointer touch-manipulation"
              onTouchStart={() => handleTouchStart('back')}
              onTouchEnd={handleTouchEnd}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}