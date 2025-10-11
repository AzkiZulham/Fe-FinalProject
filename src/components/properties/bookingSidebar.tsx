// components/properties/bookingSidebar.tsx
"use client";

import React, { useState, } from "react";
import { Calendar, Users, CreditCard, Shield, Check, User, Baby, Home } from "lucide-react";
import type { Property, RoomType } from "@/components/properties/types";

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
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [qty, setQty] = useState(1);

  React.useEffect(() => {
    setAdults(1);
    setChildren(0);
    setQty(1);
  }, [selectedRoom]);

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

      {/* Selected Room Info */}
      {selectedRoom ? (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
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
            <div className="text-lg font-bold text-blue-600">
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

      {/* Date Selection */}
      <div className="space-y-4 mb-6">
        {/* Check-in Date */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            Check-in
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="date"
                disabled={!selectedRoom || !selectedRoom.quota || selectedRoom.quota <= 0}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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

        {/* Check-out Date */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            Check-out
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="date"
                disabled={!selectedRoom || !selectedRoom.quota || selectedRoom.quota <= 0}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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

        {/* Duration Display */}
        {checkInDate && checkOutDate && calculateNights() > 0 && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="text-center text-green-800 text-sm font-medium">
              {calculateNights()} Malam • {formatDate(checkInDate)} - {formatDate(checkOutDate)}
            </div>
          </div>
        )}
      </div>

      {/* Guests Selection */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <Users className="w-4 h-4 mr-2 text-blue-600" />
          Jumlah Tamu
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-600" />
              Dewasa
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <Baby className="w-4 h-4 mr-2 text-blue-600" />
              Anak
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <Home className="w-4 h-4 mr-2 text-blue-600" />
              Kamar
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

      {/* Price Summary */}
      {selectedRoom && checkInDate && checkOutDate && calculateNights() > 0 && (() => {
        const pricing = calculatePricing();
        return (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Biaya</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{qty} Kamar × {calculateNights()} Malam</span>
                <span>Rp {(pricing.total / qty).toLocaleString()} /kamar</span>
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
                  <span className="text-blue-600">Rp {pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!selectedRoom || !checkInDate || !checkOutDate || calculateNights() <= 0}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-3"
      >
        <CreditCard className="w-5 h-5" />
        {selectedRoom && checkInDate && checkOutDate ? 'Pesan Sekarang' : 'Pilih Kamar & Tanggal'}
      </button>

      {/* Security & Features */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Pembayaran Aman & Terenkripsi</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-600" />
            <span>Konfirmasi Instan</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-600" />
            <span>Gratis Pembatalan</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-600" />
            <span>Support 24/7</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-600" />
            <span>Best Price</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSidebar;