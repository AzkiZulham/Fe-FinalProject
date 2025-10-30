"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  Edit,
  Trash2,
  Bed,
  MapPin,
  Building,
  Filter,
  Search,
  Users,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Star,
  Wifi,
  Car,
  Coffee,
  Eye,
  Plus,
} from "lucide-react";
import Select, { SingleValue } from "react-select";

interface RoomType {
  id: number;
  roomName: string;
  price: number;
  description?: string;
  roomImg?: string;
  capacity?: number;
  size?: string;
  amenities?: string[];
  property: {
    id: number;
    name: string;
    location: string;
  };
}

interface Property {
  id: number;
  name: string;
  location: string;
}

interface OptionType {
  value: number | "";
  label: string;
}

export default function RoomListPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [groupedRooms, setGroupedRooms] = useState<Record<number, RoomType[]>>({});
  const [filteredGroupedRooms, setFilteredGroupedRooms] = useState<Record<number, RoomType[]>>({});
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roomsRes = await axios.get(`${API_URL}/api/rooms`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const allRooms = roomsRes.data.rooms || [];
        setRooms(allRooms);

        const grouped = allRooms.reduce((acc: Record<number, RoomType[]>, room: RoomType) => {
          const propId = room.property.id;
          if (!acc[propId]) acc[propId] = [];
          acc[propId].push(room);
          return acc;
        }, {});
        setGroupedRooms(grouped);
        setFilteredGroupedRooms(grouped);

        const uniqueProperties = Array.from(
          new Set(allRooms.map((room: RoomType) => room.property.id))
        )
          .map(
            (propId) =>
              allRooms.find((room: RoomType) => room.property.id === propId)?.property
          )
          .filter(Boolean) as Property[];
        setProperties(uniqueProperties);
      } catch (err) {
        console.error("Failed to load data:", err);
        alert("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL, token]);

  useEffect(() => {
    let filtered = { ...groupedRooms };

    if (selectedPropertyId !== null) {
      filtered = Object.keys(groupedRooms)
        .filter((propId) => Number(propId) === selectedPropertyId)
        .reduce((acc, propId) => {
          acc[Number(propId)] = groupedRooms[Number(propId)];
          return acc;
        }, {} as Record<number, RoomType[]>);
    }

    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = Object.keys(filtered).reduce((acc, propId) => {
        const filteredRooms = filtered[Number(propId)].filter(
          (room) =>
            room.roomName.toLowerCase().includes(searchLower) ||
            room.property.name.toLowerCase().includes(searchLower) ||
            room.description?.toLowerCase().includes(searchLower)
        );
        if (filteredRooms.length > 0) acc[Number(propId)] = filteredRooms;
        return acc;
      }, {} as Record<number, RoomType[]>);
    }

    setFilteredGroupedRooms(filtered);
    setCurrentPage(1);
  }, [selectedPropertyId, searchTerm, groupedRooms]);

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Yakin ingin menghapus kamar ini?")) return;

    setDeletingId(roomId);
    try {
      await axios.delete(`${API_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to delete room:", err);
      alert("Gagal menghapus kamar");
    } finally {
      setDeletingId(null);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return <Wifi className="w-3 h-3" />;
    if (lower.includes("parkir") || lower.includes("car")) return <Car className="w-3 h-3" />;
    if (lower.includes("breakfast") || lower.includes("kopi")) return <Coffee className="w-3 h-3" />;
    return <Star className="w-3 h-3" />;
  };

  const allFilteredRooms = Object.values(filteredGroupedRooms).flat();
  const totalPages = Math.ceil(allFilteredRooms.length / itemsPerPage);
  const paginatedRooms = allFilteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat data kamar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daftar Kamar</h1>
              <p className="text-gray-600 text-sm sm:text-base">Kelola semua kamar di properti Anda</p>
            </div>
            <button
              onClick={() => router.push("/tenant/dashboard/rooms/create")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 w-full sm:w-auto bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Tambah Kamar
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama kamar, properti, atau deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter Properti */}
            <div className="w-full sm:w-64 flex items-center gap-2 relative">
              <Filter className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <Select<OptionType, false>
                  options={[
                    { value: "", label: "Semua Properti" },
                    ...properties.map((p) => ({
                      value: p.id,
                      label: `${p.name}`
                    })),
                  ]}
                  value={
                    selectedPropertyId
                      ? {
                          value: selectedPropertyId,
                          label: `${properties.find((p) => p.id === selectedPropertyId)?.name} - ${
                            properties.find((p) => p.id === selectedPropertyId)
                          }`,
                        }
                      : { value: "", label: "Semua Properti" }
                  }
                  onChange={(selected: SingleValue<OptionType>) =>
                    setSelectedPropertyId(selected?.value ? Number(selected.value) : null)
                  }
                  placeholder="Pilih Properti"
                  isSearchable
                  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      fontSize: "14px",
                      width: "100%",
                    }),
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
                      borderRadius: "0.5rem",
                      boxShadow: state.isFocused ? "0 0 0 2px #2563eb40" : "none",
                      "&:hover": { borderColor: "#2563eb" },
                      backgroundColor: "#fff",
                      minHeight: "42px",
                      fontSize: "14px",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#9ca3af",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#111827",
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
       {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {[
            { icon: Building, label: "Total Properti", value: properties.length, color: "blue" },
            { icon: Bed, label: "Total Kamar", value: rooms.length, color: "green" },
            { icon: Eye, label: "Kamar Ditampilkan", value: allFilteredRooms.length, color: "purple" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4"
            >
              <div className={`p-3 bg-${item.color}-100 rounded-lg`}>
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Room Cards */}
        {paginatedRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Search className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-4">Tidak ada kamar ditemukan.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedPropertyId(null);
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {paginatedRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  <div className="relative h-48 bg-gray-100">
                    {room.roomImg ? (
                      <Image
                        src={
                          room.roomImg.startsWith("http")
                            ? room.roomImg
                            : `${API_URL}${room.roomImg}`
                        }
                        alt={room.roomName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200">
                        <Bed className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">
                      Rp {room.price.toLocaleString()}
                    </div>
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {room.property.name}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
                      {room.roomName}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {room.description || "Tidak ada deskripsi"}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{room.property.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                      {room.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{room.capacity} org</span>
                        </div>
                      )}
                      {room.size && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          <span>{room.size}</span>
                        </div>
                      )}
                    </div>
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {room.amenities.slice(0, 3).map((a, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600"
                          >
                            {getAmenityIcon(a)}
                            <span>{a}</span>
                          </div>
                        ))}
                        {room.amenities.length > 3 && (
                          <div className="bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                            +{room.amenities.length - 3} lainnya
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() =>
                          router.push(
                            `/tenant/dashboard/rooms/edit/${room.id}?propertyId=${room.property.id}`
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        disabled={deletingId === room.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === room.id ? (
                          <div className="animate-spin h-3 w-3 border-2 border-red-700 border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" /> Hapus
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Sebelumnya
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded text-sm font-medium transition ${
                      currentPage === p
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                >
                  Selanjutnya <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal Sukses */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Berhasil!</h3>
              <p className="text-gray-600 text-sm mb-4">Kamar berhasil dihapus.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
