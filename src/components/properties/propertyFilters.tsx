"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface PropertyCategory {
  id: number;
  category: string;
}

interface Props {
  filters: { name: string; category: string; sort: string };
  setFilters: (value: any) => void;
}

export default function PropertyFilters({ filters, setFilters }: Props) {
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/properties/dashboard/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [API_URL]);

  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari nama properti..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#2f567a] focus:border-transparent"
          />
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f567a] focus:border-transparent"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f567a] focus:border-transparent"
        >
          <option value="name_asc">Urutkan: Nama A-Z</option>
          <option value="name_desc">Urutkan: Nama Z-A</option>
          <option value="price_asc">Urutkan: Harga Rendah-Tinggi</option>
          <option value="price_desc">Urutkan: Harga Tinggi-Rendah</option>
        </select>
      </div>
    </div>
  );
}
