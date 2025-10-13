"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import PropertyFilters from "@/components/properties/propertyFilters";
import PropertyList from "@/components/properties/propertyList";
import Pagination from "@/components/ui/pagination";
import Footer from "@/components/footer";

interface CatalogProperty {
  id: number;
  name: string;
  address?: string;
  category?: string;
  picture?: string;
  price?: number | null;
  availableRooms?: number;
  rating?: number;
  reviewCount?: number;
}

export default function PropertyCatalogPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<CatalogProperty[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    sort: "name_asc",
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties`,
        {
          params: {
            search: filters.name || undefined,
            category: filters.category || undefined,
            sortBy: filters.sort.split('_')[0],
            order: filters.sort.split('_')[1],
            page,
            limit: 9,
          },
        }
      );
      setProperties(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProperties();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters.name, filters.category, filters.sort]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f567a] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat properti...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
          Property Catalog
        </h1>

        <PropertyFilters filters={filters} setFilters={setFilters} />

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
              Tidak ada properti yang tersedia.
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
