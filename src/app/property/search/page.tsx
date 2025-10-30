"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import PropertyList from "@/components/properties/propertyList";
import Pagination from "@/components/ui/pagination";
import Footer from "@/components/footer";
import BookingFilter from "@/components/bokingFilters";

interface CatalogProperty {
  id: number;
  name: string;
  address?: string;
  category?: string;
  picture?: string;
  price?: number | null;
  availableRooms?: number;
}

export default function PropertySearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState<CatalogProperty[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const city = searchParams.get("city");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adultQty = searchParams.get("adultQty");
    const childQty = searchParams.get("childQty");
    const roomQty = searchParams.get("roomQty");

    if (city) {
      const criteria = {
        city,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        adultQty: adultQty ? parseInt(adultQty) : undefined,
        childQty: childQty ? parseInt(childQty) : undefined,
        roomQty: roomQty ? parseInt(roomQty) : undefined,
        page,
      };
      fetchSearchResults(criteria);
    } else {
      router.push("/property");
    }
  }, [searchParams, page]);

  const fetchSearchResults = async (criteria: any) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/booking/search`,
        criteria
      );
      setProperties(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAgain = async (criteria: any) => {
    const params = new URLSearchParams();
    if (criteria.city) params.set("city", criteria.city);
    if (criteria.checkIn) params.set("checkIn", criteria.checkIn);
    if (criteria.checkOut) params.set("checkOut", criteria.checkOut);
    if (criteria.adultQty) params.set("adultQty", criteria.adultQty.toString());
    if (criteria.childQty) params.set("childQty", criteria.childQty.toString());
    if (criteria.roomQty) params.set("roomQty", criteria.roomQty.toString());

    router.push(`/property/search?${params.toString()}`);
  };
    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f567a] mx-auto mb-4"></div>
          <p className="text-gray-600">Mencari properti...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
          Hasil Pencarian
        </h1>

        <div className="mb-6">
          <p className="text-gray-600">
            Menampilkan hasil untuk: {searchParams.get("city")}
            {searchParams.get("checkIn") && `, Check-in: ${searchParams.get("checkIn")}`}
            {searchParams.get("checkOut") && `, Check-out: ${searchParams.get("checkOut")}`}
            {searchParams.get("adultQty") && `, ${searchParams.get("adultQty")} Dewasa`}
            {searchParams.get("childQty") && `, ${searchParams.get("childQty")} Anak`}
            {searchParams.get("roomQty") && `, ${searchParams.get("roomQty")} Kamar`}
          </p>
        </div>

        <div className="mb-6">
          <BookingFilter
            onSearch={handleSearchAgain}
            initialCriteria={{
              city: searchParams.get("city") || undefined,
              checkIn: searchParams.get("checkIn") || undefined,
              checkOut: searchParams.get("checkOut") || undefined,
              adultQty: searchParams.get("adultQty") ? parseInt(searchParams.get("adultQty")!) : undefined,
              childQty: searchParams.get("childQty") ? parseInt(searchParams.get("childQty")!) : undefined,
              roomQty: searchParams.get("roomQty") ? parseInt(searchParams.get("roomQty")!) : undefined,
            }}
            noHeroMargin={true}
          />
        </div>

        {properties.length > 0 ? (
          <>
            <PropertyList properties={properties} />
            <Pagination
              currentPage={page}
              totalItems={total}
              itemsPerPage={9}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Tidak ada properti yang ditemukan untuk kriteria pencarian Anda.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-[#2f567a] text-white px-6 py-2 rounded-lg hover:bg-[#3a6b97] transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
