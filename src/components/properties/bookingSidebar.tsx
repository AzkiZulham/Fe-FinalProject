"use client";

import React, { useState } from "react";
import {
  Calendar,
  Users,
  CreditCard,
  Shield,
  Check,
  User,
  Baby,
  Home,
  Info,
  X,
} from "lucide-react";
import type { Property, RoomType } from "@/components/properties/types";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

interface Props {
  property: Property;
  selectedRoom: RoomType | null;
  onBook: (
    room: RoomType,
    checkIn: Date,
    checkOut: Date,
    qty: number
  ) => Promise<void> | void;
  checkInDate: Date | null;
  setCheckInDate: (date: Date | null) => void;
  checkOutDate: Date | null;
  setCheckOutDate: (date: Date | null) => void;
}

const BookingSidebar: React.FC<Props> = ({
  selectedRoom,
  onBook,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [qty, setQty] = useState(1);
  const [pricing, setPricing] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDateInfo, setShowDateInfo] = useState(false);
  const [booking, setBooking] = useState(false);

  const isDateAvailable =
    checkInDate &&
    checkOutDate &&
    selectedRoom?.peakSeasons?.every((season) => {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);
      const bookingEnd = new Date(checkOutDate.getTime() - 24 * 60 * 60 * 1000);
      const overlaps = checkInDate <= seasonEnd && bookingEnd >= seasonStart;
      if (overlaps && season.isAvailable === false) {
        return false;
      }

      return true;
    });

  React.useEffect(() => {
    setAdults(1);
    setChildren(0);
    setQty(1);
  }, [selectedRoom]);

  React.useEffect(() => {
    if (!selectedRoom || !checkInDate || !checkOutDate) {
      setPricing(null);
      return;
    }
    setPricingLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/calculate-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: selectedRoom.id,
        checkIn: checkInDate.toISOString().split("T")[0],
        checkOut: checkOutDate.toISOString().split("T")[0],
        qty,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 400) {
            setPricing(null);
            setPricingLoading(false);
            return;
          } else {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
        }
        return res.json();
      })
      .then((data) => {
        if (
          data &&
          typeof data.total === "number" &&
          typeof data.nights === "number"
        ) {
          setPricing(data);
        } else {
          console.warn("Invalid pricing data received:", data);
          setPricing(null);
        }
        setPricingLoading(false);
      })
      .catch((err) => {
        console.error("Pricing fetch error:", err);
        setPricing(null);
        setPricingLoading(false);
      });
  }, [selectedRoom, checkInDate, checkOutDate, qty]);

  const isPeakSeason =
    checkInDate &&
    checkOutDate &&
    selectedRoom &&
    selectedRoom.peakSeasons?.some((season) => {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);
      const bookingEnd = new Date(checkOutDate.getTime() - 24 * 60 * 60 * 1000);
      const overlaps = checkInDate <= seasonEnd && bookingEnd >= seasonStart;
      return overlaps && (season.percentage || season.nominal);
    });

  let displayPrice = selectedRoom?.price || 0;
  if (isPeakSeason) {
    const currentSeason = selectedRoom.peakSeasons.find((season) => {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);
      const bookingEnd = new Date(checkOutDate.getTime() - 24 * 60 * 60 * 1000);
      return checkInDate <= seasonEnd && bookingEnd >= seasonStart;
    });
    if (currentSeason) {
      if (currentSeason.nominal) {
        displayPrice += currentSeason.nominal;
      } else if (currentSeason.percentage) {
        displayPrice *= 1 + currentSeason.percentage / 100;
      }
    }
  }

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handleBooking = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!selectedRoom || !checkInDate || !checkOutDate) {
      alert("Silakan pilih kamar dan tanggal check-in/check-out");
      return;
    }
    if (calculateNights() <= 0) {
      alert("Tanggal check-out harus setelah tanggal check-in");
      return;
    }

    if (qty > (selectedRoom.quota ?? 0)) {
      alert("Jumlah kamar melebihi ketersediaan");
      return;
    }

    try {
      setBooking(true);

      Promise.resolve(onBook(selectedRoom, checkInDate, checkOutDate, qty));
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getPriceColor = () => {
    if (isPeakSeason) return "text-amber-600";
    return "text-gray-900";
  };

  return (
    <div
      id="booking-sidebar"
      className=" rounded-2xl shadow-2xl border border-gray-200/60 p-6 sticky top-6 backdrop-blur-sm bg-white/95"
    >
      <div className="text-center mb-6 pb-4 border-b border-gray-200/60">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
          Pesan Sekarang
        </h3>
        <p className="text-sm text-gray-500">
          Dapatkan harga terbaik dengan pemesanan online
        </p>
      </div>

      {/* Selected Room Card */}
      {selectedRoom ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-lg leading-tight">
                {selectedRoom.roomName}
              </h4>
              <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                <Check className="w-3 h-3" />
                <span>Terpilih</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1 bg-white/80 px-2 py-1 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{adults} Dewasa</span>
                  {children > 0 && <span>, {children} Anak</span>}
                </div>
                <div className="flex items-center space-x-1 bg-white/80 px-2 py-1 rounded-lg">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{qty} Kamar</span>
                </div>
              </div>
              <div
                className={`text-lg font-bold ${getPriceColor()} flex items-end space-x-1`}
              >
                {isPeakSeason ? (
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-500 line-through font-normal">
                      Rp {(selectedRoom?.price || 0).toLocaleString("id-ID")}
                    </div>
                    <div className="flex items-center">
                      <span>
                        Rp {Math.round(displayPrice).toLocaleString("id-ID")}
                      </span>
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        /malam
                      </span>
                    </div>
                    {isPeakSeason && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full mt-1 font-medium">
                        Peak Season
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <div>Rp {displayPrice.toLocaleString("id-ID")}</div>
                    <span className="text-sm font-normal text-gray-500">
                      /malam
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-200/60 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-amber-800 font-medium text-sm">
                Pilih Tipe Kamar
              </p>
              <p className="text-amber-600 text-xs mt-1">
                Silakan pilih tipe kamar terlebih dahulu untuk melanjutkan
                pemesanan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Selection dengan improved styling */}
      <div className="space-y-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            Tanggal Menginap
          </label>
          <button
            onClick={() => setShowDateInfo(!showDateInfo)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {showDateInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 animate-fadeIn">
            <div className="flex justify-between items-start">
              <p className="text-blue-700 text-xs flex-1">
                <strong>Tips:</strong> Pilih tanggal check-in dan check-out
                untuk melihat ketersediaan kamar dan harga terupdate. Harga
                dapat berubah selama musim puncak.
              </p>
              <button
                onClick={() => setShowDateInfo(false)}
                className="text-blue-500 hover:text-blue-700 ml-2 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Check-in
            </label>
            <div className="relative">
              <input
                type="date"
                disabled={
                  !selectedRoom ||
                  !selectedRoom.quota ||
                  selectedRoom.quota <= 0
                }
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                onChange={(e) =>
                  setCheckInDate(
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {checkInDate && (
              <div className="text-center text-sm font-medium text-gray-700 bg-gray-50 py-2 rounded-lg border border-gray-200">
                {formatDate(checkInDate)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Check-out
            </label>
            <div className="relative">
              <input
                type="date"
                disabled={
                  !selectedRoom ||
                  !selectedRoom.quota ||
                  selectedRoom.quota <= 0
                }
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                onChange={(e) =>
                  setCheckOutDate(
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                min={
                  checkInDate?.toISOString().split("T")[0] ||
                  new Date().toISOString().split("T")[0]
                }
              />
            </div>
            {checkOutDate && (
              <div className="text-center text-sm font-medium text-gray-700 bg-gray-50 py-2 rounded-lg border border-gray-200">
                {formatDate(checkOutDate)}
              </div>
            )}
          </div>
        </div>

        {checkInDate && checkOutDate && calculateNights() > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold">Durasi Menginap</span>
              </div>
              <div className="text-green-700 font-bold">
                {calculateNights()} Malam
              </div>
            </div>
            <div className="text-sm text-green-600 mt-1 text-center">
              {formatDate(checkInDate)} - {formatDate(checkOutDate)}
            </div>
          </div>
        )}
      </div>

      {/* Guest Selection dengan card layout */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <Users className="w-4 h-4 mr-2 text-blue-600" />
          Detail Tamu
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <label className="text-xs font-medium text-gray-500 mb-2 flex items-center">
              <User className="w-4 h-4 mr-1 text-blue-600" />
              Dewasa
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
            >
              {Array.from(
                { length: selectedRoom?.adultQty || 1 },
                (_, i) => i + 1
              ).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <label className="text-xs font-medium text-gray-500 mb-2 flex items-center">
              <Baby className="w-4 h-4 mr-1 text-blue-600" />
              Anak
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
            >
              {Array.from(
                { length: (selectedRoom?.childQty || 0) + 1 },
                (_, i) => i
              ).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <label className="text-xs font-medium text-gray-500 mb-2 flex items-center">
              <Home className="w-4 h-4 mr-1 text-blue-600" />
              Kamar
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value))}
            >
              {Array.from(
                { length: Math.min(selectedRoom?.quota || 1, 10) },
                (_, i) => i + 1
              ).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing Summary dengan improved design */}
      {pricing &&
        !pricingLoading &&
        typeof pricing.total === "number" &&
        typeof pricing.nights === "number" && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-5 mb-6 border border-gray-200/60 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Ringkasan Biaya
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {qty} Kamar × {pricing.nights} Malam
                </span>
                <span className="font-medium"></span>
              </div>

              {pricing.normalNights > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Harga Normal ({pricing.normalNights} malam)</span>
                  <span>
                    Rp {(pricing.normalTotal || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              {pricing.peakNights > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    Harga Peak Season ({pricing.peakNights} malam)
                    {(() => {
                      const currentSeason = selectedRoom?.peakSeasons?.find(
                        (season) => {
                          const seasonStart = new Date(season.startDate);
                          const seasonEnd = new Date(season.endDate);
                          return (
                            checkInDate &&
                            checkOutDate &&
                            checkInDate <= seasonEnd &&
                            checkOutDate >= seasonStart
                          );
                        }
                      );
                      return currentSeason ? (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full ml-2">
                          {currentSeason.nominal
                            ? `+Rp ${currentSeason.nominal.toLocaleString(
                                "id-ID"
                              )}`
                            : currentSeason.percentage
                            ? `+${currentSeason.percentage}%`
                            : ""}
                        </span>
                      ) : null;
                    })()}
                  </span>
                  <span>
                    Rp {(pricing.peakTotal || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-300 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Total Pembayaran
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    Rp {(pricing.total || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Termasuk pajak dan biaya layanan
                </p>
              </div>
            </div>
          </div>
        )}

      {pricingLoading && (
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      )}

      {/* Booking Button dengan improved styling */}
      <button
        onClick={handleBooking}
        disabled={
          !selectedRoom ||
          !checkInDate ||
          !checkOutDate ||
          calculateNights() <= 0 ||
          isDateAvailable === false
        }
        aria-busy={booking ? "true" : "false"}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        {booking ? (
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <CreditCard className="w-5 h-5 relative z-10" />
        )}

        <span className="relative z-10">
          {booking
            ? "Memproses..."
            : selectedRoom &&
              checkInDate &&
              checkOutDate &&
              isDateAvailable !== false
            ? "Pesan Sekarang"
            : "Pilih Kamar & Tanggal"}
        </span>
      </button>

      {/* Security Badge */}
      <div className="mt-6 pt-4 border-t border-gray-200/60">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-medium">Pembayaran Aman & Terenkripsi</span>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 transform animate-scaleIn">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Login Diperlukan
              </h3>
              <p className="text-gray-600 text-sm">
                Masuk ke akun Anda untuk melanjutkan pemesanan
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-100 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Nanti Saja
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  router.push("/login/user");
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSidebar;
