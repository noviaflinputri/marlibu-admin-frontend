
'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  Trash2,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

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

const initialCustomers: CustomerItem[] = [
  {
    id: '1',
    nama: 'Andi Pratama',
    email: 'andi@email.com',
    telepon: '0812 3456 7890',
    totalBooking: 5,
    riwayatBooking: [
      { idBooking: 'TRV001234', rute: 'Malang - Surabaya', tanggal: '12 Okt 2026', totalHarga: 500000, status: 'Selesai' },
      { idBooking: 'TRV001102', rute: 'Surabaya - Bali', tanggal: '01 Sep 2026', totalHarga: 750000, status: 'Selesai' },
      { idBooking: 'TRV000985', rute: 'Malang - Yogyakarta', tanggal: '15 Agu 2026', totalHarga: 600000, status: 'Selesai' },
    ],
  },
  {
    id: '2',
    nama: 'Siti Aisyah',
    email: 'siti@email.com',
    telepon: '0813 5678 9012',
    totalBooking: 3,
    riwayatBooking: [
      { idBooking: 'TRV001240', rute: 'Jakarta - Bandung', tanggal: '10 Okt 2026', totalHarga: 350000, status: 'Proses' },
      { idBooking: 'TRV001155', rute: 'Bandung - Semarang', tanggal: '20 Sep 2026', totalHarga: 450000, status: 'Selesai' },
    ],
  },
  {
    id: '3',
    nama: 'Budi Santoso',
    email: 'budi@email.com',
    telepon: '0821 2345 6789',
    totalBooking: 7,
    riwayatBooking: [
      { idBooking: 'TRV001211', rute: 'Surabaya - Malang', tanggal: '05 Okt 2026', totalHarga: 250000, status: 'Selesai' },
    ],
  },
  {
    id: '4',
    nama: 'Rina Lestari',
    email: 'rina@email.com',
    telepon: '0832 9876 5432',
    totalBooking: 2,
    riwayatBooking: [
      { idBooking: 'TRV001190', rute: 'Malang - Jakarta', tanggal: '28 Sep 2026', totalHarga: 850000, status: 'Selesai' },
    ],
  },
  {
    id: '5',
    nama: 'Dewi Anggraini',
    email: 'dewi@email.com',
    telepon: '0813 1112 1314',
    totalBooking: 4,
    riwayatBooking: [
      { idBooking: 'TRV001188', rute: 'Surabaya - Yogyakarta', tanggal: '25 Sep 2026', totalHarga: 400000, status: 'Selesai' },
    ],
  },
];

export default function CustomerTable() {
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerItem | null>(null);

  const filteredCustomers = customers.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.telepon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirmed = () => {
    if (customerToDelete) {
      setCustomers((prev) =>
        prev.filter((c) => c.id !== customerToDelete.id)
      );
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="w-full px-9 pt-10 pb-6 space-y-5 font-sans relative">

      {/* HEADER HALAMAN */}
      <div>
        <h1 className="text-[26px] font-bold text-[#0A64BC] tracking-tight">
          Data Pelanggan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola data pelanggan dan riwayat pemesanan.
        </p>
      </div>

      {/* SEARCH - POSISI KIRI */}
      <div className="flex justify-start">
        <div className="relative w-full max-w-[380px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[42px] bg-white text-sm border border-gray-200 rounded-xl pl-10 pr-4 text-gray-700 shadow-sm outline-none focus:border-[#0A64BC] focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* TABEL PELANGGAN */}
      <div className="w-full bg-white border border-[#A3A3A3] rounded-[20px] overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left">

            <thead>
              <tr className="h-[52px] border-b border-[#A3A3A3] text-[13px] font-bold text-gray-950">
                <th className="px-5 py-3 w-[6%]">NO</th>
                <th className="px-5 py-3 w-[21%]">NAMA</th>
                <th className="px-5 py-3 w-[21%]">EMAIL</th>
                <th className="px-5 py-3 w-[20%]">NO. TELEPON</th>
                <th className="px-5 py-3 w-[19%] text-center">
                  TOTAL BOOKING
                </th>
                <th className="px-5 py-3 w-[13%] text-center">
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-gray-600">

              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="h-[65px] border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      {idx + 1}
                    </td>

                    <td className="px-5 py-3 font-bold text-gray-900">
                      {item.nama}
                    </td>

                    <td className="px-5 py-3">
                      {item.email}
                    </td>

                    <td className="px-5 py-3">
                      {item.telepon}
                    </td>

                    <td className="px-5 py-3 text-center font-bold text-[#0A64BC]">
                      {item.totalBooking}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex justify-center items-center gap-3">

                        <button
                          onClick={() => setSelectedCustomer(item)}
                          title="Lihat Detail"
                          className="text-gray-400 hover:text-[#0A64BC] transition cursor-pointer"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>

                        <button
                          onClick={() => setCustomerToDelete(item)}
                          title="Hapus Pelanggan"
                          className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="h-[65px] text-center text-gray-400 text-sm"
                  >
                    Tidak ada data pelanggan yang ditemukan.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL PELANGGAN */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">

            <div className="bg-[#0A64BC] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">
                  Detail Pelanggan & Riwayat Booking
                </h2>
                <p className="text-xs text-blue-100 mt-1">
                  Informasi lengkap profil dan aktivitas pemesanan.
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-sm">

              {/* PROFIL */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
                <p className="text-xs font-bold text-gray-400 tracking-wider">
                  PROFIL PELANGGAN
                </p>

                <h3 className="font-bold text-gray-800 text-base">
                  {selectedCustomer.nama}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                  <p>
                    Email: <span className="font-medium text-gray-800">{selectedCustomer.email}</span>
                  </p>
                  <p>
                    Telepon: <span className="font-medium text-gray-800">{selectedCustomer.telepon}</span>
                  </p>
                  <p className="col-span-2">
                    Total Seluruh Pemesanan:{' '}
                    <span className="font-bold text-[#0A64BC]">
                      {selectedCustomer.totalBooking} Tiket
                    </span>
                  </p>
                </div>
              </div>

              {/* RIWAYAT BOOKING */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 tracking-wider">
                  RIWAYAT BOOKING TIKET
                </p>

                {selectedCustomer.riwayatBooking.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.riwayatBooking.map((booking, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#0A64BC]">
                              {booking.idBooking}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                                booking.status === 'Selesai'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : booking.status === 'Proses'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : 'bg-red-50 text-red-600 border border-red-200'
                              }`}
                            >
                              {booking.status === 'Selesai' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : booking.status === 'Proses' ? (
                                <Clock className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              {booking.status}
                            </span>
                          </div>

                          <p className="font-bold text-gray-800">
                            {booking.rute}
                          </p>

                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Tanggal: {booking.tanggal}
                          </p>
                        </div>

                        <div className="text-right flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                          <span className="text-xs text-gray-400">
                            Total Harga
                          </span>
                          <span className="font-bold text-gray-800">
                            Rp {booking.totalHarga.toLocaleString('id-ID')}
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
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-4">

            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                Hapus Data Pelanggan?
              </h3>

              <p className="text-sm text-gray-500">
                Apakah kamu yakin ingin menghapus{' '}
                <span className="font-bold text-gray-800">
                  {customerToDelete.nama}
                </span>{' '}
                dari daftar pelanggan? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
