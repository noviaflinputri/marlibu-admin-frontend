'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = ((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/+$/, '')).endsWith('/api')
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/+$/, '')
  : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/+$/, '')}/api`;

type FrontendStatus = 'Tersedia' | 'Dalam Perjalanan' | 'Perawatan';

interface TransportItem {
  id: number;
  transport_code: string;
  vehicle_type: string;
  no: number;
  platNomor: string;
  unitMobil: string;
  kapasitas: string;
  status: FrontendStatus;
}

const initialMobilOptions = [
  { unit: 'Toyota Hiace Premio', kapasitas: '11 Penumpang' },
  { unit: 'Toyota Hiace Commuter', kapasitas: '14 Penumpang' },
  { unit: 'Innova Reborn', kapasitas: '7 Penumpang' },
  { unit: 'Avanza Veloz', kapasitas: '6 Penumpang' },
  { unit: 'Elf Long', kapasitas: '19 Penumpang' },
];

const mapStatusToFE = (s: string): FrontendStatus => s === 'in_use' ? 'Dalam Perjalanan' : (s === 'maintenance' || s === 'inactive') ? 'Perawatan' : 'Tersedia';
const mapStatusToBE = (s: FrontendStatus) => s === 'Dalam Perjalanan' ? 'in_use' : s === 'Perawatan' ? 'maintenance' : 'available';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.message || `Gagal. HTTP ${res.status}`);
  return json.data;
}

export default function TransportGrid() {
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [mobilOptions, setMobilOptions] = useState(initialMobilOptions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportItem | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: TransportItem | null }>({ isOpen: false, item: null });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    platDepan: '', platAngka: '', platBelakang: '',
    unitMobil: initialMobilOptions[0].unit, isCustomUnit: false, customUnit: '',
    kapasitas: initialMobilOptions[0].kapasitas, isCustomKapasitas: false, customKapasitasNum: '',
    status: 'Tersedia' as FrontendStatus,
  });
  const [platErrors, setPlatErrors] = useState({ depan: '', angka: '', belakang: '' });

  const fetchTransports = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await apiRequest<any[]>('/transports');
      const mapped = data.map((item, idx) => ({
        id: item.id,
        transport_code: item.transport_code,
        vehicle_type: item.vehicle_type,
        no: idx + 1,
        platNomor: item.plate_number,
        unitMobil: item.vehicle_name,
        kapasitas: `${item.capacity} Penumpang`,
        status: mapStatusToFE(item.status),
      }));
      setTransports(mapped);
      setMobilOptions(prev => {
        const ops = [...prev];
        mapped.forEach(m => { if (!ops.some(o => o.unit === m.unitMobil)) ops.push({ unit: m.unitMobil, kapasitas: m.kapasitas }); });
        return ops;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTransports(); }, [fetchTransports]);

  const totalPages = Math.ceil(transports.length / itemsPerPage) || 1;
  const currentTransports = transports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => {
    setForm({
      platDepan: '', platAngka: '', platBelakang: '',
      unitMobil: mobilOptions[0]?.unit || 'Innova Reborn', isCustomUnit: false, customUnit: '',
      kapasitas: mobilOptions[0]?.kapasitas || '7 Penumpang', isCustomKapasitas: false, customKapasitasNum: '',
      status: 'Tersedia',
    });
    setPlatErrors({ depan: '', angka: '', belakang: '' });
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = {
      depan: !form.platDepan || form.platDepan.length > 2 ? 'Wajib 1-2 huruf' : '',
      angka: !form.platAngka || form.platAngka.length > 4 ? 'Wajib 1-4 angka' : '',
      belakang: !form.platBelakang || form.platBelakang.length > 3 ? 'Wajib 1-3 huruf' : '',
    };
    setPlatErrors(errs);
    if (errs.depan || errs.angka || errs.belakang) return;
    if (form.isCustomUnit && !form.customUnit.trim()) { setError('Nama unit wajib diisi'); return; }

    try {
      setSaving(true); setError('');
      const payload = {
        transport_code: editingItem?.transport_code || `TRP-${String(transports.length + 1).padStart(3, '0')}`,
        vehicle_name: form.isCustomUnit ? form.customUnit.trim() : form.unitMobil,
        vehicle_type: editingItem?.vehicle_type || (form.isCustomUnit ? form.customUnit.trim() : form.unitMobil),
        plate_number: `${form.platDepan} ${form.platAngka} ${form.platBelakang}`,
        capacity: form.isCustomKapasitas ? Number(form.customKapasitasNum) : Number(form.kapasitas.replace(/\D/g, '')),
        status: mapStatusToBE(form.status),
      };

      if (editingItem) {
        await apiRequest(`/transports/${editingItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        setEditingItem(null);
      } else {
        await apiRequest('/transports', { method: 'POST', body: JSON.stringify(payload) });
        setIsAdding(false);
      }
      resetForm(); fetchTransports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      setSaving(true);
      await apiRequest(`/transports/${deleteModal.item.id}`, { method: 'DELETE' });
      setDeleteModal({ isOpen: false, item: null });
      fetchTransports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus');
      setDeleteModal({ isOpen: false, item: null });
    } finally { setSaving(false); }
  };

  const badgeColor = (s: FrontendStatus) => s === 'Tersedia' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : s === 'Dalam Perjalanan' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Data Armada & Transportasi</h1>
          <p className="text-xs text-gray-500 mt-1">Kelola unit mobil kendaraan dan status operasional armada.</p>
        </div>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer">+ Tambah Armada</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center text-gray-900 font-bold uppercase">NO</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">PLAT NOMOR</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">UNIT MOBIL</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">KAPASITAS</th>
                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase">STATUS</th>
                <th className="py-3.5 px-4 text-center w-28 text-gray-900 font-bold uppercase">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Memuat data transportasi...</td></tr>
              ) : currentTransports.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Belum ada data armada transportasi.</td></tr>
              ) : (
                currentTransports.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 text-center text-gray-400 font-medium">{item.no}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.platNomor}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#0A64BC]">{item.unitMobil}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.kapasitas}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${badgeColor(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => {
                          setEditingItem(item);
                          const [d = '', a = '', b = ''] = item.platNomor.split(' ');
                          setForm({ ...form, platDepan: d, platAngka: a, platBelakang: b, unitMobil: item.unitMobil, kapasitas: item.kapasitas, status: item.status });
                        }} className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg cursor-pointer"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, item })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {!loading && transports.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-3 text-xs text-gray-500">
            <div>
              Menampilkan <span className="font-semibold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{' '}
              <span className="font-semibold text-gray-800">{Math.min(currentPage * itemsPerPage, transports.length)}</span> dari{' '}
              <span className="font-semibold text-gray-800">{transports.length}</span> data armada
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 font-semibold cursor-pointer">
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <div className="px-3 py-1.5 font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">{currentPage} / {totalPages}</div>
              <button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 font-semibold cursor-pointer">
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6 sm:p-10">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-lg space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">{editingItem ? `Edit Armada (No. ${editingItem.no})` : 'Tambah Armada Baru'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Plat Nomor</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" maxLength={2} value={form.platDepan} onChange={e => setForm({ ...form, platDepan: e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase() })} placeholder="B" required className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                  <input type="text" maxLength={4} value={form.platAngka} onChange={e => setForm({ ...form, platAngka: e.target.value.replace(/[^0-9]/g, '') })} placeholder="1234" required className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                  <input type="text" maxLength={3} value={form.platBelakang} onChange={e => setForm({ ...form, platBelakang: e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase() })} placeholder="KZ" required className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                </div>
                {(platErrors.depan || platErrors.angka || platErrors.belakang) && <p className="text-red-500 text-[11px] mt-1 font-medium">{platErrors.depan || platErrors.angka || platErrors.belakang}</p>}
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Unit Mobil</label>
                {/* Perbaikan styling dropdown agar panahnya proporsional dan rapi */}
                <select value={form.isCustomUnit ? 'NEW_UNIT' : form.unitMobil} onChange={e => e.target.value === 'NEW_UNIT' ? setForm({ ...form, isCustomUnit: true }) : setForm({ ...form, isCustomUnit: false, unitMobil: e.target.value })} className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] appearance-none cursor-pointer bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                  {mobilOptions.map(m => <option key={m.unit} value={m.unit}>{m.unit}</option>)}
                  <option value="NEW_UNIT" className="font-semibold text-[#0A64BC]">+ Tambah Unit Baru...</option>
                </select>
                {form.isCustomUnit && <input type="text" value={form.customUnit} onChange={e => setForm({ ...form, customUnit: e.target.value })} placeholder="Nama unit mobil baru" required className="w-full mt-2 px-3.5 py-2.5 bg-white border border-[#0A64BC] rounded-xl focus:outline-none" />}
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kapasitas</label>
                {/* Perbaikan styling dropdown agar panahnya proporsional dan rapi */}
                <select value={form.isCustomKapasitas ? 'CUSTOM' : form.kapasitas} onChange={e => e.target.value === 'CUSTOM' ? setForm({ ...form, isCustomKapasitas: true }) : setForm({ ...form, isCustomKapasitas: false, kapasitas: e.target.value })} className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] appearance-none cursor-pointer bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                  {['6 Penumpang', '7 Penumpang', '11 Penumpang', '14 Penumpang', '19 Penumpang'].map(k => <option key={k} value={k}>{k}</option>)}
                  <option value="CUSTOM" className="font-semibold text-[#0A64BC]">+ Input Kapasitas Kustom...</option>
                </select>
                {form.isCustomKapasitas && (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="number" min={1} value={form.customKapasitasNum} onChange={e => setForm({ ...form, customKapasitasNum: e.target.value })} placeholder="Jumlah" required className="w-full px-3.5 py-2.5 bg-white border border-[#0A64BC] rounded-xl" />
                    <span className="text-gray-500 text-xs font-medium shrink-0">Penumpang</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">Status Operasional</label>
                {/* Perbaikan styling dropdown agar panahnya proporsional dan rapi */}
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as FrontendStatus })} className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] appearance-none cursor-pointer bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]">
                  <option value="Tersedia">Tersedia</option>
                  <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                  <option value="Perawatan">Perawatan</option>
                </select>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" disabled={saving} onClick={() => { setIsAdding(false); setEditingItem(null); resetForm(); }} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#0A64BC] text-white rounded-xl font-semibold cursor-pointer hover:bg-[#08529B] shadow-xs">{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500"><AlertTriangle className="w-6 h-6" /></div>
            <h3 className="text-base font-bold text-gray-800">Hapus Data Armada?</h3>
            <p className="text-xs text-gray-500">Apakah Anda yakin ingin menghapus armada dengan Plat <strong>"{deleteModal.item.platNomor}"</strong>?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={saving} onClick={() => setDeleteModal({ isOpen: false, item: null })} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-xs cursor-pointer">Batal</button>
              <button disabled={saving} onClick={confirmDelete} className="w-full py-2.5 bg-red-600 text-white rounded-xl font-semibold text-xs cursor-pointer">{saving ? 'Menghapus...' : 'Ya, Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}