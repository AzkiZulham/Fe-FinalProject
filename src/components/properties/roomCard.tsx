"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Baby, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isPeakSeason = checkInDate && checkOutDate && room?.peakSeasons?.some(season => {
    const seasonStart = new Date(season.startDate);
    const seasonEnd = new Date(season.endDate);

    const overlaps = checkInDate <= seasonEnd && checkOutDate >= seasonStart;
    return overlaps && (season.percentage || season.nominal);
  });

  const isDateAvailable = checkInDate && checkOutDate && room?.peakSeasons?.every(season => {
    const seasonStart = new Date(season.startDate);
    const seasonEnd = new Date(season.endDate);
    const overlaps = checkInDate <= seasonEnd && checkOutDate >= seasonStart;
    if (overlaps && season.isAvailable === false) {
      return false;
    }

    return true;
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
      isSelected ? "border-[#2f567a] bg-[#2f567a]/10 ring-2 ring-[#2f567a]/30" : "border-gray-200 hover:border-[#2f567a]/50"
    }`}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative lg:w-80">
          <Image
            src={roomImages[0] || "/placeholder-room.jpg"}
            alt={room?.roomName || "Room"}
            width={400}
            height={300}
            className="w-full h-56 lg:h-48 object-cover rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => {
              setCurrentImageIndex(0);
              setShowImageModal(true);
            }}
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
          {roomImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              +{roomImages.length - 1} foto
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{room?.roomName || "Tipe Kamar"}</h3>
              <p className="text-gray-600 leading-relaxed">{room?.description || "Deskripsi kamar tidak tersedia."}</p>
            </div>
            <div className="text-right min-w-[120px]">
              {isPeakSeason ? (
                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-500 line-through">Rp {(room?.price || 0).toLocaleString()}</div>
                  <div className="text-2xl font-bold text-[#2f567a]">Rp {displayPrice.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">per malam</div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#2f567a]">Rp {displayPrice.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">per malam</div>
                </>
              )}
              {isDateAvailable === false && checkInDate && checkOutDate && (
                <div className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Tidak Tersedia
                </div>
              )}
              {isPeakSeason && isDateAvailable !== false && (
                <div className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                  Peak Season
                </div>
              )}
              {!isPeakSeason && checkInDate && checkOutDate && isDateAvailable !== false && (
                <div className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Available
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              (room?.quota && room.quota > 0) && (isDateAvailable !== false)
                ? "bg-green-100 text-green-800"
                : "bg-white-100 text-red-800"
            }`}>
              {(room?.quota && room.quota > 0) && (isDateAvailable !== false) ? "Tersedia" : ""}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1"></div>
            <button
              onClick={() => {
                onSelect(room);
                if (window.innerWidth < 768) {
                  setTimeout(() => {
                    const sidebar = document.getElementById('booking-sidebar');
                    if (sidebar) {
                      sidebar.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
              }}
              disabled={!room?.quota || room.quota <= 0 || isDateAvailable === false}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-gradient-to-r from-[#2f567a] to-[#1e3a4f] hover:from-[#1e3a4f] hover:to-[#0f172a] text-white shadow-md"
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

      {room?.peakSeasons && room.peakSeasons.length > 0 && (
        <div className="mt-4 space-y-2">
          {/* Available Peak Seasons (price adjustments) */}
          {room.peakSeasons.some(season => season.isAvailable !== false && (season.percentage || season.nominal)) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center text-amber-800 text-sm">
                <span className="font-semibold">🏖️ Peak Season (Harga Naik):</span>
                <span className="ml-2">
                  {room.peakSeasons
                    .filter(season => season.isAvailable !== false && (season.percentage || season.nominal))
                    .map((season: PeakSeason, index: number, filteredSeasons) => (
                      <span key={index}>
                        {new Date(season.startDate).toLocaleDateString('id-ID')} - {new Date(season.endDate).toLocaleDateString('id-ID')}
                        {season.percentage && ` (+${season.percentage}%)`}
                        {season.nominal && ` (+Rp${season.nominal.toLocaleString('id-ID')})`}
                        {index < filteredSeasons.length - 1 && ', '}
                      </span>
                    ))}
                </span>
              </div>
            </div>
          )}

          {/* Unavailable Peak Seasons */}
          {room.peakSeasons.some(season => season.isAvailable === false) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800 text-sm">
                <span className="font-semibold">❌ Tidak Tersedia:</span>
                <span className="ml-2">
                  {room.peakSeasons
                    .filter(season => season.isAvailable === false)
                    .map((season: PeakSeason, index: number, filteredSeasons) => (
                      <span key={index}>
                        {new Date(season.startDate).toLocaleDateString('id-ID')} - {new Date(season.endDate).toLocaleDateString('id-ID')}
                        {index < filteredSeasons.length - 1 && ', '}
                      </span>
                    ))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <div className="relative">
              <Image
                src={roomImages[currentImageIndex] || "/placeholder-room.jpg"}
                alt={`${room?.roomName || "Room"} - Image ${currentImageIndex + 1}`}
                width={800}
                height={600}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />

              {/* Navigation Buttons */}
              {roomImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : roomImages.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev < roomImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {roomImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
                {roomImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? "border-white" : "border-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Counter */}
            <div className="text-center text-white mt-2">
              {currentImageIndex + 1} / {roomImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
