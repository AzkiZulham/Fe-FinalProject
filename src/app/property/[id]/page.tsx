"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import PropertyGallery from "@/components/properties/propertyGallery";
import RoomCard from "@/components/properties/roomCard";
import ReviewList from "@/components/properties/reviewList";
import BookingSidebar from "@/components/properties/bookingSidebar";
import Footer from "@/components/footer";
import { MapPin } from "lucide-react";
import { useAuth } from "@/context/authContext";

import type {
  Property,
  Review,
  RoomType,
  PeakSeason,
} from "@/components/properties/types";
import toast from "react-hot-toast";

type ApiResponse = {
  property: Property & {
    roomTypes?: (RoomType & { roomImg?: string })[];
  };
  reviews?: Review[];
};

export default function PropertyDetailPage(): React.ReactElement {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${id}`;
        const res = await axios.get<ApiResponse>(url);

        const propertyData = res.data.property;

        const normalizedRooms = Array.isArray(propertyData.roomTypes)
          ? propertyData.roomTypes.map((room) => {
              const roomWithPeak: typeof room & { peakSeasons?: PeakSeason[] } =
                room;
              return {
                ...room,
                images: Array.isArray(room.roomImg) ? room.roomImg : [],
                quota: room.quota,
                peakSeasons: Array.isArray(roomWithPeak.peakSeasons)
                  ? roomWithPeak.peakSeasons.map((season) => ({
                      startDate: season.startDate,
                      endDate: season.endDate,
                      nominal: season.nominal,
                      percentage: season.percentage,
                      isAvailable: season.isAvailable,
                    }))
                  : [],
              };
            })
          : [];

        const validatedProperty: Property = {
          ...propertyData,
          images: Array.isArray(propertyData.images)
            ? propertyData.images
            : propertyData.picture
            ? [propertyData.picture]
            : [],
          roomtypes: normalizedRooms,
        };

        setProperty(validatedProperty);
        setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data property.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2f567a] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat data properti...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-center p-6">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-3">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#2f567a] text-white rounded-xl hover:bg-[#1e3a4f] transition-colors font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-center p-6">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Properti tidak ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            ID {id} tidak ditemukan dalam sistem kami
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[#2f567a] text-white rounded-xl hover:bg-[#1e3a4f] transition-colors font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const handleBook = async (
    room: RoomType,
    checkIn: Date,
    checkOut: Date,
    qty: number
  ) => {
    if (!user) {
      window.location.href = "/login/user";
      return;
    }

    if (!selectedRoom) {
      toast.error("Silakan pilih tipe kamar terlebih dahulu");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan. Silakan login ulang.");
        window.location.href = "/login/user";
        return;
      }

      const checkInDate = checkIn.toISOString().split("T")[0];
      const checkOutDate = checkOut.toISOString().split("T")[0];

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transaction/`,
        {
          roomTypeId: room.id,
          qty,
          checkInDate,
          checkOutDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        const { transaction } = response.data;

        window.location.href = `/checkout?transactionId=${transaction.id}`;
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Booking error:", axiosError);
      if (axiosError.response?.status === 401) {
        toast.error("Sesi autentikasi kedaluwarsa. Silakan login ulang.");
        localStorage.removeItem("token");
        window.location.href = "/login/user";
      } else if (axiosError.response?.status === 403) {
        toast.error(
          "Akses ditolak. Hanya pengguna yang dapat membuat pesanan."
        );
      } else {
        toast.error(
          (axiosError.response?.data as { error?: string })?.error ||
            "Gagal membuat pesanan. Silakan coba lagi."
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {property.name}
          </h1>

          <div className="flex items-center space-x-2 text-gray-600 mb-4">
            <MapPin className="w-5 h-5 text-[#2f567a]" />
            <span className="text-lg">{property.address}</span>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">
            {property.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Gallery Section */}
        <section className="mb-12">
          <PropertyGallery images={property.images} name={property.name} />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Rooms Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Tipe Kamar Tersedia
              </h2>
              <div className="space-y-6">
                {property.roomtypes.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelect={setSelectedRoom}
                    isSelected={selectedRoom?.id === room.id}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                  />
                ))}
                {property.roomtypes.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🛏️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Tidak ada kamar tersedia
                    </h3>
                    <p className="text-gray-600">
                      Silakan cek kembali di waktu lain.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <ReviewList reviews={reviews} />
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-20">
              <BookingSidebar
                property={property}
                selectedRoom={selectedRoom}
                onBook={handleBook}
                checkInDate={checkInDate}
                setCheckInDate={setCheckInDate}
                checkOutDate={checkOutDate}
                setCheckOutDate={setCheckOutDate}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
