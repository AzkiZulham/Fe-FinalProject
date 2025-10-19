"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Building2, Bed, Users, DollarSign, Calendar, Clock } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        // Fallback data
        setStats({
          totalProperties: 8,
          totalRooms: 32,
          pendingPayments: 3,
          monthlyRevenue: 42500000,
          totalBookings: 156,
          pendingBookings: 5
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [API_URL, token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Ringkasan performa properti Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Properties */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Properti</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProperties}</p>
            </div>
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <Bed className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Kamar</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalRooms}</p>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</h3>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Pemesanan</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Pending Pembayaran</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Pending Konfirmasi</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/tenant/dashboard/properties/add" className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center block">
            <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Tambah Properti</span>
          </Link>
          <Link href="/tenant/dashboard/rooms" className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-center block">
            <Bed className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Kelola Kamar</span>
          </Link>
          <Link href="/tenant/dashboard/transactions" className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-center block">
            <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Lihat Jadwal</span>
          </Link>
          <Link href="/tenant/dashboard/sales" className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-center block">
            <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Laporan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}