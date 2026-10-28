'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export interface PromoItem {
  id: string;
  kodePromo: string;
  namaPromo: string;
  diskon: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  kuotaPenggunaan: number;
  status: 'Aktif' | 'Kadaluarsa' | 'Nonaktif';
}

const initialPromos: PromoItem[] = [
  {
    id: 'PRM-001',
    kodePromo: 'MARLIBUASIK',
    namaPromo: 'Promo Liburan Seru Oktober',
    diskon: '20% (Max Rp 50.000)',
    tanggalMulai: '2026-10-01',
    tanggalSelesai: '2026-10-31',
    kuotaPenggunaan: 45,
    status: 'Aktif',
  },
  {
    id: 'PRM-002',
    kodePromo: 'HEBATMALANG',
    namaPromo: 'Diskon Spesial Rute Malang',
    diskon: 'Rp 25.000',
    tanggalMulai: '2026-10-10',
    tanggalSelesai: '2026-10-25',
    kuotaPenggunaan: 12,
    status: 'Aktif',
  },
  {
    id: 'PRM-003',
    kodePromo: 'USERBARU',
    namaPromo: 'Voucher Pelanggan Pertama',
    diskon: '15%',
    tanggalMulai: '2026-01-01',
    tanggalSelesai: '2026-12-31',
    kuotaPenggunaan: 120,
    status: 'Aktif',
  },
  {
    id: 'PRM-004',
    kodePromo: 'MUDIKASIK',
    namaPromo: 'Promo Mudik Musim Panas',
    diskon: '30%',
    tanggalMulai: '2026-06-01',
    tanggalSelesai: '2026-06-30',
    kuotaPenggunaan: 200,
    status: 'Kadaluarsa',
  },
];

export default function PromoView() {
  const [promos, setPromos] = useState<PromoItem[]>(initialPromos);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoItem | null>(null);

  // Form State Tambah Promo
  const [newPromo, setNewPromo] = useState({
    kodePromo: '',
    namaPromo: '',
    diskon: '',
    tanggalMulai: '2026-10-01',
    tanggalSelesai: '2026-10-31',
    kuotaPenggunaan: 50,
    status: 'Aktif' as PromoItem['status'],
  });

  const handleDelete = (id: string, kode: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus promo ${kode}?`)) {
      setPromos(promos.filter((p) => p.id !== id));
    }
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `PRM-${String(promos.length + 1).padStart(3, '0')}`;
    const itemToAdd: PromoItem = {
      id: nextId,
      kodePromo: newPromo.kodePromo.toUpperCase(),
      namaPromo: newPromo.namaPromo,
      diskon: newPromo.diskon,
      tanggalMulai: newPromo.tanggalMulai,
      tanggalSelesai: newPromo.tanggalSelesai,
      kuotaPenggunaan: Number(newPromo.kuotaPenggunaan) || 50,
      status: newPromo.status,
    };
    setPromos([itemToAdd, ...promos]);
    setIsAdding(false);
    setNewPromo({
      kodePromo: '',
      namaPromo: '',
      diskon: '',
      tanggalMulai: '2026-10-01',
      tanggalSelesai: '2026-10-31',
      kuotaPenggunaan: 50,
      status: 'Aktif',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setPromos(promos.map((p) => (p.id === editingItem.id ? editingItem : p)));
    setEditingItem(null);
  };

  const getStatusBadge = (status: PromoItem['status']) => {
    switch (status) {
      case 'Aktif':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Kadaluarsa':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Nonaktif':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Manajemen Promo & Diskon</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola kode voucher, potongan harga, dan periode promo travel.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          + Tambah Promo
        </button>
      </div>

      {/* Tabel Promo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-400 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Kode Promo</th>
                <th className="py-3.5 px-4">Nama Promo</th>
                <th className="py-3.5 px-4">Besaran Diskon</th>
                <th className="py-3.5 px-4">Periode Berlaku</th>
                <th className="py-3.5 px-4 text-center">Penggunaan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {promos.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 font-medium text-gray-400">{item.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#0A64BC] font-mono font-bold rounded-lg border border-blue-100">
                      {item.kodePromo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{item.namaPromo}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{item.diskon}</td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {item.tanggalMulai} s/d {item.tanggalSelesai}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                    {item.kuotaPenggunaan}x
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Promo"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.kodePromo)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Hapus Promo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Promo */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gray-800">Tambah Promo Baru</h3>
            <form onSubmit={handleAddPromo} className="space-y-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kode Promo</label>
                <input
                  type="text"
                  value={newPromo.kodePromo}
                  onChange={(e) => setNewPromo({ ...newPromo, kodePromo: e.target.value })}
                  placeholder="Contoh: LIBURANSERU"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] uppercase"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Nama Promo</label>
                <input
                  type="text"
                  value={newPromo.namaPromo}
                  onChange={(e) => setNewPromo({ ...newPromo, namaPromo: e.target.value })}
                  placeholder="Contoh: Diskon Akhir Tahun"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Besaran Diskon</label>
                  <input
                    type="text"
                    value={newPromo.diskon}
                    onChange={(e) => setNewPromo({ ...newPromo, diskon: e.target.value })}
                    placeholder="20% / Rp 20.000"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Status</label>
                  <select
                    value={newPromo.status}
                    onChange={(e) => setNewPromo({ ...newPromo, status: e.target.value as PromoItem['status'] })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Periode Kalender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={newPromo.tanggalMulai}
                    onChange={(e) => setNewPromo({ ...newPromo, tanggalMulai: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={newPromo.tanggalSelesai}
                    onChange={(e) => setNewPromo({ ...newPromo, tanggalSelesai: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
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

      {/* Modal Edit Promo */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gray-800">Edit Promo ({editingItem.kodePromo})</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kode Promo</label>
                <input
                  type="text"
                  value={editingItem.kodePromo}
                  onChange={(e) => setEditingItem({ ...editingItem, kodePromo: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] uppercase"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Nama Promo</label>
                <input
                  type="text"
                  value={editingItem.namaPromo}
                  onChange={(e) => setEditingItem({ ...editingItem, namaPromo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Besaran Diskon</label>
                  <input
                    type="text"
                    value={editingItem.diskon}
                    onChange={(e) => setEditingItem({ ...editingItem, diskon: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as PromoItem['status'] })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Kadaluarsa">Kadaluarsa</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Periode Kalender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={editingItem.tanggalMulai}
                    onChange={(e) => setEditingItem({ ...editingItem, tanggalMulai: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={editingItem.tanggalSelesai}
                    onChange={(e) => setEditingItem({ ...editingItem, tanggalSelesai: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}