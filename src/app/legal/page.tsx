"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-12 space-y-10">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Kebijakan Privasi & Syarat Ketentuan
            </h2>
          </div>

          {/* Privacy Policy */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-[#3a6b97] border-b-2 border-blue-200 dark:border-blue-800 pb-2">
              Kebijakan Privasi
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Stayfinder menghargai privasi Anda dan berkomitmen untuk melindungi
              informasi pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana
              kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat
              Anda menggunakan aplikasi kami.
            </p>
            <div className="space-y-4 pl-4 border-l-4 border-blue-100 dark:border-blue-700">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informasi yang Kami Kumpulkan
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Kami mengumpulkan informasi yang Anda berikan secara langsung
                  kepada kami, seperti nama, alamat email, nomor telepon, dan
                  informasi pembayaran. Kami juga mengumpulkan informasi secara
                  otomatis saat Anda menggunakan aplikasi kami, seperti alamat IP,
                  jenis perangkat, dan data penggunaan.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bagaimana Kami Menggunakan Informasi Anda
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Kami menggunakan informasi Anda untuk menyediakan dan
                  meningkatkan layanan kami, memproses transaksi, berkomunikasi
                  dengan Anda, dan mempersonalisasi pengalaman Anda. Kami juga
                  dapat menggunakan informasi Anda untuk tujuan pemasaran dan
                  promosi.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bagaimana Kami Melindungi Informasi Anda
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Kami mengambil langkah-langkah keamanan yang wajar untuk
                  melindungi informasi Anda dari akses, penggunaan, atau
                  pengungkapan yang tidak sah. Namun, tidak ada metode transmisi
                  melalui internet atau penyimpanan elektronik yang sepenuhnya
                  aman.
                </p>
              </div>
            </div>
          </section>

          {/* Terms */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-[#3a6b97] border-b-2 border-blue-200 dark:border-blue-800 pb-2">
              Syarat & Ketentuan
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Dengan menggunakan aplikasi Stayfinder, Anda setuju untuk terikat
              oleh syarat dan ketentuan ini. Jika Anda tidak setuju, Anda tidak
              boleh menggunakan aplikasi kami.
            </p>
            <div className="space-y-4 pl-4 border-l-4 border-blue-100 dark:border-blue-700">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Penggunaan Aplikasi
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Anda setuju untuk menggunakan aplikasi Stayfinder hanya untuk
                  tujuan yang sah dan sesuai dengan syarat dan ketentuan ini. Anda
                  tidak boleh menggunakan aplikasi kami untuk tujuan yang melanggar
                  hukum atau merugikan orang lain.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tanggung Jawab
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Stayfinder tidak bertanggung jawab atas kerugian atau kerusakan
                  yang timbul dari penggunaan aplikasi kami. Anda bertanggung jawab
                  penuh atas penggunaan aplikasi Anda.
                </p>
              </div>
            </div>
          </section>

          {/* Perubahan */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-[#3a6b97] text-center dark:text-white">
              Perubahan pada Kebijakan
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Kami dapat mengubah kebijakan privasi dan syarat &amp; ketentuan ini
              dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan
              signifikan. Penggunaan berkelanjutan Anda atas aplikasi kami setelah
              perubahan tersebut merupakan persetujuan Anda terhadap perubahan
              tersebut.
            </p>
          </section>

          {/* Back button */}
          <div className="pt-6 flex justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#2f567a] hover:bg-[#3a6b97] text-white font-semibold py-3 px-6 rounded-full shadow-md transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
