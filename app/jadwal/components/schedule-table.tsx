'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';

export interface ScheduleItem {
  id: string;
  rute: string;
  tanggalWaktu: string;
  jam: string;
  unitKendaraan: string;
  hargaTiket: string;
  kuotaTerisi: number;
  kuotaTotal: number;
  status: 'Tersedia' | 'Hampir Penuh' | 'Penuh';
}

const initialSchedules: ScheduleItem[] = [
  {
    id: 'SCH-001',
    rute: 'Jakarta - Yogyakarta',
    tanggalWaktu: '2026-10-14',
    jam: '12:38 WIB',
    unitKendaraan: 'Innova Reborn',
    hargaTiket: 'Rp 150.000',
    kuotaTerisi: 5,
    kuotaTotal: 7,
    status: 'Tersedia',
  },
  {
    id: 'SCH-002',
    rute: 'Malang - Surabaya',
    tanggalWaktu: '2026-10-17',
    jam: '06:00 WIB',
    unitKendaraan: 'Toyota HiAce Premio',
    hargaTiket: 'Rp 150.000',
    kuotaTerisi: 2,
    kuotaTotal: 11,
    status: 'Hampir Penuh',
  },
  {
    id: 'SCH-003',
    rute: 'Surabaya - Malang',
    tanggalWaktu: '2026-10-18',
    jam: '10:00 WIB',
    unitKendaraan: 'Avanza Veloz',
    hargaTiket: 'Rp 130.000',
    kuotaTerisi: 1,
    kuotaTotal: 6,
    status: 'Hampir Penuh',
  },
];

const ruteOptions = [
  'Jakarta - Yogyakarta',
  'Malang - Surabaya',
  'Surabaya - Malang',
  'Jakarta - Bandung',
  'Surabaya - Bali',
];

const armadaOptions = [
  { name: 'Innova Reborn', capacity: 7 },
  { name: 'Toyota HiAce Premio', capacity: 11 },
  { name: 'Avanza Veloz', capacity: 6 },
  { name: 'Elf Long', capacity: 19 },
  { name: 'Toyota HiAce Commuter', capacity: 14 },
];

export default function ScheduleTable() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // State Modal Hapus Modern UI
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    rute: string;
  }>({
    isOpen: false,
    id: '',
    rute: '',
  });

  // State Form Input
  const [formData, setFormData] = useState({
    rute: ruteOptions[0],
    tanggal: '2026-10-19',
    jam: '08:00',
    unitKendaraan: armadaOptions[0].name,
    hargaTiket: 'Rp 150.000',
  });

  // Reset Form
  const resetForm = () => {
    setFormData({
      rute: ruteOptions[0],
      tanggal: '2026-10-19',
      jam: '08:00',
      unitKendaraan: armadaOptions[0].name,
      hargaTiket: 'Rp 150.000',
    });
  };

  // Handler Format Harga Rupiah
  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawNumber = e.target.value.replace(/\D/g, '');
    if (!rawNumber) {
      setFormData({ ...formData, hargaTiket: '' });
      return;
    }
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(rawNumber));

    setFormData({ ...formData, hargaTiket: formatted });
  };

  // Tambah Jadwal Baru
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedArmada = armadaOptions.find((a) => a.name === formData.unitKendaraan);
    const capacity = matchedArmada ? matchedArmada.capacity : 7;
    const nextId = `SCH-00${schedules.length + 1}`;

    const newSchedule: ScheduleItem = {
      id: nextId,
      rute: formData.rute,
      tanggalWaktu: formData.tanggal,
      jam: `${formData.jam} WIB`,
      unitKendaraan: formData.unitKendaraan,
      hargaTiket: formData.hargaTiket,
      kuotaTerisi: capacity,
      kuotaTotal: capacity,
      status: 'Tersedia',
    };

    setSchedules([...schedules, newSchedule]);
    setIsAdding(false);
    resetForm();
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      rute: item.rute,
      tanggal: item.tanggalWaktu,
      jam: item.jam.replace(' WIB', ''),
      unitKendaraan: item.unitKendaraan,
      hargaTiket: item.hargaTiket,
    });
  };

  // Save Edit Schedule
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const matchedArmada = armadaOptions.find((a) => a.name === formData.unitKendaraan);
    const capacity = matchedArmada ? matchedArmada.capacity : editingItem.kuotaTotal;

    const updated: ScheduleItem = {
      ...editingItem,
      rute: formData.rute,
      tanggalWaktu: formData.tanggal,
      jam: `${formData.jam} WIB`,
      unitKendaraan: formData.unitKendaraan,
      hargaTiket: formData.hargaTiket,
      kuotaTotal: capacity,
    };

    setSchedules(schedules.map((s) => (s.id === editingItem.id ? updated : s)));
    setEditingItem(null);
    resetForm();
  };

  // Confirm Delete
  const confirmDelete = () => {
    setSchedules(schedules.filter((s) => s.id !== deleteModal.id));
    setDeleteModal({ isOpen: false, id: '', rute: '' });
  };

  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Hampir Penuh':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Penuh':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Jadwal & Rute Travel</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola jam keberangkatan, rute, ketersediaan kursi, dan armada travel.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          + Tambah Jadwal
        </button>
      </div>

      {/* Tabel Jadwal - Header Hitam Bold Capslock (Uppercase) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">ID JADWAL</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">RUTE PERJALANAN</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">TANGGAL & WAKTU</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">UNIT KENDARAAN</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">HARGA TIKET</th>
                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase tracking-wider">KUOTA KURSI</th>
                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase tracking-wider">STATUS</th>
                <th className="py-3.5 px-4 text-center w-24 text-gray-900 font-bold uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
              {schedules.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-gray-800">{item.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#0A64BC]">{item.rute}</td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div className="font-medium text-gray-800">{item.tanggalWaktu}</div>
                    <div className="text-[10px] text-gray-400">Jam: {item.jam}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-800 font-medium">{item.unitKendaraan}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{item.hargaTiket}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                    <span className="text-gray-900 font-bold">{item.kuotaTerisi}</span>
                    <span className="text-gray-400 font-normal"> / {item.kuotaTotal}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit Jadwal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: item.id, rute: item.rute })}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
                <select
                  value={formData.rute}
                  onChange={(e) => setFormData({ ...formData, rute: e.target.value })}
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
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Keberangkatan</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Jam Keberangkatan</label>
                  <input
                    type="time"
                    value={formData.jam}
                    onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Kendaraan</label>
                <select
                  value={formData.unitKendaraan}
                  onChange={(e) => setFormData({ ...formData, unitKendaraan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {armadaOptions.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} (Kapasitas: {a.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Harga Tiket</label>
                <input
                  type="text"
                  value={formData.hargaTiket}
                  onChange={handleHargaChange}
                  required
                  placeholder="Contoh: 150000"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
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
                <select
                  value={formData.rute}
                  onChange={(e) => setFormData({ ...formData, rute: e.target.value })}
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
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Keberangkatan</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Jam Keberangkatan</label>
                  <input
                    type="time"
                    value={formData.jam}
                    onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Kendaraan</label>
                <select
                  value={formData.unitKendaraan}
                  onChange={(e) => setFormData({ ...formData, unitKendaraan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {armadaOptions.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} (Kapasitas: {a.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Harga Tiket</label>
                <input
                  type="text"
                  value={formData.hargaTiket}
                  onChange={handleHargaChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
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
                  className="px-5 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] cursor-pointer shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Modern UI */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">Hapus Jadwal Travel?</h3>
              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin menghapus jadwal <strong>"{deleteModal.id}"</strong> ({deleteModal.rute})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, id: '', rute: '' })}
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