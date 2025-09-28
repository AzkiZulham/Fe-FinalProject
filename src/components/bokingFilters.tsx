"use client";

import { useState, useEffect } from "react";
import Select from "react-select";

type CityOption = { value: string; label: string; lat: number; lng: number };
type Location = { lat: number; lng: number };

const cityOptions: CityOption[] = [
  { value: "jakarta", label: "Jakarta", lat: -6.2, lng: 106.8 },
  { value: "bandung", label: "Bandung", lat: -6.9, lng: 107.6 },
  { value: "bali", label: "Bali", lat: -8.65, lng: 115.2 },
  { value: "surabaya", label: "Surabaya", lat: -7.25, lng: 112.7 },
];

// 🔹 helper distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const findNearestCity = (lat: number, lng: number): CityOption =>
  cityOptions.reduce((nearest, city) =>
    getDistance(lat, lng, city.lat, city.lng) <
    getDistance(lat, lng, nearest.lat, nearest.lng)
      ? city
      : nearest
  );

// 🔹 Custom hook: geolocation
function useGeoCity() {
  const [city, setCity] = useState<CityOption | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setCity(cityOptions[0]);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setLocation(loc);
        setCity(findNearestCity(loc.lat, loc.lng));
        setLoading(false);
      },
      () => {
        setCity(cityOptions[0]); // fallback
        setLoading(false);
      }
    );
  }, []);

  return { city, setCity, location, loading };
}

// 🔹 Main Component
export default function BookingFilter() {
  const { city, setCity, location, loading } = useGeoCity();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = async () => {
    const payload = { city: city?.value, checkIn, checkOut, location };
    console.log("Cari properti dengan:", payload);

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Hasil rekomendasi:", await res.json());
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-end gap-6 -mt-20 relative z-20 max-w-6xl mx-auto w-full">
      {/* Kota Tujuan */}
      <Field label="Kota Tujuan">
        <Select
          options={cityOptions}
          value={city}
          onChange={(opt) => setCity(opt)}
          placeholder={loading ? "Mendeteksi lokasi..." : "Pilih kota"}
          isDisabled={loading}
          className="mt-1"
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
      />

      {/* Check-out */}
      <DateInput
        label="Check-out"
        value={checkOut}
        onChange={setCheckOut}
        min={checkIn || new Date().toISOString().split("T")[0]}
      />

      {/* Tombol Cari */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className={`font-semibold px-8 py-3 rounded-xl transition-all duration-200 md:self-end flex-shrink-0 ${
          loading
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#2f567a] hover:bg-[#3a6b97] hover:shadow-md hover:scale-105 text-white"
        }`}
      >
        {loading ? "Loading..." : "Cari"}
      </button>
    </div>
  );
}

// 🔹 Reusable Components
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full relative">
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: string;
}) {
  return (
    <Field label={label}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-md px-3 py-2"
        min={min}
      />
    </Field>
  );
}
