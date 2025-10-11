// components/properties/RoomCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import {  User, Baby, Check } from "lucide-react";
import type { RoomType, PeakSeason } from "@/components/properties/types";

interface RoomCardProps {
  room: RoomType;
  onSelect: (room: RoomType) => void;
  isSelected: boolean;
  checkInDate: Date | null;
  checkOutDate: Date | null;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, isSelected, checkInDate, checkOutDate }) => {
  const roomImages = room?.images || [];

  const isPeakSeason = checkInDate && checkOutDate && room?.peakSeasons?.some(season => {
    const seasonStart = new Date(season.startDate);
    const seasonEnd = new Date(season.endDate);
  
    return checkInDate <= seasonEnd && checkOutDate >= seasonStart;
  });

  let displayPrice = room?.price || 0;
  if (isPeakSeason) {
    const currentSeason = room.peakSeasons.find(season => {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);
      return checkInDate <= seasonEnd && checkOutDate >= seasonStart;
    });
    if (currentSeason) {
      if (currentSeason.nominal) {
        displayPrice += currentSeason.nominal;
      } else if (currentSeason.percentage) {
        displayPrice *= (1 + currentSeason.percentage / 100);
      }
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl ${
      isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"
    }`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image Section */}
        <div className="relative lg:w-80">
          <Image 
            src={roomImages[0] || "/placeholder-room.jpg"} 
            alt={room?.roomName || "Room"} 
            width={400} 
            height={300} 
            className="w-full h-56 lg:h-48 object-cover rounded-xl shadow-md"
          />
          <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-1" />
                {room?.adultQty || 2}
              </div>
              {room?.childQty && room.childQty > 0 && (
                <div className="flex items-center">
                  <Baby className="w-5 h-5 mr-1" />
                  {room.childQty}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{room?.roomName || "Tipe Kamar"}</h3>
              <p className="text-gray-600 leading-relaxed">{room?.description || "Deskripsi kamar tidak tersedia."}</p>
            </div>
            <div className="text-right min-w-[120px]">
              <div className="text-2xl font-bold text-blue-600">Rp {displayPrice.toLocaleString()}</div>
              <div className="text-sm text-gray-500">per malam</div>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              room?.quota && room.quota > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {room?.quota && room.quota > 0 ? "Tersedia" : "Tidak Tersedia"}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1"></div>
            <button
              onClick={() => {
                onSelect(room);
                // Scroll to booking sidebar on mobile
                if (window.innerWidth < 768) {
                  setTimeout(() => {
                    const sidebar = document.getElementById('booking-sidebar');
                    if (sidebar) {
                      sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
              }}
              disabled={!room?.quota || room.quota <= 0}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
              }`}
            >
              {isSelected ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Terpilih
                </span>
              ) : (
                "Pilih Kamar"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {room?.peakSeasons && room.peakSeasons.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center text-amber-800 text-sm">
            <span className="font-semibold">🏖️ Peak Season:</span>
            <span className="ml-2">
              {room.peakSeasons.map((season: PeakSeason, index: number) => (
                <span key={index}>
                  {new Date(season.startDate).toLocaleDateString('id-ID')} - {new Date(season.endDate).toLocaleDateString('id-ID')}
                  {index < room.peakSeasons.length - 1 && ', '}
                </span>
              ))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCard;