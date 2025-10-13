"use client";

import React, { useState, } from "react";
import { Calendar, Users, CreditCard, Shield, Check, User, Baby, Home } from "lucide-react";
import type { Property, RoomType } from "@/components/properties/types";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

interface Props {
  property: Property;
  selectedRoom: RoomType | null;
  onBook: (room: RoomType, checkIn: Date, checkOut: Date, qty: number) => void;
  checkInDate: Date | null;
  setCheckInDate: (date: Date | null) => void;
  checkOutDate: Date | null;
  setCheckOutDate: (date: Date | null) => void;
}

const BookingSidebar: React.FC<Props> = ({ selectedRoom, onBook, checkInDate, setCheckInDate, checkOutDate, setCheckOutDate }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [qty, setQty] = useState(1);
  const [pricing, setPricing] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: selectedRoom.id,
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        qty
      })
    })
    .then(res => res.json())
    .then(data => {
      setPricing(data);
      setPricingLoading(false);
    })
    .catch(err => {
      console.error(err);
      setPricing(null);
      setPricingLoading(false);
    });
  }, [selectedRoom, checkInDate, checkOutDate, qty]);

  const displayPrice = selectedRoom?.price || 0;

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculatePricing = () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) return { total: 0, normalNights: 0, peakNights: 0, normalTotal: 0, peakTotal: 0 };
    let total = 0;
    let normalNights = 0;
    let peakNights = 0;
    let normalTotal = 0;
    let peakTotal = 0;
    const nights = calculateNights();
    for (let i = 0; i < nights; i++) {
      const nightDate = new Date(checkInDate);
      nightDate.setDate(checkInDate.getDate() + i);
      let price = selectedRoom.price;
      
      const applicableSeason = selectedRoom.peakSeasons?.find(season => {
        const start = new Date(season.startDate);
        const end = new Date(season.endDate);
        return nightDate >= start && nightDate <= end;
      });
      if (applicableSeason) {
        if (applicableSeason.nominal) {
          price += applicableSeason.nominal;
        } else if (applicableSeason.percentage) {
          price *= (1 + applicableSeason.percentage / 100);
        }
        peakNights++;
        peakTotal += price;
      } else {
        normalNights++;
        normalTotal += price;
      }
      total += price;
    }
    total *= qty;
    normalTotal *= qty;
    peakTotal *= qty;
    return { total, normalNights, peakNights, normalTotal, peakTotal };
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

    onBook(selectedRoom, checkInDate, checkOutDate, qty);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div id="booking-sidebar" className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Pesan Sekarang</h3>
      </div>

      {selectedRoom ? (
        <div className="bg-[#2f567a]/10 rounded-xl p-4 mb-6 border border-[#2f567a]/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-lg">{selectedRoom.roomName}</h4>
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Terpilih</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{adults} Dewasa</span>
              {children > 0 && <span>, {children} Anak</span>}
              <span>, {qty} Kamar</span>
            </div>
            <div className="text-lg font-bold text-[#2f567a]">
              Rp {displayPrice.toLocaleString()}
              <span className="text-sm font-normal text-gray-500">/malam</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
          <div className="flex items-center space-x-2 text-amber-800">
            <span>⚠️</span>
            <p className="text-sm">Silakan pilih tipe kamar terlebih dahulu</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-[#2f567a]" />
            Check-in
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="date"
                disabled={!selectedRoom || !selectedRoom.quota || selectedRoom.quota <= 0}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f567a] focus:border-[#2f567a] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                onChange={(e) => setCheckInDate(e.target.value ? new Date(e.target.value) : null)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {checkInDate && (
              <div className="w-full sm:w-24 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 font-medium">
                {formatDate(checkInDate)}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-[#2f567a]" />
            Check-out
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="date"
                disabled={!selectedRoom || !selectedRoom.quota || selectedRoom.quota <= 0}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f567a] focus:border-[#2f567a] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                onChange={(e) => setCheckOutDate(e.target.value ? new Date(e.target.value) : null)}
                min={checkInDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
              />
            </div>
            {checkOutDate && (
              <div className="w-full sm:w-24 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 font-medium">
                {formatDate(checkOutDate)}
              </div>
            )}
          </div>
        </div>

        {checkInDate && checkOutDate && calculateNights() > 0 && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-center text-green-800 text-sm font-medium">
              {calculateNights()} Malam • {formatDate(checkInDate)} - {formatDate(checkOutDate)}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Users className="w-4 h-4 mr-2 text-[#2f567a]" />
          Jumlah Tamu
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-[#2f567a]" />
              Dewasa
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f567a] focus:border-[#2f567a] transition-colors"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
            >
              {Array.from({ length: selectedRoom?.adultQty || 1 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Baby className="w-4 h-4 mr-2 text-[#2f567a]" />
              Anak
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f567a] focus:border-[#2f567a] transition-colors"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
            >
              {Array.from({ length: (selectedRoom?.childQty || 0) + 1 }, (_, i) => i).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Home className="w-4 h-4 mr-2 text-[#2f567a]" />
              Kamar
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2f567a] focus:border-[#2f567a] transition-colors"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value))}
            >
              {Array.from({ length: Math.min(selectedRoom?.quota || 1, 10) }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {pricing && !pricingLoading && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Biaya</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 text-xs">{qty} Kamar × {pricing.nights} Malam</span>
            </div>
            {pricing.normalNights > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Normal ({pricing.normalNights} malam)</span>
                <span>Rp {pricing.normalTotal.toLocaleString()}</span>
              </div>
            )}
            {pricing.peakNights > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Puncak ({pricing.peakNights} malam)</span>
                <span>Rp {pricing.peakTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#2f567a]">Rp {pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={!selectedRoom || !checkInDate || !checkOutDate || calculateNights() <= 0}
        className="w-full bg-gradient-to-r from-[#2f567a] to-[#1e3a4f] hover:from-[#1e3a4f] hover:to-[#0f172a] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-3"
      >
        <CreditCard className="w-5 h-5" />
        {selectedRoom && checkInDate && checkOutDate ? 'Pesan Sekarang' : 'Pilih Kamar & Tanggal'}
      </button>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Pembayaran Aman & Terenkripsi</span>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Login Diperlukan</h3>
            <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu untuk melanjutkan pemesanan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  router.push('/login/user');
                }}
                className="flex-1 bg-[#2f567a] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#1e3a4f] transition-colors"
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