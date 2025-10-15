"use client";

import { useState } from "react";
import Select from "react-select";
import { ChevronDown, MapPin, Calendar, Users, Search } from "lucide-react";

type CityOption = { value: string; label: string; lat: number; lng: number };

const cityOptions: CityOption[] = [
  { value: "jakarta", label: "Jakarta", lat: -6.2, lng: 106.8 },
  { value: "bandung", label: "Bandung", lat: -6.9, lng: 107.6 },
  { value: "bali", label: "Bali", lat: -8.65, lng: 115.2 },
  { value: "surabaya", label: "Surabaya", lat: -7.25, lng: 112.7 },
  { value: "yogyakarta", label: "Yogyakarta", lat: -7.8, lng: 110.36 },
  { value: "bogor", label: "Bogor", lat: -6.6, lng: 106.8 },
  { value: "semarang", label: "Semarang", lat: -6.97, lng: 110.42 },
  { value: "medan", label: "Medan", lat: 3.59, lng: 98.67 },
  { value: "makassar", label: "Makassar", lat: -5.14, lng: 119.42 },
  { value: "palembang", label: "Palembang", lat: -2.99, lng: 104.76 },
  { value: "depok", label: "Depok", lat: -6.4, lng: 106.82 },
  { value: "tangerang", label: "Tangerang", lat: -6.18, lng: 106.63 },
  { value: "bekasi", label: "Bekasi", lat: -6.24, lng: 106.99 },
  { value: "malang", label: "Malang", lat: -7.98, lng: 112.63 },
  { value: "solo", label: "Solo", lat: -7.57, lng: 110.83 },
  { value: "padang", label: "Padang", lat: -0.95, lng: 100.35 },
  { value: "bandar lampung", label: "Bandar Lampung", lat: -5.45, lng: 105.27 },
  { value: "samarinda", label: "Samarinda", lat: -0.5, lng: 117.15 },
  { value: "pekanbaru", label: "Pekanbaru", lat: 0.51, lng: 101.45 },
  { value: "denpasar", label: "Denpasar", lat: -8.65, lng: 115.22 },
];

type BookingFilterProps = {
  noHeroMargin?: boolean;
  onSearch?: (criteria: any) => void;
  initialCriteria?: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    adultQty?: number;
    childQty?: number;
    roomQty?: number;
  };
};

