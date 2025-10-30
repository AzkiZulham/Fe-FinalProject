"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import ProtectedPage from "@/components/protectedPage";
import Modal from "@/components/modal/modal";

type RoomType = {
  id: number;
  roomName: string;
  price: number;
};

type PropertyCategory = {
  id: number;
  category: string;
};

type Property = {
  id: number;
  name: string;
  address: string;
  picture?: string;
  category?: PropertyCategory;
  roomTypes: RoomType[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TenantPropertyDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [searchInput, setSearchInput] = useState(""); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 6;
  const [total, setTotal] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); 
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchProperties();
  }, [searchQuery, selectedCategory, page]);


  const fetchCategories = async () => {
    try {
      const res = await axios.get<PropertyCategory[]>(
        `${API_URL}/api/properties/dashboard/categories`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Gagal fetch categories:", err);
    }
  };


  const fetchProperties = async () => {
    if (!token) return; 
    setLoading(true);
    try {
      const res = await axios.get<{ data: Property[]; total: number }>(
        `${API_URL}/api/properties/dashboard/my`,
        {
          params: {
            search: searchQuery,
            categoryId: selectedCategory || undefined, 
            page,
            perPage,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProperties(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Gagal fetch properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    setShowDeleteModal(false);
    setDeletingId(propertyToDelete.id);
    try {
      await axios.delete(`${API_URL}/api/properties/dashboard/${propertyToDelete.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setShowDeleteSuccessModal(true);
      fetchProperties();
    } catch (err) {
      console.error("Gagal hapus property:", err);
      setDeleteErrorMessage("Gagal menghapus property. Silakan coba lagi.");
      setShowDeleteErrorModal(true);
    } finally {
      setDeletingId(null);
      setPropertyToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  const handleDeleteSuccessClose = () => {
    setShowDeleteSuccessModal(false);
  };

  const handleDeleteErrorClose = () => {
    setShowDeleteErrorModal(false);
    setDeleteErrorMessage("");
  };


  const handleManualSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
      setPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / perPage);

  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg">Memuat properti Anda...</p>
      </div>
    );
  }

  return (
    <ProtectedPage role="TENANT">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Property List</h1>
                <p className="text-gray-600 text-sm sm:text-base">Kelola semua properti sewaan Anda di satu tempat</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Cari properti berdasarkan nama atau alamat..."
                      className="block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleManualSearch}
                    />
                    {/* Clear search button */}
                    {searchInput && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    {/* Loading indicator untuk search */}
                    {searchInput !== searchQuery && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Category Filter */}
                  <div className="relative flex-1 sm:flex-none min-w-0 sm:min-w-[200px]">
                    <select
                      className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors duration-200 appearance-none text-sm sm:text-base"
                      value={selectedCategory || ""}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value ? parseInt(e.target.value) : null);
                        setPage(1);
                      }}
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Results Count - Hidden on mobile, shown on sm and up */}
                <div className="hidden sm:block text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                  {total} properti ditemukan
                  {searchQuery && (
                    <span className="text-blue-600 ml-1">
                      untuk &quot;{searchQuery}&quot;
                    </span>
                  )}
                </div>
              </div>
              
              {/* Results Count for mobile */}
              <div className="sm:hidden mt-3 text-xs text-gray-500 bg-blue-50 px-2 py-1.5 rounded">
                {total} properti ditemukan
                {searchQuery && (
                  <span className="text-blue-600 ml-1">
                    untuk &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
              
              {/* Search Status */}
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                {searchInput !== searchQuery ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                    <span>Mencari...</span>
                  </div>
                ) : searchQuery ? (
                  <div className="flex items-center gap-2">
                    <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Menampilkan hasil pencarian</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Property Grid */}
          {properties.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-12 lg:p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {searchQuery ? "Tidak ada hasil ditemukan" : "Belum ada properti"}
                </h3>
                <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                  {searchQuery 
                    ? `Tidak ada properti yang sesuai dengan pencarian "${searchQuery}". Coba kata kunci lain atau hapus pencarian.`
                    : "Mulai dengan menambahkan properti pertama Anda dan kelola penyewaan dengan mudah."}
                </p>
                {searchQuery ? (
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hapus Pencarian
                  </button>
                ) : (
                  <Link
                    href="/tenant/dashboard/properties/add"
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-base sm:text-lg font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Properti Pertama
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                {properties.map((prop) => {
                  const minPrice = prop.roomTypes.length > 0
                    ? Math.min(...prop.roomTypes.map((r) => r.price))
                    : null;

                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:border-blue-200"
                    >
                      {/* Property Image */}
                      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {prop.picture ? (
                          <Image
                            src={
                              prop.picture?.startsWith("http")
                                ? prop.picture
                                : `${API_URL}/${prop.picture?.replace(/^\//, "")}`
                            }
                            alt={prop.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          />                      
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <svg className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/90 backdrop-blur-sm text-blue-700 shadow-sm border border-blue-200">
                            {prop.category?.category || "Tidak Berkategori"}
                          </span>
                        </div>
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-black/70 backdrop-blur-sm text-white">
                            {prop.roomTypes.length} tipe kamar
                          </span>
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
                          {prop.name}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                          {prop.address}
                        </p>

                        {/* Price & Room Info */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-100">
                          <div>
                            {minPrice !== null ? (
                              <p className="text-xl sm:text-2xl font-bold text-green-600">
                                Rp {minPrice.toLocaleString()}
                              </p>
                            ) : (
                              <p className="text-xs sm:text-sm text-gray-500">Belum ada harga</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Harga mulai
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base sm:text-lg font-semibold text-gray-900">
                              {prop.roomTypes.length}
                            </p>
                            <p className="text-xs text-gray-500">
                              Tipe Kamar
                            </p>
                          </div>
                        </div>

                        {/* Room Types List */}
                        {prop.roomTypes.length > 0 && (
                          <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-3 sm:mb-4">
                            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              </svg>
                              Daftar Tipe Kamar
                            </p>
                            <div className="space-y-1.5 sm:space-y-2 max-h-24 sm:max-h-32 overflow-y-auto pr-1 sm:pr-2">
                              {prop.roomTypes.map((room) => (
                                <div key={room.id} className="flex justify-between items-center text-xs sm:text-sm p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-150">
                                  <span className="text-gray-700 font-medium truncate mr-2">{room.roomName}</span>
                                  <span className="font-bold text-green-600 whitespace-nowrap">
                                    Rp {room.price.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                          <Link
                            href={`/tenant/dashboard/properties/edit/${prop.id}`}
                            className="flex-1 inline-flex items-center justify-center px-2 sm:px-4 py-2 sm:py-3 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(prop)}
                            disabled={deletingId === prop.id}
                            className="flex-1 inline-flex items-center justify-center px-2 sm:px-4 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                          >
                            {deletingId === prop.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 px-4 sm:px-6 py-4 sm:py-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Menampilkan <span className="font-semibold">{(page - 1) * perPage + 1}</span> -{" "}
                      <span className="font-semibold">
                        {Math.min(page * perPage, total)}
                      </span> dari{" "}
                      <span className="font-semibold">{total}</span> properti
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Sebelumnya</span>
                        <span className="sm:hidden">Prev</span>
                      </button>
                      <div className="flex gap-0.5 sm:gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200 ${
                              page === i + 1
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <span className="sm:hidden">Next</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={handleDeleteCancel}
        title="Konfirmasi Hapus Property"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Apakah Anda yakin ingin menghapus property <span className="font-semibold">&#34;{propertyToDelete?.name}&#34;</span>?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang permanen.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleDeleteCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Batal
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Hapus
          </button>
        </div>
      </Modal>

      {/* Delete Success Modal */}
      <Modal
        open={showDeleteSuccessModal}
        onClose={handleDeleteSuccessClose}
        title="Property Berhasil Dihapus"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Property <span className="font-semibold">&#34;{propertyToDelete?.name}&#34;</span> telah berhasil dihapus.
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleDeleteSuccessClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tutup
          </button>
        </div>
      </Modal>

      {/* Delete Error Modal */}
      <Modal
        open={showDeleteErrorModal}
        onClose={handleDeleteErrorClose}
        title="Gagal Menghapus Property"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">{deleteErrorMessage}</p>
          </div>
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleDeleteErrorClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </ProtectedPage>
  );
}
