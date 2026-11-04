'use client';

import React, { useState } from 'react';
import { Search, Eye, Trash2, X, Calendar, CheckCircle2, Clock } from 'lucide-react';

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

  const filteredCustomers = customers.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.telepon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-2 px-4 md:px-6 pb-6 space-y-5 w-full font-sans max-w-7xl mx-auto relative">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0A64BC] tracking-tight">Data Pelanggan</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Kelola data pelanggan dan riwayat pemesanan.
          </p>
        </div>
      </div>

      {/* Tabel Data Pelanggan */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A64BC]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400">
                <th className="py-3 px-3">NO</th>
                <th className="py-3 px-3">NAMA</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3">NO. TELEPON</th>
                <th className="py-3 px-3 text-center">TOTAL BOOKING</th>
                <th className="py-3 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-3 text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3.5 px-3 font-bold text-gray-800">{item.nama}</td>
                    <td className="py-3.5 px-3 text-gray-600">{item.email}</td>
                    <td className="py-3.5 px-3 text-gray-600">{item.telepon}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-[#0A64BC]">{item.totalBooking}</td>
                    <td className="py-3.5 px-3 text-right space-x-1">
                      {/* Tombol Ikon Mata (Netral Abu-abu) */}
                      <button
                        onClick={() => setSelectedCustomer(item)}
                        title="Lihat Detail & Riwayat Booking"
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer inline-flex items-center"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Tombol Hapus (Netral Abu-abu dengan hover merah) */}
                      <button
                        title="Hapus Pelanggan"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition cursor-pointer inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400 text-xs">
                    Tidak ada data pelanggan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Pelanggan & Riwayat Booking */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="bg-[#0A64BC] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Detail Pelanggan & Riwayat Booking</h2>
                <p className="text-[11px] text-blue-100">Informasi lengkap profil dan aktivitas pemesanan.</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten Modal */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Informasi Profil */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-gray-400 tracking-wider">PROFIL PELANGGAN</p>
                <h3 className="font-bold text-gray-800 text-sm">{selectedCustomer.nama}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-gray-600 pt-1">
                  <p>✉️ Email: <span className="font-medium text-gray-800">{selectedCustomer.email}</span></p>
                  <p>📞 Telepon: <span className="font-medium text-gray-800">{selectedCustomer.telepon}</span></p>
                  <p className="col-span-2">🎫 Total Seluruh Pemesanan: <span className="font-bold text-[#0A64BC]">{selectedCustomer.totalBooking} Tiket</span></p>
                </div>
              </div>

              {/* Daftar Riwayat Booking */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 tracking-wider">RIWAYAT BOOKING TIKET</p>
                {selectedCustomer.riwayatBooking.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.riwayatBooking.map((booking, index) => (
                      <div key={index} className="border border-gray-200 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white shadow-2xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0A64BC]">{booking.idBooking}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1 ${
                              booking.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {booking.status === 'Selesai' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {booking.status}
                            </span>
                          </div>
                          <p className="font-bold text-gray-800 text-xs">🚌 {booking.rute}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Tanggal: {booking.tanggal}
                          </p>
                        </div>
                        <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 flex sm:flex-col justify-between items-center sm:items-end">
                          <span className="text-[10px] text-gray-400">Total Harga</span>
                          <span className="font-extrabold text-gray-800 text-xs">Rp {booking.totalHarga.toLocaleString('id-ID')}</span>
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

            {/* Footer Modal */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}