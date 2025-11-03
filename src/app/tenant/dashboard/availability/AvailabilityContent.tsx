"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedPage from "@/components/protectedPage";
import Select, { SingleValue } from "react-select";

interface Property {
  id: number;
  name: string;
  city: string;
}

interface RoomType {
  id: number;
  roomName: string;
}

interface OptionType {
  value: number;
  label: string;
}

export default function AvailabilityContent() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const res = await axios.get<{ data: Property[] }>(
          `${API_URL}/api/properties/dashboard/my`,
          {
            params: { perPage: 100 },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProperties(res.data.data);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [API_URL, token]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      if (!selectedPropertyId || !token) {
        setRoomTypes([]);
        return;
      }

      try {
        setLoadingRooms(true);
        const res = await axios.get<{ items: RoomType[] }>(
          `${API_URL}/api/report/tenant-roomtype`,
          {
            params: { propertyId: selectedPropertyId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRoomTypes(res.data.items);
        setSelectedRoomTypeId(null);
      } catch (err) {
        console.error("Failed to load room types:", err);
        setRoomTypes([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRoomTypes();
  }, [selectedPropertyId, API_URL, token]);

  const propertyOptions: OptionType[] = properties.map((p) => ({
    value: p.id,
    label: `${p.name} - ${p.city}`,
  }));

  const roomTypeOptions: OptionType[] = roomTypes.map((rt) => ({
    value: rt.id,
    label: rt.roomName,
  }));

  const selectedPropertyOption = propertyOptions.find(opt => opt.value === selectedPropertyId) || null;
  const selectedRoomTypeOption = roomTypeOptions.find(opt => opt.value === selectedRoomTypeId) || null;

  const handleViewCalendar = async () => {
    if (selectedPropertyId && selectedRoomTypeId) {
      setIsProcessing(true);
      try {
        setTimeout(() => {
          router.push(`/tenant/dashboard/availability/${selectedPropertyId}/${selectedRoomTypeId}`);
          setIsProcessing(false);
        }, 500);
      } catch (error) {
        console.error("Navigation error:", error);
        setIsProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <ProtectedPage role="TENANT">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading properties...</p>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage role="TENANT">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/tenant/dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200 group"
            >
              <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    Availability & Peak Season Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Select a property and room to manage availability and pricing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Selection Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="space-y-6">
              {/* Property Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Select Property <span className="text-red-500">*</span>
                </label>
                <Select<OptionType, false>
                  value={selectedPropertyOption}
                  onChange={(selected: SingleValue<OptionType>) =>
                    setSelectedPropertyId(selected ? selected.value : null)
                  }
                  options={propertyOptions}
                  placeholder="-- Choose a property --"
                  className="w-full text-sm sm:text-base"
                  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      width: "100%",
                      left: 0,
                      right: 0,
                    }),
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      borderRadius: "10px",
                      boxShadow: state.isFocused
                        ? "0 0 0 2px #3b82f680"
                        : "none",
                      "&:hover": { borderColor: "#3b82f6" },
                      minHeight: "40px",
                      backgroundColor: "#fff",
                    }),
                  }}
                  menuPlacement="auto"
                  menuPosition="absolute"
                />
              </div>

              {/* Room Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Select Room Type <span className="text-red-500">*</span>
                </label>
                <Select<OptionType, false>
                  value={selectedRoomTypeOption}
                  onChange={(selected: SingleValue<OptionType>) =>
                    setSelectedRoomTypeId(selected ? selected.value : null)
                  }
                  options={roomTypeOptions}
                  placeholder={
                    loadingRooms
                      ? "Loading rooms..."
                      : selectedPropertyId
                      ? "-- Choose a room type --"
                      : "-- Select a property first --"
                  }
                  isDisabled={!selectedPropertyId || loadingRooms}
                  className="w-full text-sm sm:text-base"
                  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      width: "100%",
                      left: 0,
                      right: 0,
                    }),
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      borderRadius: "10px",
                      boxShadow: state.isFocused
                        ? "0 0 0 2px #3b82f680"
                        : "none",
                      "&:hover": { borderColor: "#3b82f6" },
                      minHeight: "40px",
                      backgroundColor: "#fff",
                    }),
                  }}
                  menuPlacement="auto"
                  menuPosition="absolute"
                />
                {loadingRooms && (
                  <div className="flex items-center mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
                    <span className="text-sm text-gray-600">Loading room types...</span>
                  </div>
                )}
              </div>

              {/* View Calendar Button */}
              <div className="pt-4">
                <button
                  onClick={handleViewCalendar}
                  disabled={!selectedPropertyId || !selectedRoomTypeId || isProcessing}
                  className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      View Availability and Pricing Calendar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          {properties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                You need to create at least one property before you can manage availability.
              </p>
              <button
                onClick={() => router.push("/tenant/dashboard/properties/add")}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Cara Menggunakan Manajemen Ketersediaan
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pilih properti dari portofolio Anda</li>
                    <li>• Pilih tipe kamar tertentu untuk dikelola</li>
                    <li>• Lihat dan edit harga musiman di kalender</li>
                    <li>• Tetapkan tarif berbeda untuk periode permintaan tinggi</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