export default function BookingFilter({ noHeroMargin = false, onSearch, initialCriteria }: BookingFilterProps) {
  const [city, setCity] = useState<CityOption | null>(initialCriteria?.city ? cityOptions.find(c => c.value === initialCriteria.city) || null : null);
  const [checkIn, setCheckIn] = useState(initialCriteria?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initialCriteria?.checkOut || "");
  const [adultQty, setAdultQty] = useState(initialCriteria?.adultQty || 1);
  const [childQty, setChildQty] = useState(initialCriteria?.childQty || 0);
  const [roomQty, setRoomQty] = useState(initialCriteria?.roomQty || 1);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);

  // 🧭 Handle cari properti
  const handleSearch = () => {
    if (onSearch) {
      const criteria = {
        city: city?.value,
        checkIn,
        checkOut,
        adultQty,
        childQty,
        roomQty,
      };
      onSearch(criteria);
    } else {
      const params = new URLSearchParams();
      if (city?.value) params.set("city", city.value);
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      if (adultQty) params.set("adultQty", adultQty.toString());
      if (childQty) params.set("childQty", childQty.toString());
      if (roomQty) params.set("roomQty", roomQty.toString());

      window.location.href = `/property/search?${params.toString()}`;
    }
  };

  const containerClass = noHeroMargin
    ? "bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-end gap-6 mt-6 relative z-10 max-w-7xl mx-auto w-full border border-gray-100"
    : "bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-end gap-6 relative z-10 max-w-7xl mx-auto w-full pt-16 border border-gray-100";

  const formatGuestText = () => {
    const parts = [];
    if (adultQty > 0) parts.push(`${adultQty} Dewasa`);
    if (childQty > 0) parts.push(`${childQty} Anak`);
    if (roomQty > 0) parts.push(`${roomQty} Kamar`);
    return parts.join(" • ") || "Pilih tamu";
  };

  return (
    <div className={containerClass}>
      {/* Kota Tujuan */}
      <Field label="Kota Tujuan" icon={<MapPin className="w-4 h-4" />}>
        <Select
          options={cityOptions}
          value={city}
          onChange={(opt) => setCity(opt)}
          placeholder="Pilih kota atau area"
          className="mt-1"
          components={{
            DropdownIndicator: () => <ChevronDown className="w-4 h-4 text-gray-500 mr-2" />,
            IndicatorSeparator: () => null,
          }}
          menuPortalTarget={document.body}
          styles={{
            control: (provided, state) => ({
              ...provided,
              padding: "6px 8px",
              borderRadius: "12px",
              border: state.isFocused ? "2px solid #3b82f6" : "2px solid #e5e7eb",
              boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
              },
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#9ca3af",
              fontSize: "14px",
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />
      </Field>

      {/* Check-in */}
      <DateInput
        label="Check-in"
        value={checkIn}
        onChange={(v) => {
          setCheckIn(v);
          if (checkOut && new Date(v) >= new Date(checkOut)) setCheckOut("");
        }}
        min={new Date().toISOString().split("T")[0]}
        icon={<Calendar className="w-4 h-4" />}
      />

      {/* Check-out */}
      <DateInput
        label="Check-out"
        value={checkOut}
        onChange={setCheckOut}
        min={checkIn || new Date().toISOString().split("T")[0]}
        icon={<Calendar className="w-4 h-4" />}
      />

      {/* Jumlah tamu & kamar */}
      <Field label="Tamu & Kamar" icon={<Users className="w-4 h-4" />}>
        <div className="relative">
          <div
            className="mt-1 w-full border-2 border-gray-200 rounded-xl px-4 py-3 cursor-pointer bg-white flex justify-between items-center transition-all duration-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
            onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
          >
            <span className={`${!adultQty && !childQty && !roomQty ? "text-gray-400" : "text-gray-700"}`}>
              {formatGuestText()}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isGuestDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </div>

          {isGuestDropdownOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-[9999] p-6 mt-2 space-y-4">
              {/* Dewasa */}
              <GuestCounter label="Dewasa" sub="Usia 13+" value={adultQty} setValue={setAdultQty} min={1} />

              {/* Anak */}
              <GuestCounter label="Anak" sub="Usia 2-12" value={childQty} setValue={setChildQty} min={0} />

              {/* Kamar */}
              <GuestCounter label="Kamar" sub="Jumlah kamar" value={roomQty} setValue={setRoomQty} min={1} />

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsGuestDropdownOpen(false)}
                  className="w-full bg-[#2f567a] text-white py-3 rounded-xl font-semibold hover:bg-[#7ba2c5] transition-colors duration-200"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </Field>

      {/* Tombol Cari */}
      <button
        onClick={handleSearch}
        disabled={!city}
        className="font-semibold px-10 py-4 rounded-xl bg-gradient-to-r from-[#2f567a] to-blue-700 hover:scale-105 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Search className="w-5 h-5" />
        Cari
      </button>
    </div>
  );
}

function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex-1 w-full relative">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
  min,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: string;
  icon?: React.ReactNode;
}) {
  return (
    <Field label={label} icon={icon}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className="mt-1 w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 cursor-pointer"
      />
    </Field>
  );
}

function GuestCounter({
  label,
  sub,
  value,
  setValue,
  min,
}: {
  label: string;
  sub: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{sub}</div>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setValue(Math.max(min, value - 1))}
          className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={value <= min}
        >
          −
        </button>
        <span className="w-8 text-center font-semibold text-gray-900">{value}</span>
        <button
          onClick={() => setValue(value + 1)}
          className="w-10 h-10 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
        >
          +
        </button>
      </div>
    </div>
  );
}
