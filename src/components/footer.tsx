"use client";

import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { MdMail, MdPhone } from "react-icons/md";
import Link from "next/link";

export default function Footer() {
  const socialIcons = [
    { icon: <FaFacebookF />, href: "#" },
    { icon: <FaInstagram />, href: "#" },
    { icon: <FaTwitter />, href: "#" },
    { icon: <FaLinkedin />, href: "#" },
    { icon: <FaYoutube />, href: "#" },
  ];

  return (
    <footer className="bg-[#2f567a] text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold">STAYFINDER</h2>
          <p className="mt-3 text-sm text-gray-200">
            Temukan hunian impianmu dengan mudah dan cepat.  
            Kami menyediakan pilihan properti terbaik untukmu.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Navigasi</h3>
          <ul className="space-y-2 text-sm">
            {["Beranda", "Properti", "Tentang Kami",].map((item, idx) => (
              <li key={idx}>
                <Link
                  href={
                    item === "Beranda"
                      ? "/"
                      : item === "Properti"
                      ? "/property"
                      : item === "Tentang Kami"
                      ? "/abaout-me"
                      : ""}
                  className="transition-colors duration-300 hover:text-[#7ba2c5]"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Kontak</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MdPhone size={16} /> +62 812 3456 7890
            </li>
            <li className="flex items-center gap-2">
              <MdMail size={16} /> support@stayfinder.com
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Ikuti Kami</h3>
          <div className="flex gap-4">
            {socialIcons.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="text-white transition duration-300 transform hover:text-[#7ba2c5] hover:scale-110"
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-500/30 text-center py-4 text-sm text-gray-200">
        © {new Date().getFullYear()} STAYFINDER. Semua hak dilindungi.
      </div>
    </footer>
  );
}
