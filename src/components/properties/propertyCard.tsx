import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

interface CatalogProperty {
  id: number;
  name: string;
  address?: string;
  picture?: string;
  price?: number | null;
  availableRooms?: number;
  rating?: number;
  reviewCount?: number;
}

export default function PropertyCard({ property }: { property: CatalogProperty }) {
  const isAvailable = property.price !== null && property.price !== undefined && (property.availableRooms || 0) > 0;

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
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isAvailable
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}>
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
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{property.rating}</span>
                {property.reviewCount && (
                  <span className="text-gray-400">({property.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.address || "Lokasi tidak tersedia"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Mulai dari</span>
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
