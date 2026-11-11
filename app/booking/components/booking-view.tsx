
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export interface BookingItem {
  no: number;
  kodeBooking: string;
  namaPelanggan: string;
  rute: string;
  tanggalBerangkat: string;
  status:
    | 'Dikonfirmasi'
    | 'Menunggu'
    | 'Dalam Perjalanan'
    | 'Selesai'
    | 'Dibatalkan'
    | 'Dikembalikan';
  jumlahKursi?: number;
  totalHarga?: string;
}

interface BookingApi {
  id: number;
  booking_code: string;
  booking_datetime: string;
  passenger_count: number;
  total_amount: number | string;
  booking_status: string;
  customer_name: string | null;
  origin_city: string | null;
  destination_city: string | null;
  departure_datetime: string | null;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
).replace(/\/$/, '');

const mapBookingStatus = (
  status: string
): BookingItem['status'] => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'Dikonfirmasi';

    case 'pending':
      return 'Menunggu';

    case 'cancelled':
      return 'Dibatalkan';

    case 'completed':
      return 'Selesai';

    case 'refunded':
      return 'Dikembalikan';

    default:
      return 'Menunggu';
  }
};

const formatRupiah = (value: number | string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const mapBookingData = (
  booking: BookingApi,
  index: number
): BookingItem => ({
  no: index + 1,
  kodeBooking: booking.booking_code,
  namaPelanggan: booking.customer_name || '-',
  rute: `${booking.origin_city || '-'} - ${
    booking.destination_city || '-'
  }`,
  tanggalBerangkat: booking.departure_datetime
    ? String(booking.departure_datetime).slice(0, 10)
    : '-',
  status: mapBookingStatus(booking.booking_status),
  jumlahKursi: booking.passenger_count,
  totalHarga: formatRupiah(booking.total_amount),
});

export default function BookingView() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // State Filter dan Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRute, setSelectedRute] = useState('Semua Rute');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [filterDate, setFilterDate] = useState('');

  // Mengambil data booking dari backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const token = localStorage.getItem('admin_token');

        if (!token) {
          throw new Error(
            'Token login tidak ditemukan. Silakan login kembali.'
          );
        }

        const response = await fetch(`${API_URL}/api/bookings`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Gagal mengambil data booking.'
          );
        }

        const bookingData: BookingApi[] = result.data || [];

        setBookings(bookingData.map(mapBookingData));
      } catch (error) {
        console.error('Gagal mengambil booking:', error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat mengambil data booking.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Pilihan rute berdasarkan data dari backend
  const ruteOptions = Array.from(
    new Set(bookings.map((item) => item.rute))
  );

  // Filter dan pencarian booking
  const filteredBookings = bookings.filter((item) => {
    const matchQuery =
      item.kodeBooking
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.namaPelanggan
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.rute
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchRute =
      selectedRute === 'Semua Rute' ||
      item.rute === selectedRute;

    const matchStatus =
      selectedStatus === 'Semua Status' ||
      item.status === selectedStatus;

    const matchDate =
      !filterDate ||
      item.tanggalBerangkat === filterDate;

    return (
      matchQuery &&
      matchRute &&
      matchStatus &&
      matchDate
    );
  });

  // Warna Badge Status
  const getStatusBadge = (status: BookingItem['status']) => {
    switch (status) {
      case 'Dikonfirmasi':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';

      case 'Menunggu':
        return 'bg-amber-100 text-amber-700 border-amber-200';

      case 'Dalam Perjalanan':
        return 'bg-blue-100 text-blue-700 border-blue-200';

      case 'Selesai':
        return 'bg-gray-100 text-gray-700 border-gray-200';

      case 'Dibatalkan':
        return 'bg-red-100 text-red-700 border-red-200';

      case 'Dikembalikan':
        return 'bg-purple-100 text-purple-700 border-purple-200';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">
            Data Booking
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Kelola dan pantau semua pesanan travel.
          </p>
        </div>
      </div>

      {/* Filter dan Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-3 items-center justify-between">

        <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto">

          {/* Filter Tanggal */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-700 cursor-pointer"
          />

          {/* Filter Rute */}
          <select
            value={selectedRute}
            onChange={(e) => setSelectedRute(e.target.value)}
            className="text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-700 cursor-pointer"
          >
            <option value="Semua Rute">Semua Rute</option>

            {ruteOptions.map((rute) => (
              <option key={rute} value={rute}>
                {rute}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-700 cursor-pointer"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Dikonfirmasi">Dikonfirmasi</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Dalam Perjalanan">Dalam Perjalanan</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
            <option value="Dikembalikan">Dikembalikan</option>
          </select>

          {/* Reset Filter */}
          {(searchQuery ||
            selectedRute !== 'Semua Rute' ||
            selectedStatus !== 'Semua Status' ||
            filterDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRute('Semua Rute');
                setSelectedStatus('Semua Status');
                setFilterDate('');
              }}
              className="text-xs text-red-500 hover:underline font-semibold px-2 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Input Pencarian */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking, nama, rute..."
            className="text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] w-full sm:w-64 text-gray-700"
          />

          <button
            type="button"
            onClick={() => setSearchQuery(searchQuery.trim())}
            className="px-4 py-2 bg-[#0A64BC] text-white font-semibold text-xs rounded-xl hover:bg-[#08529B] transition cursor-pointer"
          >
            Cari
          </button>
        </div>
      </div>

      {/* Tabel Data Booking */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">

            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 text-center w-12 text-gray-900 font-bold uppercase tracking-wider">
                  NO
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  KODE BOOKING
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  NAMA PELANGGAN
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  RUTE
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  TANGGAL BERANGKAT
                </th>

                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase tracking-wider">
                  STATUS
                </th>

                <th className="py-3.5 px-4 text-center w-24 text-gray-900 font-bold uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">

              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-400"
                  >
                    Sedang mengambil data booking...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-red-500"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((item, index) => (
                  <tr
                    key={item.kodeBooking}
                    className="hover:bg-gray-50/60 transition"
                  >
                    <td className="py-3.5 px-4 text-center text-gray-400 font-medium">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {item.kodeBooking}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {item.namaPelanggan}
                    </td>

                    <td className="py-3.5 px-4 text-[#0A64BC] font-medium">
                      {item.rute}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {item.tanggalBerangkat}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/booking/${item.kodeBooking}`}
                          className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition"
                          title="Lihat Detail Booking"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-400 font-medium"
                  >
                    {bookings.length === 0
                      ? 'Belum ada data booking dari pengguna aplikasi mobile.'
                      : `Tidak ada data booking yang sesuai dengan pencarian "${searchQuery}".`}
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
