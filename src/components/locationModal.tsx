"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

type LocationData = {
  lat: number;
  lng: number;
  city: string;
};

export default function LocationModal({
  onLocationDetected,
}: {
  onLocationDetected: (location: LocationData) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasAsked = localStorage.getItem("locationAsked");
    if (!hasAsked) setIsOpen(true);
  }, []);

  const handleDetect = async () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latitude = parseFloat(pos.coords.latitude.toFixed(6));
          const longitude = parseFloat(pos.coords.longitude.toFixed(6));

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/geolocation/reverse?lat=${latitude}&lng=${longitude}`
            );
            const data = await res.json();

            if (res.ok && data.city) {
              const location: LocationData = {
                lat: latitude,
                lng: longitude,
                city: data.city,
              };
              onLocationDetected(location);
            } else {
              await tryIPFallback();
            }
          } catch (error) {
            console.error("Error fetching location from GPS:", error);
            await tryIPFallback();
          }

          localStorage.setItem("locationAsked", "true");
          setIsOpen(false);
          setIsLoading(false);
        },
        async (error) => {
          console.error("Geolocation error:", error);
          await tryIPFallback();
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 300000,
        }
      );
    } else {
      await tryIPFallback();
    }
  };

  const tryIPFallback = async () => {
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      const ipData = await ipRes.json();

      if (ipData.latitude && ipData.longitude && ipData.city) {
        const location: LocationData = {
          lat: parseFloat(ipData.latitude.toFixed(6)),
          lng: parseFloat(ipData.longitude.toFixed(6)),
          city: ipData.city,
        };
        onLocationDetected(location);
      } else {
        const fallbackLocation: LocationData = {
          lat: -6.2,
          lng: 106.8,
          city: "Jakarta",
        };
        onLocationDetected(fallbackLocation);
      }
    } catch (error) {
      console.error("IP fallback failed:", error);
      const fallbackLocation: LocationData = {
        lat: -6.2,
        lng: 106.8,
        city: "Jakarta",
      };
      onLocationDetected(fallbackLocation);
    }

    localStorage.setItem("locationAsked", "true");
    setIsOpen(false);
    setIsLoading(false);
  };

  const handleSkip = () => {
    const defaultLocation: LocationData = {
      lat: -6.2,
      lng: 106.8,
      city: "Jakarta",
    };
    onLocationDetected(defaultLocation);
    localStorage.setItem("locationAsked", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <MapPin className="w-10 h-10 mx-auto text-blue-600 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Izinkan Akses Lokasi?</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Kami dapat menampilkan properti terdekat dengan lokasi Anda untuk
          pengalaman yang lebih baik.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDetect}
            disabled={isLoading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mendeteksi...
              </>
            ) : (
              "Ya, Izinkan"
            )}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}
