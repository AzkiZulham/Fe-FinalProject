"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface CatalogProperty {
  id: number;
  name: string;
  address?: string;
  picture?: string;
  price?: number | null;
  availableRooms?: number;
  rating?: number;
  reviewCount?: number;
  totalTransactions?: number;
}

type LocationData = {
  lat: number;
  lng: number;
  city: string;
};

interface Props {
  properties?: CatalogProperty[];
  limit?: number;
  showSection?: boolean;
  location?: LocationData | null;
}

function PropertyCard({ property }: { property: CatalogProperty }) {
  const isAvailable =
    property.price !== null &&
    property.price !== undefined &&
    (property.availableRooms || 0) > 0;

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={property.picture || "/images/apartment.jpg"}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isAvailable
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {isAvailable ? "Tersedia" : "Penuh"}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property.name}
            </h3>
            {property.rating && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {property.totalTransactions && (
                  <div className="text-xs text-gray-500 mt-1">
                    Dipesan {property.totalTransactions} kali
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.address || "Lokasi tidak tersedia"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Mulai dari
              </span>
              <span className="text-xl font-bold text-[#2f567a]">
                Rp {property.price?.toLocaleString("id-ID") || "N/A"}
              </span>
              <span className="text-xs text-gray-500">per malam</span>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">
                {property.availableRooms || 0} kamar tersedia
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      <div className="h-8 bg-gray-200 rounded-lg w-64 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse"
          >
            <div className="w-full h-48 bg-gray-200"></div>
            <div className="p-5">
              <div className="h-5 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="h-4 bg-gray-200 rounded mb-1 w-20"></div>
                  <div className="h-6 bg-gray-200 rounded mb-1 w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PropertyList({
  properties: initialProperties = [],
  limit,
  showSection = true,
  location,
}: Props) {
  const [properties, setProperties] =
    useState<CatalogProperty[]>(initialProperties);
  const [loading, setLoading] = useState(initialProperties.length === 0);

  useEffect(() => {
    if (initialProperties.length === 0) {
      const fetchProperties = async () => {
        try {
          setLoading(true);
          const endpoint = location
            ? "/api/properties/nearby"
            : "/api/properties/top";
          const params: any = { limit: limit || 6 };
          if (location) {
            params.lat = location.lat;
            params.lng = location.lng;
            params.radius = 50;
          }
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
            { params }
          );
          setProperties(res.data.data || []);
        } catch (error) {
          console.error("Error fetching properties:", error);
          setProperties([]);
        } finally {
          setLoading(false);
        }
      };

      fetchProperties();
    } else {
      setLoading(false);
    }
  }, [initialProperties.length, limit, location]);

  if (loading) {
    return showSection ? <LoadingSkeleton /> : <LoadingSkeleton />;
  }

  const content = (
    <>
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada properti ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah filter pencarian atau periksa kembali kriteria Anda.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </>
  );

  if (!showSection) {
    return content;
  }

  const sectionTitle = "Properti Terpopuler";
  const sectionDescription =
    "Penginapan dengan jumlah pemesanan terbanyak minggu ini";

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {sectionTitle}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{sectionDescription}</p>
      </div>
      {content}
      <div className="text-center mt-15">
        <button
          onClick={() => (window.location.href = "/property")}
          className="px-6 py-3 bg-[#2f567a] text-white rounded-full hover:bg-[#7ba2c5] transition-colors"
        >
          Lihat Semua Properti
        </button>
      </div>
    </section>
  );
}
