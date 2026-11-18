'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, AlertTriangle, Loader2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

type PromoStatus = 'active' | 'inactive' | 'expired';
type DiscountType = 'percentage' | 'fixed';

interface PromoItem {
  id: number;
  promo_code: string;
  promo_name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number | string;
  max_discount: number | string | null;
  min_purchase: number | string;
  usage_limit: number | null;
  per_customer_limit: number | null;
  starts_at: string;
  ends_at: string;
  status: PromoStatus;
}

interface PromoForm {
  promo_code: string;
  promo_name: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  max_discount: string;
  min_purchase: string;
  usage_limit: string;
  per_customer_limit: string;
  starts_at: string;
  ends_at: string;
  status: PromoStatus;
}

const emptyForm: PromoForm = {
  promo_code: '', promo_name: '', description: '', discount_type: 'percentage',
  discount_value: '', max_discount: '', min_purchase: '0', usage_limit: '',
  per_customer_limit: '', starts_at: '', ends_at: '', status: 'active',
};

const getHeaders = () => {
  const token = typeof window === 'undefined' ? '' : localStorage.getItem('admin_token') || '';
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const formatRupiah = (val: number | string | null) => val === null || val === '' ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val) || 0);

const formatDate = (val: string) => {
  if (!val) return '-';
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? val.slice(0, 10) : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getEffectiveStatus = (promo: PromoItem): PromoStatus => {
  if (promo.status === 'inactive') return 'inactive';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(promo.ends_at);
  if (Number.isNaN(end.getTime())) return promo.status;
  end.setHours(23, 59, 59, 999);
  return end < today ? 'expired' : promo.status;
};

export default function PromoView() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoItem | null>(null);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; kodePromo: string }>({
    isOpen: false, id: null, kodePromo: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPromos = useCallback(async () => {
    setLoading(true); setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/promos`, { method: 'GET', headers: getHeaders(), cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Gagal mengambil data promo.');
      setPromos(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data promo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const totalPages = Math.ceil(promos.length / itemsPerPage) || 1;
  const currentPromos = promos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const updateForm = (field: keyof PromoForm, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const openAddModal = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setForm({ ...emptyForm, starts_at: todayStr, ends_at: todayStr });
    setEditingItem(null); setIsAdding(true); setErrorMsg('');
  };

  const openEditModal = (promo: PromoItem) => {
    setForm({
      promo_code: promo.promo_code,
      promo_name: promo.promo_name,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      max_discount: promo.max_discount !== null ? String(promo.max_discount) : '',
      min_purchase: String(promo.min_purchase ?? 0),
      usage_limit: promo.usage_limit !== null ? String(promo.usage_limit) : '',
      per_customer_limit: promo.per_customer_limit !== null ? String(promo.per_customer_limit) : '',
      starts_at: promo.starts_at ? promo.starts_at.slice(0, 10) : '',
      ends_at: promo.ends_at ? promo.ends_at.slice(0, 10) : '',
      status: promo.status,
    });
    setEditingItem(promo); setIsAdding(false); setErrorMsg('');
  };

  const closeFormModal = () => {
    if (saving) return;
    setIsAdding(false); setEditingItem(null); setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');

    if (!form.promo_code.trim() || !form.promo_name.trim()) { setErrorMsg('Kode dan nama promo wajib diisi.'); return; }
    const discount = Number(form.discount_value);
    if (!Number.isFinite(discount) || discount <= 0) { setErrorMsg('Besaran diskon harus lebih dari 0.'); return; }
    if (form.discount_type === 'percentage' && discount > 100) { setErrorMsg('Diskon persentase maksimal 100%.'); return; }
    if (form.ends_at < form.starts_at) { setErrorMsg('Tanggal selesai tidak boleh sebelum tanggal mulai.'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        promo_code: form.promo_code.trim().toUpperCase(),
        promo_name: form.promo_name.trim(),
        description: form.description.trim() || null,
        discount_value: Number(form.discount_value),
        max_discount: form.discount_type === 'percentage' && form.max_discount ? Number(form.max_discount) : null,
        min_purchase: Number(form.min_purchase || 0),
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        per_customer_limit: form.per_customer_limit ? Number(form.per_customer_limit) : null,
        starts_at: `${form.starts_at} 00:00:00`,
        ends_at: `${form.ends_at} 23:59:59`,
      };

      const isEdit = Boolean(editingItem);
      const res = await fetch(`${API_URL}/api/promos${isEdit ? `/${editingItem!.id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Gagal menyimpan promo.');

      setSuccessMsg(isEdit ? 'Promo berhasil diperbarui.' : 'Promo berhasil ditambahkan.');
      closeFormModal();
      fetchPromos();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan promo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.id === null || deleting) return;
    setDeleting(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/promos/${deleteModal.id}`, { method: 'DELETE', headers: getHeaders() });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Gagal menghapus promo.');

      setDeleteModal({ isOpen: false, id: null, kodePromo: '' });
      setSuccessMsg('Promo berhasil dihapus.');
      fetchPromos();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus promo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Manajemen Promo & Diskon</h1>
          <p className="text-xs text-gray-500 mt-1">Kelola kode voucher, potongan harga, dan periode promo travel.</p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> Tambah Promo
        </button>
      </div>

      {errorMsg && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex justify-between items-center"><span>{errorMsg}</span><button onClick={() => setErrorMsg('')} className="cursor-pointer"><X className="w-4 h-4" /></button></div>}
      {successMsg && <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs flex justify-between items-center"><span>{successMsg}</span><button onClick={() => setSuccessMsg('')} className="cursor-pointer"><X className="w-4 h-4" /></button></div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">KODE PROMO</th>
                <th className="py-3.5 px-4">NAMA PROMO</th>
                <th className="py-3.5 px-4">BESARAN DISKON</th>
                <th className="py-3.5 px-4">PERIODE BERLAKU</th>
                <th className="py-3.5 px-4 text-center">PENGGUNAAN</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center"><Loader2 className="w-6 h-6 text-[#0A64BC] animate-spin mx-auto mb-2" /><span className="text-gray-400">Mengambil data promo...</span></td></tr>
              ) : currentPromos.length > 0 ? (
                currentPromos.map(item => {
                  const status = getEffectiveStatus(item);
                  const badgeColor = status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : status === 'expired' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200';
                  const discountLabel = item.discount_type === 'percentage' ? `${Number(item.discount_value)}%${item.max_discount ? ` (Maks. ${formatRupiah(item.max_discount)})` : ''}` : formatRupiah(item.discount_value);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-[#0A64BC]">{item.id}</td>
                      <td className="py-3.5 px-4"><span className="px-2.5 py-1 bg-blue-50 text-[#0A64BC] font-mono font-bold rounded-lg border border-blue-100">{item.promo_code}</span></td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">{item.promo_name}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{discountLabel}</td>
                      <td className="py-3.5 px-4 text-gray-500">{formatDate(item.starts_at)} s/d {formatDate(item.ends_at)}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{item.usage_limit !== null ? `${item.usage_limit}x` : 'Tidak terbatas'}</td>
                      <td className="py-3.5 px-4 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${badgeColor}`}>{status === 'active' ? 'Aktif' : status === 'expired' ? 'Kedaluwarsa' : 'Nonaktif'}</span></td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition cursor-pointer"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: item.id, kodePromo: item.promo_code })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">Belum ada data promo dari database.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER PAGINATION */}
        {!loading && promos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 p-4 gap-3 text-xs text-gray-500 bg-white">
            <div>
              Menampilkan <span className="font-semibold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{' '}
              <span className="font-semibold text-gray-800">{Math.min(currentPage * itemsPerPage, promos.length)}</span> dari{' '}
              <span className="font-semibold text-gray-800">{promos.length}</span> data promo
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold cursor-pointer transition"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <div className="px-3 py-1.5 font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
                {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold cursor-pointer transition"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-800">{editingItem ? 'Edit Promo' : 'Tambah Promo Baru'}</h3>
              <button onClick={closeFormModal} disabled={saving} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Kode Promo</label>
                <input type="text" value={form.promo_code} onChange={e => updateForm('promo_code', e.target.value.toUpperCase())} placeholder="Contoh: LIBURANSERU" required maxLength={50} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl uppercase focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Nama Promo</label>
                <input type="text" value={form.promo_name} onChange={e => updateForm('promo_name', e.target.value)} placeholder="Contoh: Diskon Akhir Tahun" required maxLength={150} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Deskripsi promo (opsional)" rows={2} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Jenis Diskon</label>
                  <select value={form.discount_type} onChange={e => updateForm('discount_type', e.target.value as DiscountType)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] cursor-pointer">
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Besaran Diskon</label>
                  <input type="number" min="0" step="0.01" value={form.discount_value} onChange={e => updateForm('discount_value', e.target.value)} placeholder={form.discount_type === 'percentage' ? 'Contoh: 20' : 'Contoh: 25000'} required className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                </div>
              </div>
              {form.discount_type === 'percentage' && (
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Maksimal Diskon (Rp)</label>
                  <input type="number" min="0" value={form.max_discount} onChange={e => updateForm('max_discount', e.target.value)} placeholder="Contoh: 50000" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                </div>
              )}
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Minimum Pembelian (Rp)</label>
                <input type="number" min="0" value={form.min_purchase} onChange={e => updateForm('min_purchase', e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Kuota Penggunaan</label>
                  <input type="number" min="1" value={form.usage_limit} onChange={e => updateForm('usage_limit', e.target.value)} placeholder="Kosong = unlimited" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Limit per Pelanggan</label>
                  <input type="number" min="1" value={form.per_customer_limit} onChange={e => updateForm('per_customer_limit', e.target.value)} placeholder="Opsional" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Mulai</label>
                  <input type="date" value={form.starts_at} onChange={e => updateForm('starts_at', e.target.value)} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Tanggal Selesai</label>
                  <input type="date" value={form.ends_at} onChange={e => updateForm('ends_at', e.target.value)} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]" />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Status Promo</label>
                <select value={form.status} onChange={e => updateForm('status', e.target.value as PromoStatus)} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] cursor-pointer">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={closeFormModal} disabled={saving} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] flex items-center gap-2 cursor-pointer">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500"><AlertTriangle className="w-6 h-6" /></div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">Hapus Promo?</h3>
              <p className="text-xs text-gray-500">Apakah Anda yakin ingin menghapus kode promo <strong>"{deleteModal.kodePromo}"</strong>?</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={deleting} onClick={() => setDeleteModal({ isOpen: false, id: null, kodePromo: '' })} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-xs cursor-pointer">Batal</button>
              <button disabled={deleting} onClick={confirmDelete} className="w-full py-2.5 bg-red-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}