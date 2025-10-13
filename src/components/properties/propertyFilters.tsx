"use client";

interface Props {
  filters: { name: string; category: string; sort: string };
  setFilters: (value: any) => void;
}

export default function PropertyFilters({ filters, setFilters }: Props) {
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
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f567a] focus:border-transparent"
          >
            <option value="">Semua Kategori</option>
            <option value="hotel">Hotel</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="resort">Resort</option>
            <option value="homestay">Homestay</option>
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
