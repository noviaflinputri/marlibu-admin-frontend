'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:5001/api';
const API_URL = (() => {
  const cleaned = RAW_API_URL.replace(/\/+$/, '');
  return /\/api$/i.test(cleaned) ? cleaned : `${cleaned}/api`;
})();

type ScheduleStatus = 'scheduled' | 'boarding' | 'departed' | 'completed' | 'cancelled';

interface RouteOption { id: number; route_code: string; origin_city: string; destination_city: string; }
interface TransportOption { id: number; transport_code: string; vehicle_name: string; capacity: number; status: string; }

interface ScheduleItem {
  id: number;
  scheduleCode: string;
  routeId: number;
  transportId: number;
  rute: string;
  tanggalWaktu: string;
  jam: string;
  unitKendaraan: string;
  hargaTiket: number;
  kuotaTerisi: number;
  kuotaTotal: number;
  status: ScheduleStatus;
}

interface FormData {
  routeId: string;
  tanggal: string;
  jam: string;
  transportId: string;
  hargaTiket: string;
  kuota: string;
  status: ScheduleStatus;
}

const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const formatDateTime = (val: string) => {
  const [datePart = '', timePart = ''] = val.replace('T', ' ').split(' ');
  return { tanggal: datePart.slice(0, 10), jam: timePart.slice(0, 5) };
};

const getStatusLabel = (st: ScheduleStatus) => ({
  scheduled: 'Dijadwalkan', boarding: 'Boarding', departed: 'Berangkat', completed: 'Selesai', cancelled: 'Dibatalkan'
}[st] || st);

const getStatusBadge = (st: ScheduleStatus) => ({
  scheduled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  boarding: 'bg-amber-100 text-amber-700 border-amber-200',
  departed: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}[st] || 'bg-gray-100 text-gray-700 border-gray-200');

