
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Eye,
  Trash2,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
).replace(/\/+$/, '');

interface BookingHistory {
  idBooking: string;
  rute: string;
  tanggal: string;
  totalHarga: number;
  status: 'Selesai' | 'Proses' | 'Dibatalkan';
}

interface CustomerItem {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  totalBooking: number;
  riwayatBooking: BookingHistory[];
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || `Request gagal. HTTP ${response.status}`
    );
  }

  return result.data;
}

export default function CustomerTable() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerItem | null>(null);

  const [customerToDelete, setCustomerToDelete] =
    useState<CustomerItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // MENGAMBIL DATA PELANGGAN DARI BACKEND
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await apiRequest<any[]>('/customers');

      const mappedCustomers: CustomerItem[] = data.map(
        (customer: any) => ({
          id: String(customer.id),
          nama: customer.nama || '-',
          email: customer.email || '-',
          telepon: customer.telepon || '-',
          totalBooking: Number(customer.totalBooking ?? 0),
          riwayatBooking: Array.isArray(customer.riwayatBooking)
            ? customer.riwayatBooking.map((booking: any) => ({
                idBooking: booking.idBooking,
                rute: booking.rute || '-',
                tanggal: booking.tanggal || '-',
                totalHarga: Number(booking.totalHarga || 0),
                status: booking.status || 'Proses',
              }))
            : [],
        })
      );

      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Fetch customers error:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pelanggan'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // MEMANGGIL API SAAT HALAMAN DIBUKA
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // FILTER PENCARIAN
  const filteredCustomers = customers.filter((item) => {
    const keyword = searchTerm.toLowerCase();

    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.telepon.toLowerCase().includes(keyword)
    );
  });

  // PAGINATION
  const totalPages =
    Math.ceil(filteredCustomers.length / itemsPerPage) || 1;

  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // RESET HALAMAN KETIKA PENCARIAN BERUBAH
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // HAPUS PELANGGAN DARI DATABASE
  const handleDeleteConfirmed = async () => {
    if (!customerToDelete) return;

    try {
      setSaving(true);
      setErrorMessage('');

      await apiRequest(
        `/customers/${customerToDelete.id}`,
        { method: 'DELETE' }
      );

      setCustomerToDelete(null);
      setSelectedCustomer(null);

      await fetchCustomers();

    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal menghapus pelanggan'
      );
    } finally {
      setSaving(false);
    }
  };

  // WARNA STATUS BOOKING
  const bookingStatusColor = (status: string) => {
    if (status === 'Selesai') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }

    if (status === 'Proses') {
      return 'bg-amber-50 text-amber-600 border-amber-200';
    }

    return 'bg-red-50 text-red-600 border-red-200';
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">
            Data Pelanggan
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Kelola data pelanggan dan riwayat pemesanan.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex justify-start">
        <div className="relative w-full max-w-[380px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[42px] bg-white text-xs border border-gray-300 rounded-xl pl-10 pr-4 text-gray-700 shadow-sm outline-none focus:border-[#0A64BC] focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* TABEL PELANGGAN */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs whitespace-nowrap">

            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center text-gray-900 font-bold uppercase">
                  NO
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">
                  NAMA
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">
                  EMAIL
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">
                  NO. TELEPON
                </th>

                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase">
                  TOTAL BOOKING
                </th>

                <th className="py-3.5 px-4 text-center w-28 text-gray-900 font-bold uppercase">
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">

              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-red-500">
                    {errorMessage}
                  </td>
                </tr>
              ) : currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    {customers.length === 0
                      ? 'Belum ada data pelanggan.'
                      : 'Tidak ada data pelanggan yang ditemukan.'}
                  </td>
                </tr>
              ) : (
                currentCustomers.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 transition"
                  >
                    <td className="py-3.5 px-4 text-center text-gray-400 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {item.nama}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      {item.email}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      {item.telepon}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-[#0A64BC]">
                      {item.totalBooking}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">

                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(item)}
                          title="Lihat Detail"
                          className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(item)}
                          title="Hapus Pelanggan"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* FOOTER PAGINATION */}
        {!loading && !errorMessage && filteredCustomers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-3 text-xs text-gray-500">

            <div>
              Menampilkan{' '}
              <span className="font-semibold text-gray-800">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              {' '}sampai{' '}
              <span className="font-semibold text-gray-800">
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredCustomers.length
                )}
              </span>
              {' '}dari{' '}
              <span className="font-semibold text-gray-800">
                {filteredCustomers.length}
              </span>
              {' '}data pelanggan
            </div>

            <div className="flex items-center gap-1.5">

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              <div className="px-3 py-1.5 font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
                {currentPage} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 font-semibold cursor-pointer"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        )}

      </div>

      {/* MODAL DETAIL PELANGGAN */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-2xl space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Detail Pelanggan
                </h3>

                <p className="text-[11px] text-gray-400 mt-1">
                  Informasi profil dan riwayat pemesanan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PROFIL */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider">
                PROFIL PELANGGAN
              </p>

              <h3 className="font-bold text-gray-800 text-sm">
                {selectedCustomer.nama}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                <p>
                  Email:{' '}
                  <span className="font-medium text-gray-800">
                    {selectedCustomer.email}
                  </span>
                </p>

                <p>
                  Telepon:{' '}
                  <span className="font-medium text-gray-800">
                    {selectedCustomer.telepon}
                  </span>
                </p>

                <p className="sm:col-span-2">
                  Total Seluruh Pemesanan:{' '}
                  <span className="font-bold text-[#0A64BC]">
                    {selectedCustomer.totalBooking} Tiket
                  </span>
                </p>
              </div>
            </div>

            {/* RIWAYAT BOOKING */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider">
                RIWAYAT BOOKING TIKET
              </p>

              {selectedCustomer.riwayatBooking.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.riwayatBooking.map((booking) => (
                    <div
                      key={booking.idBooking}
                      className="border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#0A64BC]">
                            {booking.idBooking}
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bookingStatusColor(booking.status)}`}>
                            {booking.status === 'Selesai' ? (
                              <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            ) : booking.status === 'Proses' ? (
                              <Clock className="w-3 h-3 inline mr-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                            )}
                            {booking.status}
                          </span>
                        </div>

                        <p className="font-bold text-gray-800">
                          {booking.rute}
                        </p>

                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Tanggal: {booking.tanggal}
                        </p>
                      </div>

                      <div className="text-right flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                        <span className="text-[11px] text-gray-400">
                          Total Harga
                        </span>

                        <span className="font-bold text-gray-800">
                          Rp {Number(booking.totalHarga || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-400">
                  Pelanggan ini belum memiliki riwayat booking.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white rounded-xl font-semibold cursor-pointer transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-2xl">

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-gray-800">
              Hapus Data Pelanggan?
            </h3>

            <p className="text-xs text-gray-500">
              Apakah Anda yakin ingin menghapus pelanggan{' '}
              <strong className="text-gray-800">
                {customerToDelete.nama}
              </strong>
              {' '}dari daftar pelanggan?
            </p>

            {errorMessage && (
              <p className="text-xs text-red-500">{errorMessage}</p>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setCustomerToDelete(null);
                  setErrorMessage('');
                }}
                className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleDeleteConfirmed}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
