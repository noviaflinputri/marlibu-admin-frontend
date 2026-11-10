'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Trash2, AlertTriangle } from 'lucide-react';

export interface BookingItem {
  no: number;
  kodeBooking: string;
  namaPelanggan: string;
  rute: string;
  tanggalBerangkat: string;
  status: 'Dikonfirmasi' | 'Menunggu' | 'Dalam Perjalanan' | 'Selesai' | 'Dibatalkan';
  jumlahKursi?: number;
  totalHarga?: string;
}

const initialBookings: BookingItem[] = [
  {
    no: 1,
    kodeBooking: 'TRV001234',
    namaPelanggan: 'Andi Pratama',
    rute: 'Malang - Surabaya',
    tanggalBerangkat: '2026-10-13',
    status: 'Dikonfirmasi',
    jumlahKursi: 2,
    totalHarga: 'Rp 300.000',
  },
  {
    no: 2,
    kodeBooking: 'TRV001233',
    namaPelanggan: 'Siti Aisyah',
    rute: 'Jakarta - Bandung',
    tanggalBerangkat: '2026-10-14',
    status: 'Menunggu',
    jumlahKursi: 1,
    totalHarga: 'Rp 200.000',
  },
  {
    no: 3,
    kodeBooking: 'TRV001232',
    namaPelanggan: 'Budi Santoso',
    rute: 'Yogyakarta - Jakarta',
    tanggalBerangkat: '2026-10-14',
    status: 'Dalam Perjalanan',
    jumlahKursi: 3,
    totalHarga: 'Rp 1.050.000',
  },
  {
    no: 4,
    kodeBooking: 'TRV001231',
    namaPelanggan: 'Rina Lestari',
    rute: 'Surabaya - Bali',
    tanggalBerangkat: '2026-10-15',
    status: 'Dikonfirmasi',
    jumlahKursi: 2,
    totalHarga: 'Rp 700.000',
  },
  {
    no: 5,
    kodeBooking: 'TRV001230',
    namaPelanggan: 'Dewi Anggraini',
    rute: 'Bandung - Malang',
    tanggalBerangkat: '2026-10-16',
    status: 'Selesai',
    jumlahKursi: 1,
    totalHarga: 'Rp 250.000',
  },
];

const ruteOptions = [
  'Malang - Surabaya',
  'Jakarta - Bandung',
  'Yogyakarta - Jakarta',
  'Surabaya - Bali',
  'Bandung - Malang',
];

export default function BookingView() {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [isAdding, setIsAdding] = useState(false);

  // State untuk Modal Hapus Modern UI
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    kodeBooking: string;
    namaPelanggan: string;
  }>({
    isOpen: false,
    kodeBooking: '',
    namaPelanggan: '',
  });

  // State untuk Filter & Search Input
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRute, setSelectedRute] = useState('Semua Rute');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [filterDate, setFilterDate] = useState('');

  // Form State Tambah Booking Baru
  const [newBooking, setNewBooking] = useState({
    namaPelanggan: '',
    rute: ruteOptions[0],
    tanggalBerangkat: '2026-10-17',
    jumlahKursi: 1,
    totalHarga: 'Rp 150.000',
    status: 'Dikonfirmasi' as BookingItem['status'],
  });

  // Handler Validasi Input Nama (Hanya Huruf & Spasi)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^a-zA-Z\s]/g, '');
    setNewBooking({ ...newBooking, namaPelanggan: cleanValue });
  };

  // Handler Validasi Input Harga (Hanya Angka & Otomatis Format Rupiah)
  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const rawNumber = value.replace(/\D/g, '');

    if (!rawNumber) {
      setNewBooking({ ...newBooking, totalHarga: '' });
      return;
    }

    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(rawNumber));

    setNewBooking({ ...newBooking, totalHarga: formatted });
  };

  // Logika Pemfilteran Data
  const filteredBookings = bookings.filter((item) => {
    const matchQuery =
      item.kodeBooking.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaPelanggan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rute.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRute =
      selectedRute === 'Semua Rute' || item.rute === selectedRute;

    const matchStatus =
      selectedStatus === 'Semua Status' || item.status === selectedStatus;

    const matchDate =
      !filterDate || item.tanggalBerangkat === filterDate;

    return matchQuery && matchRute && matchStatus && matchDate;
  });

  // Function Trigger Modal Hapus
  const handleDeleteClick = (kodeBooking: string, namaPelanggan: string) => {
    setDeleteModal({
      isOpen: true,
      kodeBooking,
      namaPelanggan,
    });
  };

  // Function Eksekusi Hapus Data
  const confirmDelete = () => {
    setBookings(bookings.filter((item) => item.kodeBooking !== deleteModal.kodeBooking));
    setDeleteModal({ isOpen: false, kodeBooking: '', namaPelanggan: '' });
  };

  // Function Tambah Booking Baru
  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNumber = 1235 + bookings.length;
    const newKode = `TRV00${nextNumber}`;

    const itemToAdd: BookingItem = {
      no: bookings.length + 1,
      kodeBooking: newKode,
      namaPelanggan: newBooking.namaPelanggan,
      rute: newBooking.rute,
      tanggalBerangkat: newBooking.tanggalBerangkat,
      status: newBooking.status,
      jumlahKursi: Number(newBooking.jumlahKursi),
      totalHarga: newBooking.totalHarga,
    };

    setBookings([itemToAdd, ...bookings]);
    setIsAdding(false);
    setNewBooking({
      namaPelanggan: '',
      rute: ruteOptions[0],
      tanggalBerangkat: '2026-10-17',
      jumlahKursi: 1,
      totalHarga: 'Rp 150.000',
      status: 'Dikonfirmasi',
    });
  };

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
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Data Booking</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola dan pantau semua pesanan travel.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          + Booking Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
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
            <option>Semua Rute</option>
            {ruteOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-700 cursor-pointer"
          >
            <option>Semua Status</option>
            <option value="Dikonfirmasi">Dikonfirmasi</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Dalam Perjalanan">Dalam Perjalanan</option>
            <option value="Selesai">Selesai</option>
          </select>

          {/* Tombol Reset Filter */}
          {(searchQuery || selectedRute !== 'Semua Rute' || selectedStatus !== 'Semua Status' || filterDate) && (
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

        {/* Input Pencarian Text */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking, nama, rute..."
            className="text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] w-full sm:w-64 text-gray-700"
          />
          <button className="px-4 py-2 bg-[#0A64BC] text-white font-semibold text-xs rounded-xl hover:bg-[#08529B] transition cursor-pointer">
            Cari
          </button>
        </div>
      </div>

      {/* Tabel Data Booking - Header Hitam Bold Capslock (Uppercase) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 text-center w-12 text-gray-900 font-bold uppercase tracking-wider">NO</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">KODE BOOKING</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">NAMA PELANGGAN</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">RUTE</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">TANGGAL BERANGKAT</th>
                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase tracking-wider">STATUS</th>
                <th className="py-3.5 px-4 text-center w-24 text-gray-900 font-bold uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((item, index) => (
                  <tr key={item.kodeBooking} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.kodeBooking}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">{item.namaPelanggan}</td>
                    <td className="py-3.5 px-4 text-[#0A64BC] font-medium">{item.rute}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.tanggalBerangkat}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
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
                        <button
                          onClick={() => handleDeleteClick(item.kodeBooking, item.namaPelanggan)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-medium">
                    Tidak ada data booking yang sesuai dengan pencarian "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Booking Baru */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gray-800">Tambah Booking Baru</h3>
            <form onSubmit={handleAddBooking} className="space-y-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={newBooking.namaPelanggan}
                  onChange={handleNameChange}
                  placeholder="Contoh: Andi Pratama"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
                <p className="text-[10px] text-gray-400 mt-1">* Hanya dapat diisi huruf dan spasi.</p>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Rute Travel</label>
                <select
                  value={newBooking.rute}
                  onChange={(e) => setNewBooking({ ...newBooking, rute: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {ruteOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Berangkat</label>
                  <input
                    type="date"
                    value={newBooking.tanggalBerangkat}
                    onChange={(e) => setNewBooking({ ...newBooking, tanggalBerangkat: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Jumlah Kursi</label>
                  <input
                    type="number"
                    value={newBooking.jumlahKursi}
                    onChange={(e) => setNewBooking({ ...newBooking, jumlahKursi: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Total Harga</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newBooking.totalHarga}
                    onChange={handleHargaChange}
                    placeholder="Contoh: 150000"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">* Masukkan angka saja (otomatis ke format Rp).</p>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Status</label>
                  <select
                    value={newBooking.status}
                    onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value as BookingItem['status'] })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  >
                    <option value="Dikonfirmasi">Dikonfirmasi</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] cursor-pointer shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus UI Modern */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">Hapus Data Booking?</h3>
              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin menghapus data booking <strong>"{deleteModal.kodeBooking}"</strong> ({deleteModal.namaPelanggan})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, kodeBooking: '', namaPelanggan: '' })}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition cursor-pointer shadow-xs"
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