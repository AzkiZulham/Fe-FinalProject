"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  available?: boolean;
}

const properties: Property[] = [
  {
    id: 1,
    title: "Cozy Apartment di Pusat Kota",
    location: "Jakarta Pusat",
    price: "Rp 1.200.000/malam",
    imageUrl: "/images/apartment.jpg",
    available: true,
  },
  {
    id: 2,
    title: "Villa Tepi Pantai dengan Pemandangan Indah",
    location: "Canggu, Bali",
    price: "Rp 3.750.000/malam",
    imageUrl: "/images/villa.jpg",
  },
  {
    id: 3,
    title: "Loft Modern di Area Trendi",
    location: "Bandung",
    price: "Rp 1.800.000/malam",
    imageUrl: "/images/loft.jpg",
  },
  {
    id: 4,
    title: "Homestay Budaya Jawa",
    location: "Yogyakarta",
    price: "Rp 900.000/malam",
    imageUrl: "/images/homestay.jpg",
    available: true,
  },
];

function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:scale-[1.02] transition">
      <div className="relative h-48 w-full">
        <Image
          src={property.imageUrl}
          alt={property.title}
          fill
          className="object-cover"
        />
        {property.available && (
          <span className="absolute top-3 right-3 bg-[#2f567a] text-white text-xs font-semibold px-2 py-1 rounded-full hover:bg-[#7ba2c5] transition">
            Tersedia
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col h-32">
        <h3 className="text-lg font-semibold line-clamp-2">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500">{property.location}</p>
        <p className="mt-auto text-[#2f567a] font-bold hover:text-[#7ba2c5] transition">
          {property.price}
        </p>
      </div>
    </div>
  );
}

export default function PropertyList() {
  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Properti Unggulan</h2>

      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Mobile: Swiper */}
      <div className="md:hidden">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.2}
          navigation
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
        >
          {properties.map((property) => (
            <SwiperSlide key={property.id}>
              <PropertyCard property={property} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
