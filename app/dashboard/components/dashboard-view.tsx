
'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface DashboardBooking {
  id: number;
  bookingCode: string;
  customerName: string | null;
  customerEmail: string | null;
  bookingDate: string;
  passengerCount: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string | null;
  totalPaid: number;
}

interface DashboardData {
  totalBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  latestBookings: DashboardBooking[];
}

const API_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_API_URL ||
  'http://localhost:5001/api/dashboard';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusInfo: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'Menunggu',
    color: 'bg-amber-100 text-amber-700',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'bg-emerald-100 text-emerald-700',
  },
  completed: {
    label: 'Selesai',
    color: 'bg-gray-100 text-gray-700',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-rose-100 text-rose-700',
  },
  refunded: {
    label: 'Dikembalikan',
    color: 'bg-purple-100 text-purple-700',
  },
};

export default function DashboardView() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(
          `Gagal mengambil data dashboard (${response.status})`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || 'Gagal mengambil data dashboard'
        );
      }

      setDashboard(result.data);
    } catch (err) {
      console.error('Dashboard API Error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mengambil data'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const totalBookings = dashboard?.totalBookings ?? 0;
  const totalCustomers = dashboard?.totalCustomers ?? 0;
  const totalRevenue = dashboard?.totalRevenue ?? 0;
  const pendingBookings = dashboard?.pendingBookings ?? 0;
  const confirmedBookings = dashboard?.confirmedBookings ?? 0;

  const otherBookings = Math.max(
    0,
    totalBookings - pendingBookings - confirmedBookings
  );

  const getPercentage = (value: number) =>
    totalBookings > 0
      ? (value / totalBookings) * 100
      : 0;

  const confirmedPercentage = getPercentage(confirmedBookings);
  const pendingPercentage = getPercentage(pendingBookings);
  const otherPercentage = getPercentage(otherBookings);

  const statusData = [
    {
      label: 'Dikonfirmasi',
      count: confirmedBookings,
      percentage: confirmedPercentage,
      color: 'bg-emerald-500',
      stroke: '#10b981',
    },
    {
      label: 'Menunggu',
      count: pendingBookings,
      percentage: pendingPercentage,
      color: 'bg-orange-500',
      stroke: '#f97316',
    },
    {
      label: 'Status lainnya',
      count: otherBookings,
      percentage: otherPercentage,
      color: 'bg-sky-500',
      stroke: '#0ea5e9',
    },
  ];

  const circumference = 100;
  let currentOffset = 0;

  const donutSegments = statusData.map((item) => {
    const segment = {
      ...item,
      offset: currentOffset,
    };

    currentOffset += item.percentage;

    return segment;
  });

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full font-sans bg-white min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">

        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0A64BC] tracking-tight">
            Selamat datang, Admin!
          </h1>

          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
            Berikut ringkasan aktivitas dan data terbaru di Marlibu Tour & Travel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] sm:text-xs text-gray-400 font-medium">
            {today}
          </span>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          <p className="font-semibold">Gagal memuat dashboard</p>
          <p className="mt-1">{error}</p>
          <p className="text-xs mt-2">
            Pastikan backend aktif dan URL API sudah benar.
          </p>
          <button
            onClick={fetchDashboard}
            className="mt-3 underline font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Total Booking */}
        <div className="bg-[#0A64BC] text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm">
          <span className="text-xs text-blue-100 font-medium">
            Total Booking
          </span>

          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {loading ? '...' : totalBookings.toLocaleString('id-ID')}
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              Total seluruh booking
            </p>
          </div>
        </div>

        {/* Total Pelanggan */}
        <div className="bg-[#FF6B00] text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm">
          <span className="text-xs text-orange-100 font-medium">
            Total Pelanggan
          </span>

          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {loading ? '...' : totalCustomers.toLocaleString('id-ID')}
            </h2>
            <p className="text-xs text-orange-200 mt-1">
              Data pelanggan terdaftar
            </p>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-[#30475E] text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm">
          <span className="text-xs text-gray-300 font-medium">
            Total Pendapatan
          </span>

          <div className="mt-3">
            <h2 className="text-xl sm:text-2xl font-extrabold">
              {loading ? '...' : formatCurrency(totalRevenue)}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              Pembayaran terverifikasi
            </p>
          </div>
        </div>

        {/* Booking Pending */}
        <div className="bg-white text-gray-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">
            Booking Menunggu
          </span>

          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A64BC]">
              {loading ? '...' : pendingBookings.toLocaleString('id-ID')}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Menunggu konfirmasi
            </p>
          </div>
        </div>

      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Booking Trend */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">

          <h3 className="text-sm font-bold text-gray-800">
            Tren Booking
          </h3>

          <div className="h-44 flex items-center justify-center text-center">
            <div>
              <p className="text-sm text-gray-400">
                Data tren booking belum tersedia.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Backend perlu menyediakan endpoint tren booking 7 hari terakhir.
              </p>
            </div>
          </div>

        </div>

        {/* Booking Status */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">

          <h3 className="text-sm font-bold text-gray-800">
            Status Booking
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-5">

            {/* Donut Chart */}
            <div className="relative w-28 h-28 shrink-0">

              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />

                {donutSegments.map((item) => (
                  <circle
                    key={item.label}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke={item.stroke}
                    strokeWidth="4"
                    strokeDasharray={`${item.percentage} ${circumference - item.percentage}`}
                    strokeDashoffset={-item.offset}
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-800">
                  {loading ? '...' : totalBookings}
                </span>
                <span className="text-[10px] text-gray-400">
                  Total
                </span>
              </div>

            </div>

            {/* Status List */}
            <div className="space-y-3 text-xs w-full">

              {statusData.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center gap-2"
                >
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    {item.label}
                  </span>

                  <span className="font-semibold text-gray-800">
                    {loading
                      ? '...'
                      : `${item.percentage.toFixed(1)}%`}
                  </span>
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Latest Bookings */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">

          <h3 className="text-sm font-bold text-gray-800 mb-4">
            Booking Terbaru
          </h3>

          <div className="overflow-x-auto w-full">

            <table className="w-full text-left text-xs whitespace-nowrap">

              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Kode Booking</th>
                  <th className="pb-3 pr-4 font-medium">Nama Pelanggan</th>
                  <th className="pb-3 pr-4 font-medium">Tanggal Booking</th>
                  <th className="pb-3 pr-4 font-medium">Penumpang</th>
                  <th className="pb-3 pr-4 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-gray-700">

                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Memuat data booking...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-red-400">
                      Data gagal dimuat.
                    </td>
                  </tr>
                ) : dashboard?.latestBookings?.length ? (
                  dashboard.latestBookings.map((item) => {
                    const status =
                      statusInfo[item.bookingStatus] || {
                        label: item.bookingStatus,
                        color: 'bg-gray-100 text-gray-700',
                      };

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">

                        <td className="py-3 pr-4 font-semibold text-gray-800">
                          {item.bookingCode}
                        </td>

                        <td className="py-3 pr-4">
                          <div className="font-medium">
                            {item.customerName || 'Pelanggan'}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {item.customerEmail || '-'}
                          </div>
                        </td>

                        <td className="py-3 pr-4 text-gray-500">
                          {formatDate(item.bookingDate)}
                        </td>

                        <td className="py-3 pr-4">
                          {item.passengerCount} orang
                        </td>

                        <td className="py-3 pr-4 font-medium">
                          {formatCurrency(item.totalAmount)}
                        </td>

                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Belum ada data booking.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Popular Routes */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">

          <h3 className="text-sm font-bold text-gray-800 mb-4">
            Rute Populer
          </h3>

          <div className="h-40 flex items-center justify-center text-center">
            <p className="text-xs text-gray-400">
              Data rute populer belum tersedia dari backend.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