export default function ScheduleTable() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Pagination State (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; rute: string }>({
    isOpen: false, id: null, rute: '',
  });

  const [formData, setFormData] = useState<FormData>({
    routeId: '', tanggal: '', jam: '08:00', transportId: '', hargaTiket: '150000', kuota: '', status: 'scheduled',
  });

  const apiRequest = async <T,>(endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_URL}/${endpoint.replace(/^\/+/, '')}`, {
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok || json.success === false) throw new Error(json.message || `Request gagal. HTTP ${res.status}`);
    return json;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, tRes, sRes] = await Promise.all([
        apiRequest<RouteOption[]>('/routes'),
        apiRequest<TransportOption[]>('/transports'),
        apiRequest<any[]>('/schedules')
      ]);

      const rData = Array.isArray(rRes.data) ? rRes.data : [];
      const tData = Array.isArray(tRes.data) ? tRes.data : [];
      setRoutes(rData);
      setTransports(tData);
      setOptionsLoaded(true);

      const sData = Array.isArray(sRes.data) ? sRes.data : [];
      setSchedules(sData.map((item: any) => {
        const dt = formatDateTime(item.departure_datetime);
        const route = rData.find((r: RouteOption) => r.id === Number(item.route_id));
        const transport = tData.find((t: TransportOption) => t.id === Number(item.transport_id));
        return {
          id: Number(item.id),
          scheduleCode: item.schedule_code,
          routeId: Number(item.route_id),
          transportId: Number(item.transport_id),
          rute: item.origin_city && item.destination_city ? `${item.origin_city} - ${item.destination_city}` : route ? `${route.origin_city} - ${route.destination_city}` : `Rute #${item.route_id}`,
          tanggalWaktu: dt.tanggal,
          jam: `${dt.jam} WIB`,
          unitKendaraan: item.vehicle_name || transport?.vehicle_name || `Kendaraan #${item.transport_id}`,
          hargaTiket: Number(item.price),
          kuotaTerisi: 0,
          kuotaTotal: Number(item.quota),
          status: item.status,
        };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Logika Pagination Data
  const totalPages = Math.ceil(schedules.length / itemsPerPage) || 1;
  const currentSchedules = schedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => setFormData({
    routeId: routes[0] ? String(routes[0].id) : '',
    tanggal: new Date().toLocaleDateString('en-CA'),
    jam: '08:00',
    transportId: transports[0] ? String(transports[0].id) : '',
    hargaTiket: '150000',
    kuota: transports[0] ? String(transports[0].capacity) : '',
    status: 'scheduled',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.routeId || !formData.transportId || !formData.tanggal || !formData.jam) {
      setError('Mohon lengkapi seluruh field wajib.'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = {
        schedule_code: editingItem?.scheduleCode || `SCH-${Date.now()}`,
        route_id: Number(formData.routeId),
        transport_id: Number(formData.transportId),
        departure_datetime: `${formData.tanggal} ${formData.jam}:00`,
        price: Number(formData.hargaTiket),
        quota: Number(formData.kuota),
        status: formData.status,
      };

      if (editingItem) {
        await apiRequest(`/schedules/${editingItem.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/schedules', { method: 'POST', body: JSON.stringify(payload) });
      }

      setIsAdding(false); setEditingItem(null); resetForm();
      await fetchData();
      alert(editingItem ? 'Jadwal berhasil diperbarui!' : 'Jadwal berhasil ditambahkan!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan jadwal.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.id === null) return;
    setSaving(true); setError('');
    try {
      await apiRequest(`/schedules/${deleteModal.id}`, { method: 'DELETE' });
      setDeleteModal({ isOpen: false, id: null, rute: '' });
      await fetchData();
      alert('Jadwal berhasil dihapus!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus jadwal.');
    } finally {
      setSaving(false);
    }
  };

  const renderFormModal = (title: string) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Rute Perjalanan</label>
            <select value={formData.routeId} onChange={e => setFormData(p => ({ ...p, routeId: e.target.value }))} required className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]">
              <option value="">Pilih Rute</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.origin_city} - {r.destination_city}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Tanggal</label>
              <input type="date" value={formData.tanggal} onChange={e => setFormData(p => ({ ...p, tanggal: e.target.value }))} required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Jam</label>
              <input type="time" value={formData.jam} onChange={e => setFormData(p => ({ ...p, jam: e.target.value }))} required className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Unit Kendaraan</label>
            <select value={formData.transportId} onChange={e => {
              const t = transports.find(x => x.id === Number(e.target.value));
              setFormData(p => ({ ...p, transportId: e.target.value, kuota: t ? String(t.capacity) : p.kuota }));
            }} required className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl">
              <option value="">Pilih Kendaraan</option>
              {transports.map(t => <option key={t.id} value={t.id}>{t.vehicle_name} (Kapasitas: {t.capacity})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Harga Tiket</label>
            <input type="text" value={formData.hargaTiket} onChange={e => setFormData(p => ({ ...p, hargaTiket: e.target.value.replace(/\D/g, '') }))} required className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl" />
            <p className="text-gray-400 mt-1">{formData.hargaTiket ? formatRupiah(Number(formData.hargaTiket)) : 'Rp 0'}</p>
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Kuota Kursi</label>
            <input type="number" min="1" value={formData.kuota} onChange={e => setFormData(p => ({ ...p, kuota: e.target.value }))} required className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Status Jadwal</label>
            <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as ScheduleStatus }))} className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl">
              <option value="scheduled">Dijadwalkan</option>
              <option value="boarding">Boarding</option>
              <option value="departed">Berangkat</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" disabled={saving} onClick={() => { setIsAdding(false); setEditingItem(null); resetForm(); }} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold">Batal</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold shadow-xs">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Jadwal & Rute Travel</h1>
          <p className="text-xs text-gray-500 mt-1">Kelola jam keberangkatan, rute, ketersediaan kursi, dan armada travel.</p>
        </div>
        <button onClick={() => { resetForm(); setIsAdding(true); }} disabled={!optionsLoaded} className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50">
          + Tambah Jadwal
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex justify-between items-center"><span>{error}</span><button onClick={() => setError('')} className="font-bold">Tutup</button></div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">ID JADWAL</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">RUTE PERJALANAN</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">TANGGAL & WAKTU</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">UNIT KENDARAAN</th>
                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase">HARGA TIKET</th>
                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase">KUOTA KURSI</th>
                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase">STATUS</th>
                <th className="py-3.5 px-4 text-center w-24 text-gray-900 font-bold uppercase">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400">Memuat data jadwal...</td></tr>
              ) : currentSchedules.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-400">Belum ada data jadwal perjalanan.</td></tr>
              ) : (
                currentSchedules.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.scheduleCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#0A64BC]">{item.rute}</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="font-medium text-gray-800">{item.tanggalWaktu}</div>
                      <div className="text-[10px] text-gray-400">Jam: {item.jam}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-800 font-medium">{item.unitKendaraan}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{formatRupiah(item.hargaTiket)}</td>
                    <td className="py-3.5 px-4 text-center font-semibold">
                      <span className="text-gray-900 font-bold">{item.kuotaTerisi}</span>
                      <span className="text-gray-400 font-normal"> / {item.kuotaTotal}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => {
                          setEditingItem(item);
                          setFormData({ routeId: String(item.routeId), tanggal: item.tanggalWaktu, jam: item.jam.replace(' WIB', ''), transportId: String(item.transportId), hargaTiket: String(item.hargaTiket), kuota: String(item.kuotaTotal), status: item.status });
                        }} className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: item.id, rute: item.rute })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {!loading && schedules.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 gap-3 text-xs text-gray-500">
            <div>
              Menampilkan <span className="font-semibold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{' '}
              <span className="font-semibold text-gray-800">{Math.min(currentPage * itemsPerPage, schedules.length)}</span> dari{' '}
              <span className="font-semibold text-gray-800">{schedules.length}</span> data jadwal
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <div className="px-3 py-1.5 font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
                {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 font-semibold cursor-pointer"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isAdding && renderFormModal('Tambah Jadwal Baru')}
      {editingItem && renderFormModal(`Edit Jadwal (${editingItem.scheduleCode})`)}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500"><AlertTriangle className="w-6 h-6" /></div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">Hapus Jadwal Travel?</h3>
              <p className="text-xs text-gray-500">Apakah Anda yakin ingin menghapus jadwal <strong>"{deleteModal.id}"</strong> ({deleteModal.rute})? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button type="button" disabled={saving} onClick={() => setDeleteModal({ isOpen: false, id: null, rute: '' })} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs">Batal</button>
              <button type="button" disabled={saving} onClick={confirmDelete} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs shadow-xs">{saving ? 'Menghapus...' : 'Ya, Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}