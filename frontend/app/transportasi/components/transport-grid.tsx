'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export interface TransportItem {
  no: number;
  platNomor: string;
  unitMobil: string;
  kapasitas: string;
  status: 'Tersedia' | 'Dalam Perjalanan' | 'Perawatan';
}

const initialTransports: TransportItem[] = [
  {
    no: 1,
    platNomor: 'B 1234 KZ',
    unitMobil: 'Toyota Hiace Premio',
    kapasitas: '11 Penumpang',
    status: 'Tersedia',
  },
  {
    no: 2,
    platNomor: 'B 5678 LP',
    unitMobil: 'Innova Reborn',
    kapasitas: '7 Penumpang',
    status: 'Tersedia',
  },
  {
    no: 3,
    platNomor: 'B 9012 MN',
    unitMobil: 'Avanza Veloz',
    kapasitas: '6 Penumpang',
    status: 'Dalam Perjalanan',
  },
  {
    no: 4,
    platNomor: 'B 3456 SW',
    unitMobil: 'Elf Long',
    kapasitas: '19 Penumpang',
    status: 'Tersedia',
  },
  {
    no: 5,
    platNomor: 'B 7890 RT',
    unitMobil: 'Toyota Hiace Commuter',
    kapasitas: '14 Penumpang',
    status: 'Perawatan',
  },
];

// Opsi pilihan unit mobil beserta kapasitas bawaannya
const mobilOptions = [
  { unit: 'Toyota Hiace Premio', kapasitas: '11 Penumpang' },
  { unit: 'Toyota Hiace Commuter', kapasitas: '14 Penumpang' },
  { unit: 'Innova Reborn', kapasitas: '7 Penumpang' },
  { unit: 'Avanza Veloz', kapasitas: '6 Penumpang' },
  { unit: 'Elf Long', kapasitas: '19 Penumpang' },
];

export default function TransportGrid() {
  const [transports, setTransports] = useState<TransportItem[]>(initialTransports);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportItem | null>(null);

  // Form State Tambah Armada
  const [newTransport, setNewTransport] = useState({
    platNomor: '',
    unitMobil: mobilOptions[0].unit,
    kapasitas: mobilOptions[0].kapasitas,
    status: 'Tersedia' as TransportItem['status'],
  });

  // Hapus Armada
  const handleDelete = (no: number, plat: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus armada dengan Plat ${plat}?`)) {
      setTransports(transports.filter((item) => item.no !== no));
    }
  };

  // Tambah Armada Baru
  const handleAddTransport = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToAdd: TransportItem = {
      no: transports.length + 1,
      platNomor: newTransport.platNomor,
      unitMobil: newTransport.unitMobil,
      kapasitas: newTransport.kapasitas,
      status: newTransport.status,
    };
    setTransports([...transports, itemToAdd]);
    setIsAdding(false);
    setNewTransport({
      platNomor: '',
      unitMobil: mobilOptions[0].unit,
      kapasitas: mobilOptions[0].kapasitas,
      status: 'Tersedia',
    });
  };

  // Edit Armada
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setTransports(transports.map((t) => (t.no === editingItem.no ? editingItem : t)));
    setEditingItem(null);
  };

  const getStatusBadge = (status: TransportItem['status']) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Dalam Perjalanan':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Perawatan':
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Data Armada & Transportasi</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola unit mobil kendaraan dan status operasional armada.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          + Tambah Armada
        </button>
      </div>

      {/* Tabel Armada */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-400 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Plat Nomor</th>
                <th className="py-3.5 px-4">Unit Mobil</th>
                <th className="py-3.5 px-4">Kapasitas</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {transports.map((item) => (
                <tr key={item.no} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 text-center text-gray-400 font-medium">{item.no}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{item.platNomor}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#0A64BC]">{item.unitMobil}</td>
                  <td className="py-3.5 px-4 text-gray-600">{item.kapasitas}</td>
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
                        title="Edit Armada"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.no, item.platNomor)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Hapus Armada"
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

      {/* Modal Tambah Armada Baru */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gray-800">Tambah Armada Baru</h3>
            <form onSubmit={handleAddTransport} className="space-y-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Plat Nomor</label>
                <input
                  type="text"
                  value={newTransport.platNomor}
                  onChange={(e) => setNewTransport({ ...newTransport, platNomor: e.target.value })}
                  placeholder="Contoh: B 1234 KZ"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Mobil</label>
                <select
                  value={newTransport.unitMobil}
                  onChange={(e) => {
                    const selectedUnit = e.target.value;
                    const matchedOption = mobilOptions.find((m) => m.unit === selectedUnit);
                    setNewTransport({
                      ...newTransport,
                      unitMobil: selectedUnit,
                      kapasitas: matchedOption ? matchedOption.kapasitas : newTransport.kapasitas,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {mobilOptions.map((item) => (
                    <option key={item.unit} value={item.unit}>
                      {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kapasitas</label>
                <select
                  value={newTransport.kapasitas}
                  onChange={(e) => setNewTransport({ ...newTransport, kapasitas: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  <option value="6 Penumpang">6 Penumpang</option>
                  <option value="7 Penumpang">7 Penumpang</option>
                  <option value="11 Penumpang">11 Penumpang</option>
                  <option value="14 Penumpang">14 Penumpang</option>
                  <option value="19 Penumpang">19 Penumpang</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Status Operasional</label>
                <select
                  value={newTransport.status}
                  onChange={(e) => setNewTransport({ ...newTransport, status: e.target.value as TransportItem['status'] })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                  <option value="Perawatan">Perawatan</option>
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

      {/* Modal Edit Armada */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gray-800">Edit Armada (No. {editingItem.no})</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Plat Nomor</label>
                <input
                  type="text"
                  value={editingItem.platNomor}
                  onChange={(e) => setEditingItem({ ...editingItem, platNomor: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Mobil</label>
                <select
                  value={editingItem.unitMobil}
                  onChange={(e) => {
                    const selectedUnit = e.target.value;
                    const matchedOption = mobilOptions.find((m) => m.unit === selectedUnit);
                    setEditingItem({
                      ...editingItem,
                      unitMobil: selectedUnit,
                      kapasitas: matchedOption ? matchedOption.kapasitas : editingItem.kapasitas,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {mobilOptions.map((item) => (
                    <option key={item.unit} value={item.unit}>
                      {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kapasitas</label>
                <select
                  value={editingItem.kapasitas}
                  onChange={(e) => setEditingItem({ ...editingItem, kapasitas: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  <option value="6 Penumpang">6 Penumpang</option>
                  <option value="7 Penumpang">7 Penumpang</option>
                  <option value="11 Penumpang">11 Penumpang</option>
                  <option value="14 Penumpang">14 Penumpang</option>
                  <option value="19 Penumpang">19 Penumpang</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Status Operasional</label>
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as TransportItem['status'] })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                  <option value="Perawatan">Perawatan</option>
                </select>
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