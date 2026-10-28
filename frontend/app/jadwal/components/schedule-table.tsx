'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export interface ScheduleItem {
  id: string;
  tanggal: string;
  rute: string;
  waktu: string;
  transportasi: string;
  harga: string;
  kuotaTersedia: number;
  totalKuota: number;
  status: 'Tersedia' | 'Hampir Penuh' | 'Penuh' | 'Selesai';
}

const initialSchedules: ScheduleItem[] = [
  {
    id: 'SCH-001',
    tanggal: '2026-10-14',
    rute: 'Jakarta - Yogyakarta',
    waktu: '12:38',
    transportasi: 'Innova Reborn',
    harga: 'Rp 150.000',
    kuotaTersedia: 5,
    totalKuota: 7,
    status: 'Tersedia',
  },
  {
    id: 'SCH-002',
    tanggal: '2026-10-17',
    rute: 'Malang - Surabaya',
    waktu: '06:00',
    transportasi: 'Toyota HiAce Premio',
    harga: 'Rp 150.000',
    kuotaTersedia: 2,
    totalKuota: 11,
    status: 'Hampir Penuh',
  },
  {
    id: 'SCH-003',
    tanggal: '2026-10-18',
    rute: 'Surabaya - Malang',
    waktu: '10:00',
    transportasi: 'Avanza Veloz',
    harga: 'Rp 130.000',
    kuotaTersedia: 1,
    totalKuota: 6,
    status: 'Hampir Penuh',
  },
];

const armadaOptions = [
  'Innova Reborn',
  'Toyota HiAce Premio',
  'Toyota HiAce Commuter',
  'Avanza Veloz',
  'Isuzu Elf Long',
];

export default function ScheduleTable() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State Tambah Jadwal Baru
  const [newSchedule, setNewSchedule] = useState({
    rute: 'Jakarta - Yogyakarta',
    tanggal: '2026-10-14',
    waktu: '12:38',
    harga: 'Rp 150.000',
    transportasi: 'Innova Reborn',
    totalKuota: 7,
  });

  const handleDelete = (id: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus jadwal ${id}?`)) {
      setSchedules(schedules.filter((item) => item.id !== id));
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSchedules(schedules.map((s) => (s.id === editingItem.id ? editingItem : s)));
    setEditingItem(null);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const nextIdNumber = schedules.length + 1;
    const newId = `SCH-${String(nextIdNumber).padStart(3, '0')}`;
    const kuota = Number(newSchedule.totalKuota) || 7;

    const itemToAdd: ScheduleItem = {
      id: newId,
      rute: newSchedule.rute,
      tanggal: newSchedule.tanggal,
      waktu: newSchedule.waktu,
      harga: newSchedule.harga,
      transportasi: newSchedule.transportasi,
      kuotaTersedia: kuota,
      totalKuota: kuota,
      status: 'Tersedia',
    };

    setSchedules([itemToAdd, ...schedules]);
    setIsAdding(false);
  };

  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Hampir Penuh':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Penuh':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Selesai':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Jadwal & Rute Travel</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola jam keberangkatan, rute, ketersediaan kursi, dan armada travel.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          + Tambah Jadwal
        </button>
      </div>

      {/* Tabel Data Jadwal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-400 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">ID Jadwal</th>
                <th className="py-3.5 px-4">Rute Perjalanan</th>
                <th className="py-3.5 px-4">Tanggal & Waktu</th>
                <th className="py-3.5 px-4">Unit Kendaraan</th>
                <th className="py-3.5 px-4">Harga Tiket</th>
                <th className="py-3.5 px-4 text-center">Kuota Kursi</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {schedules.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-gray-800">{item.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#0A64BC]">{item.rute}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-800">{item.tanggal}</div>
                    <div className="text-[10px] text-gray-500">Jam: {item.waktu} WIB</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">{item.transportasi}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{item.harga}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-gray-800">{item.kuotaTersedia}</span>
                    <span className="text-gray-400"> / {item.totalKuota}</span>
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
                        title="Edit Jadwal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Hapus Jadwal"
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

      {/* Modal Tambah Jadwal Baru */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gray-800">Tambah Jadwal Baru</h3>
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Rute Perjalanan</label>
                <input
                  type="text"
                  value={newSchedule.rute}
                  onChange={(e) => setNewSchedule({ ...newSchedule, rute: e.target.value })}
                  placeholder="Jakarta - Yogyakarta"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newSchedule.tanggal}
                    onChange={(e) => setNewSchedule({ ...newSchedule, tanggal: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Waktu</label>
                  <input
                    type="time"
                    value={newSchedule.waktu}
                    onChange={(e) => setNewSchedule({ ...newSchedule, waktu: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Harga Tiket</label>
                  <input
                    type="text"
                    value={newSchedule.harga}
                    onChange={(e) => setNewSchedule({ ...newSchedule, harga: e.target.value })}
                    placeholder="Rp 150.000"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Total Kursi</label>
                  <input
                    type="number"
                    value={newSchedule.totalKuota}
                    onChange={(e) => setNewSchedule({ ...newSchedule, totalKuota: Number(e.target.value) })}
                    placeholder="7"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Kendaraan</label>
                <select
                  value={newSchedule.transportasi}
                  onChange={(e) => setNewSchedule({ ...newSchedule, transportasi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {armadaOptions.map((mobil) => (
                    <option key={mobil} value={mobil}>
                      {mobil}
                    </option>
                  ))}
                </select>
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

      {/* Modal Edit Jadwal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gray-800">Edit Jadwal ({editingItem.id})</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Rute Perjalanan</label>
                <input
                  type="text"
                  value={editingItem.rute}
                  onChange={(e) => setEditingItem({ ...editingItem, rute: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editingItem.tanggal}
                    onChange={(e) => setEditingItem({ ...editingItem, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Waktu</label>
                  <input
                    type="time"
                    value={editingItem.waktu}
                    onChange={(e) => setEditingItem({ ...editingItem, waktu: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Harga Tiket</label>
                  <input
                    type="text"
                    value={editingItem.harga}
                    onChange={(e) => setEditingItem({ ...editingItem, harga: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Total Kursi</label>
                  <input
                    type="number"
                    value={editingItem.totalKuota}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        totalKuota: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Kendaraan</label>
                <select
                  value={editingItem.transportasi}
                  onChange={(e) => setEditingItem({ ...editingItem, transportasi: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {armadaOptions.map((mobil) => (
                    <option key={mobil} value={mobil}>
                      {mobil}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] cursor-pointer"
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