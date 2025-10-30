"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedPage from "@/components/protectedPage";
import PeakSeasonCalendar from "../../calendar/page";

interface Property {
  id: number;
  name: string;
  city: string;
}

interface RoomType {
  id: number;
  roomName: string;
}

export default function AvailabilityCalendarPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;
  const roomTypeId = params.roomTypeId as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const propertyRes = await axios.get<{ data: Property[] }>(
          `${API_URL}/api/properties/dashboard/my`,
          {
            params: { perPage: 100 },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const foundProperty = propertyRes.data.data.find(
          (p) => p.id === Number(propertyId)
        );
        if (!foundProperty) {
          setError("Property not found or access denied");
          return;
        }
        setProperty(foundProperty);
        const roomTypesRes = await axios.get<{ items: RoomType[] }>(
          `${API_URL}/api/report/tenant-roomtype`,
          {
            params: { propertyId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const foundRoomType = roomTypesRes.data.items.find(
          (rt) => rt.id === Number(roomTypeId)
        );
        if (!foundRoomType) {
          setError("Room type not found or access denied");
          return;
        }
        setRoomType(foundRoomType);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load property and room data");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId && roomTypeId) {
      fetchData();
    }
  }, [propertyId, roomTypeId, API_URL, token]);

  if (loading) {
    return (
      <ProtectedPage role="TENANT">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              Loading availability calendar...
            </p>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  if (error || !property || !roomType) {
    return (
      <ProtectedPage role="TENANT">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Error Loading Calendar
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {error || "Property or room not found"}
            </p>
            <button
              onClick={() => router.push("/tenant/dashboard/availability")}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Availability
            </button>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage role="TENANT">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => router.push("/tenant/dashboard/availability")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200 group"
            >
              <svg
                className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium text-sm sm:text-base">
                Back to Property Selection
              </span>
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    Availability Calendar
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Manage peak seasons and pricing for{" "}
                    <span className="font-semibold text-blue-600">
                      {roomType.roomName}
                    </span>{" "}
                    at{" "}
                    <span className="font-semibold text-blue-600">
                      {property.name}
                    </span>
                  </p>
                </div>
                <div className="text-left sm:text-right text-sm sm:text-base">
                  <p className="text-gray-500">Property</p>
                  <p className="font-semibold text-gray-900">{property.name}</p>
                  <p className="text-gray-500">{property.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Component */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <PeakSeasonCalendar roomTypeId={Number(roomTypeId)} />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
