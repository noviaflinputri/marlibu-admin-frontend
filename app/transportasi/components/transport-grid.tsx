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

const initialMobilOptions = [
  { unit: 'Toyota Hiace Premio', kapasitas: '11 Penumpang' },
  { unit: 'Toyota Hiace Commuter', kapasitas: '14 Penumpang' },
  { unit: 'Innova Reborn', kapasitas: '7 Penumpang' },
  { unit: 'Avanza Veloz', kapasitas: '6 Penumpang' },
  { unit: 'Elf Long', kapasitas: '19 Penumpang' },
];

export default function TransportGrid() {
  const [transports, setTransports] = useState<TransportItem[]>(initialTransports);
  const [mobilOptions, setMobilOptions] = useState(initialMobilOptions);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportItem | null>(null);

  // Form State Tambah Armada (Plat Nomor Terpisah)
  const [platDepan, setPlatDepan] = useState('');
  const [platAngka, setPlatAngka] = useState('');
  const [platBelakang, setPlatBelakang] = useState('');

  const [unitMobil, setUnitMobil] = useState(initialMobilOptions[0].unit);
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState('');

  const [kapasitas, setKapasitas] = useState(initialMobilOptions[0].kapasitas);
  const [isCustomKapasitas, setIsCustomKapasitas] = useState(false);
  const [customKapasitasNum, setCustomKapasitasNum] = useState('');

  const [status, setStatus] = useState<TransportItem['status']>('Tersedia');

  // Error Messages State
  const [platErrors, setPlatErrors] = useState({ depan: '', angka: '', belakang: '' });

  // Reset State Form
  const resetForm = () => {
    setPlatDepan('');
    setPlatAngka('');
    setPlatBelakang('');
    setUnitMobil(mobilOptions[0]?.unit || 'Innova Reborn');
    setIsCustomUnit(false);
    setCustomUnit('');
    setKapasitas(mobilOptions[0]?.kapasitas || '7 Penumpang');
    setIsCustomKapasitas(false);
    setCustomKapasitasNum('');
    setStatus('Tersedia');
    setPlatErrors({ depan: '', angka: '', belakang: '' });
  };

  // Handler Input Kode Depan (Hanya Huruf)
  const handlePlatDepan = (val: string) => {
    const hasInvalid = /[^a-zA-Z]/g.test(val);
    const clean = val.replace(/[^a-zA-Z]/g, '').toUpperCase();
    setPlatDepan(clean);
    setPlatErrors((prev) => ({
      ...prev,
      depan: hasInvalid ? 'Kode depan hanya boleh huruf!' : '',
    }));
  };

  // Handler Input Angka Tengah (Hanya Angka)
  const handlePlatAngka = (val: string) => {
    const hasInvalid = /[^0-9]/g.test(val);
    const clean = val.replace(/[^0-9]/g, '');
    setPlatAngka(clean);
    setPlatErrors((prev) => ({
      ...prev,
      angka: hasInvalid ? 'Harus diisi angka!' : '',
    }));
  };

  // Handler Input Kode Belakang (Hanya Huruf)
  const handlePlatBelakang = (val: string) => {
    const hasInvalid = /[^a-zA-Z]/g.test(val);
    const clean = val.replace(/[^a-zA-Z]/g, '').toUpperCase();
    setPlatBelakang(clean);
    setPlatErrors((prev) => ({
      ...prev,
      belakang: hasInvalid ? 'Kode belakang hanya boleh huruf!' : '',
    }));
  };

  // Hapus Armada
  const handleDelete = (no: number, plat: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus armada dengan Plat ${plat}?`)) {
      setTransports(transports.filter((item) => item.no !== no));
    }
  };

  // Tambah Armada Baru
  const handleAddTransport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!platDepan || !platAngka || !platBelakang) {
      alert('Silakan lengkapi format plat nomor dengan benar!');
      return;
    }

    const fullPlat = `${platDepan} ${platAngka} ${platBelakang}`;
    let finalUnit = unitMobil;
    if (isCustomUnit) {
      if (!customUnit.trim()) return;
      finalUnit = customUnit.trim();
      if (!mobilOptions.some((m) => m.unit === finalUnit)) {
        setMobilOptions([...mobilOptions, { unit: finalUnit, kapasitas }]);
      }
    }

    let finalKapasitas = kapasitas;
    if (isCustomKapasitas) {
      if (!customKapasitasNum) return;
      finalKapasitas = `${customKapasitasNum} Penumpang`;
    }

    const itemToAdd: TransportItem = {
      no: transports.length + 1,
      platNomor: fullPlat,
      unitMobil: finalUnit,
      kapasitas: finalKapasitas,
      status: status,
    };

    setTransports([...transports, itemToAdd]);
    setIsAdding(false);
    resetForm();
  };

  // Buka Modal Edit & Split Plat Nomor
  const handleOpenEdit = (item: TransportItem) => {
    setEditingItem(item);
    const parts = item.platNomor.split(' ');
    setPlatDepan(parts[0] || '');
    setPlatAngka(parts[1] || '');
    setPlatBelakang(parts[2] || '');

    setUnitMobil(item.unitMobil);
    setIsCustomUnit(false);
    setCustomUnit('');

    setKapasitas(item.kapasitas);
    setIsCustomKapasitas(false);
    setCustomKapasitasNum('');

    setStatus(item.status);
    setPlatErrors({ depan: '', angka: '', belakang: '' });
  };

  // Edit Armada
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!platDepan || !platAngka || !platBelakang) {
      alert('Silakan lengkapi format plat nomor dengan benar!');
      return;
    }

    const fullPlat = `${platDepan} ${platAngka} ${platBelakang}`;
    let finalUnit = unitMobil;
    if (isCustomUnit) {
      if (!customUnit.trim()) return;
      finalUnit = customUnit.trim();
      if (!mobilOptions.some((m) => m.unit === finalUnit)) {
        setMobilOptions([...mobilOptions, { unit: finalUnit, kapasitas }]);
      }
    }

    let finalKapasitas = kapasitas;
    if (isCustomKapasitas) {
      if (!customKapasitasNum) return;
      finalKapasitas = `${customKapasitasNum} Penumpang`;
    }

    const updated: TransportItem = {
      ...editingItem,
      platNomor: fullPlat,
      unitMobil: finalUnit,
      kapasitas: finalKapasitas,
      status: status,
    };

    setTransports(transports.map((t) => (t.no === editingItem.no ? updated : t)));
    setEditingItem(null);
    resetForm();
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
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
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
                        onClick={() => handleOpenEdit(item)}
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
              
              {/* Input Plat Nomor (3 Kolom Terpisah: Kode Depan, Angka, Kode Belakang) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Plat Nomor <span className="text-[10px] text-gray-400 font-normal">*(Depan - Angka - Belakang)*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    value={platDepan}
                    onChange={(e) => handlePlatDepan(e.target.value)}
                    placeholder="B"
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                  <input
                    type="text"
                    maxLength={4}
                    value={platAngka}
                    onChange={(e) => handlePlatAngka(e.target.value)}
                    placeholder="1234"
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                  <input
                    type="text"
                    maxLength={3}
                    value={platBelakang}
                    onChange={(e) => handlePlatBelakang(e.target.value)}
                    placeholder="KZ"
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                {(platErrors.depan || platErrors.angka || platErrors.belakang) && (
                  <p className="text-red-500 text-[11px] mt-1 font-medium">
                    {platErrors.depan || platErrors.angka || platErrors.belakang}
                  </p>
                )}
              </div>

              {/* Unit Mobil (+ Opsi Tambah Unit Baru) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Mobil</label>
                <select
                  value={isCustomUnit ? 'NEW_UNIT' : unitMobil}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'NEW_UNIT') {
                      setIsCustomUnit(true);
                    } else {
                      setIsCustomUnit(false);
                      setUnitMobil(val);
                      const matched = mobilOptions.find((m) => m.unit === val);
                      if (matched && !isCustomKapasitas) setKapasitas(matched.kapasitas);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {mobilOptions.map((item) => (
                    <option key={item.unit} value={item.unit}>
                      {item.unit}
                    </option>
                  ))}
                  <option value="NEW_UNIT" className="font-semibold text-[#0A64BC]">
                    + Tambah Unit Mobil Baru...
                  </option>
                </select>

                {isCustomUnit && (
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="Masukkan nama unit mobil baru (misal: Innova Zenix)"
                    required
                    className="w-full mt-2 px-3.5 py-2 bg-white border border-[#0A64BC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                )}
              </div>

              {/* Kapasitas (+ Opsi Kapasitas Bebas) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kapasitas</label>
                <select
                  value={isCustomKapasitas ? 'CUSTOM_KAPASITAS' : kapasitas}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM_KAPASITAS') {
                      setIsCustomKapasitas(true);
                    } else {
                      setIsCustomKapasitas(false);
                      setKapasitas(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  <option value="6 Penumpang">6 Penumpang</option>
                  <option value="7 Penumpang">7 Penumpang</option>
                  <option value="11 Penumpang">11 Penumpang</option>
                  <option value="14 Penumpang">14 Penumpang</option>
                  <option value="19 Penumpang">19 Penumpang</option>
                  <option value="CUSTOM_KAPASITAS" className="font-semibold text-[#0A64BC]">
                    + Input Kapasitas Kustom...
                  </option>
                </select>

                {isCustomKapasitas && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min={1}
                      value={customKapasitasNum}
                      onChange={(e) => setCustomKapasitasNum(e.target.value)}
                      placeholder="Jumlah Penumpang (misal: 30)"
                      required
                      className="w-full px-3.5 py-2 bg-white border border-[#0A64BC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                    />
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">Penumpang</span>
                  </div>
                )}
              </div>

              {/* Status Operasional */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Status Operasional</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TransportItem['status'])}
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
              
              {/* Input Plat Nomor (Edit Modal) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Plat Nomor <span className="text-[10px] text-gray-400 font-normal">*(Depan - Angka - Belakang)*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    value={platDepan}
                    onChange={(e) => handlePlatDepan(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                  <input
                    type="text"
                    maxLength={4}
                    value={platAngka}
                    onChange={(e) => handlePlatAngka(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                  <input
                    type="text"
                    maxLength={3}
                    value={platBelakang}
                    onChange={(e) => handlePlatBelakang(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
                {(platErrors.depan || platErrors.angka || platErrors.belakang) && (
                  <p className="text-red-500 text-[11px] mt-1 font-medium">
                    {platErrors.depan || platErrors.angka || platErrors.belakang}
                  </p>
                )}
              </div>

              {/* Unit Mobil (Edit Modal) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Mobil</label>
                <select
                  value={isCustomUnit ? 'NEW_UNIT' : unitMobil}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'NEW_UNIT') {
                      setIsCustomUnit(true);
                    } else {
                      setIsCustomUnit(false);
                      setUnitMobil(val);
                      const matched = mobilOptions.find((m) => m.unit === val);
                      if (matched && !isCustomKapasitas) setKapasitas(matched.kapasitas);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  {mobilOptions.map((item) => (
                    <option key={item.unit} value={item.unit}>
                      {item.unit}
                    </option>
                  ))}
                  <option value="NEW_UNIT" className="font-semibold text-[#0A64BC]">
                    + Tambah Unit Mobil Baru...
                  </option>
                </select>

                {isCustomUnit && (
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="Masukkan nama unit mobil baru"
                    required
                    className="w-full mt-2 px-3.5 py-2 bg-white border border-[#0A64BC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                )}
              </div>

              {/* Kapasitas (Edit Modal) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kapasitas</label>
                <select
                  value={isCustomKapasitas ? 'CUSTOM_KAPASITAS' : kapasitas}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM_KAPASITAS') {
                      setIsCustomKapasitas(true);
                    } else {
                      setIsCustomKapasitas(false);
                      setKapasitas(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  <option value="6 Penumpang">6 Penumpang</option>
                  <option value="7 Penumpang">7 Penumpang</option>
                  <option value="11 Penumpang">11 Penumpang</option>
                  <option value="14 Penumpang">14 Penumpang</option>
                  <option value="19 Penumpang">19 Penumpang</option>
                  <option value="CUSTOM_KAPASITAS" className="font-semibold text-[#0A64BC]">
                    + Input Kapasitas Kustom...
                  </option>
                </select>

                {isCustomKapasitas && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min={1}
                      value={customKapasitasNum}
                      onChange={(e) => setCustomKapasitasNum(e.target.value)}
                      placeholder="Jumlah Penumpang"
                      required
                      className="w-full px-3.5 py-2 bg-white border border-[#0A64BC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                    />
                    <span className="text-gray-500 text-xs font-medium whitespace-nowrap">Penumpang</span>
                  </div>
                )}
              </div>

              {/* Status Operasional (Edit Modal) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Status Operasional</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TransportItem['status'])}
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
                  className="px-5 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] cursor-pointer shadow-xs"
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