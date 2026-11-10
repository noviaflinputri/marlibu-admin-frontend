
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Plus,
  X,
} from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ==========================================
// INTERFACE DATABASE
// ==========================================

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
  created_at?: string;
  updated_at?: string;
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
  promo_code: '',
  promo_name: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  max_discount: '',
  min_purchase: '0',
  usage_limit: '',
  per_customer_limit: '',
  starts_at: '',
  ends_at: '',
  status: 'active',
};

// ==========================================
// HELPER
// ==========================================

const getToken = () => {
  if (typeof window === 'undefined') return '';

  return localStorage.getItem('admin_token') || '';
};

const getHeaders = () => {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatRupiah = (value: number | string | null) => {
  if (value === null || value === '') return '-';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const formatDate = (value: string) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDateInput = (value: string) => {
  if (!value) return '';

  return value.slice(0, 10);
};

const getEffectiveStatus = (promo: PromoItem): PromoStatus => {
  if (promo.status === 'inactive') return 'inactive';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(promo.ends_at);

  if (Number.isNaN(endDate.getTime())) return promo.status;

  endDate.setHours(23, 59, 59, 999);

  if (endDate < today) return 'expired';

  return promo.status;
};

const getStatusLabel = (status: PromoStatus) => {
  switch (status) {
    case 'active':
      return 'Aktif';

    case 'inactive':
      return 'Nonaktif';

    case 'expired':
      return 'Kedaluwarsa';

    default:
      return status;
  }
};

const getStatusBadge = (status: PromoStatus) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';

    case 'expired':
      return 'bg-red-100 text-red-700 border-red-200';

    case 'inactive':
      return 'bg-gray-100 text-gray-700 border-gray-200';

    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getDiscountLabel = (promo: PromoItem) => {
  const value = Number(promo.discount_value);

  if (promo.discount_type === 'percentage') {
    const discount = `${value}%`;

    return promo.max_discount
      ? `${discount} (Maks. ${formatRupiah(promo.max_discount)})`
      : discount;
  }

  return formatRupiah(value);
};

// ==========================================
// COMPONENT
// ==========================================

export default function PromoView() {
  const [promos, setPromos] = useState<PromoItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] =
    useState<PromoItem | null>(null);

  const [form, setForm] = useState<PromoForm>(emptyForm);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    kodePromo: string;
  }>({
    isOpen: false,
    id: null,
    kodePromo: '',
  });

  // ==========================================
  // GET PROMOS
  // ==========================================

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_URL}/api/promos`, {
        method: 'GET',
        headers: getHeaders(),
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Gagal mengambil data promo.'
        );
      }

      setPromos(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (error) {
      console.error('Fetch promos error:', error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengambil data promo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  // ==========================================
  // FORM HANDLER
  // ==========================================

  const updateForm = (
    field: keyof PromoForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openAddModal = () => {
    setForm({
      ...emptyForm,
      starts_at: new Date().toISOString().slice(0, 10),
      ends_at: new Date().toISOString().slice(0, 10),
    });

    setEditingItem(null);
    setIsAdding(true);
    setErrorMsg('');
  };

  const openEditModal = (promo: PromoItem) => {
    setForm({
      promo_code: promo.promo_code,
      promo_name: promo.promo_name,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      max_discount:
        promo.max_discount !== null
          ? String(promo.max_discount)
          : '',
      min_purchase: String(promo.min_purchase ?? 0),
      usage_limit:
        promo.usage_limit !== null
          ? String(promo.usage_limit)
          : '',
      per_customer_limit:
        promo.per_customer_limit !== null
          ? String(promo.per_customer_limit)
          : '',
      starts_at: getDateInput(promo.starts_at),
      ends_at: getDateInput(promo.ends_at),
      status: promo.status,
    });

    setEditingItem(promo);
    setIsAdding(false);
    setErrorMsg('');
  };

  const closeFormModal = () => {
    if (saving) return;

    setIsAdding(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    if (!form.promo_code.trim()) {
      setErrorMsg('Kode promo wajib diisi.');
      return false;
    }

    if (!form.promo_name.trim()) {
      setErrorMsg('Nama promo wajib diisi.');
      return false;
    }

    const discount = Number(form.discount_value);

    if (!Number.isFinite(discount) || discount <= 0) {
      setErrorMsg('Besaran diskon harus lebih dari 0.');
      return false;
    }

    if (
      form.discount_type === 'percentage' &&
      discount > 100
    ) {
      setErrorMsg('Diskon persentase tidak boleh lebih dari 100%.');
      return false;
    }

    if (!form.starts_at || !form.ends_at) {
      setErrorMsg('Tanggal mulai dan selesai wajib diisi.');
      return false;
    }

    if (form.ends_at < form.starts_at) {
      setErrorMsg('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return false;
    }

    if (
      form.usage_limit &&
      (!Number.isInteger(Number(form.usage_limit)) ||
        Number(form.usage_limit) < 1)
    ) {
      setErrorMsg('Kuota penggunaan harus berupa angka minimal 1.');
      return false;
    }

    return true;
  };

  // ==========================================
  // CREATE / UPDATE PROMO
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        promo_code: form.promo_code.trim().toUpperCase(),
        promo_name: form.promo_name.trim(),
        description: form.description.trim() || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_discount:
          form.discount_type === 'percentage' && form.max_discount
            ? Number(form.max_discount)
            : null,
        min_purchase: Number(form.min_purchase || 0),
        usage_limit: form.usage_limit
          ? Number(form.usage_limit)
          : null,
        per_customer_limit: form.per_customer_limit
          ? Number(form.per_customer_limit)
          : null,
        starts_at: `${form.starts_at} 00:00:00`,
        ends_at: `${form.ends_at} 23:59:59`,
        status: form.status,
      };

      const isEdit = Boolean(editingItem);

      const url = isEdit
        ? `${API_URL}/api/promos/${editingItem!.id}`
        : `${API_URL}/api/promos`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Gagal menyimpan promo.'
        );
      }

      setSuccessMsg(
        isEdit
          ? 'Promo berhasil diperbarui.'
          : 'Promo berhasil ditambahkan.'
      );

      setIsAdding(false);
      setEditingItem(null);
      setForm(emptyForm);

      await fetchPromos();
    } catch (error) {
      console.error('Save promo error:', error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan promo.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE PROMO
  // ==========================================

  const handleDeleteClick = (
    id: number,
    kodePromo: string
  ) => {
    setDeleteModal({
      isOpen: true,
      id,
      kodePromo,
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.id === null || deleting) return;

    setDeleting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(
        `${API_URL}/api/promos/${deleteModal.id}`,
        {
          method: 'DELETE',
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Gagal menghapus promo.'
        );
      }

      setDeleteModal({
        isOpen: false,
        id: null,
        kodePromo: '',
      });

      setSuccessMsg('Promo berhasil dihapus.');

      await fetchPromos();
    } catch (error) {
      console.error('Delete promo error:', error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghapus promo.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">
            Manajemen Promo & Diskon
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Kelola kode voucher, potongan harga, dan periode promo travel.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchPromos}
            disabled={loading}
            className="p-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="Refresh promo"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Promo
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center justify-between gap-3">
          <span>{errorMsg}</span>

          <button
            onClick={() => setErrorMsg('')}
            className="font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {successMsg && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs flex items-center justify-between gap-3">
          <span>{successMsg}</span>

          <button
            onClick={() => setSuccessMsg('')}
            className="font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TABLE */}

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
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-[#0A64BC] animate-spin" />
                      <span className="text-gray-400">
                        Mengambil data promo...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : promos.length > 0 ? (
                promos.map((item) => {
                  const status = getEffectiveStatus(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0A64BC]">
                        {item.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-[#0A64BC] font-mono font-bold rounded-lg border border-blue-100">
                          {item.promo_code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {item.promo_name}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {getDiscountLabel(item)}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500">
                        {formatDate(item.starts_at)} s/d{' '}
                        {formatDate(item.ends_at)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold">
                        {item.usage_limit !== null
                          ? `${item.usage_limit}x`
                          : 'Tidak terbatas'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(status)}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">

                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-gray-400 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition"
                            title="Edit Promo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteClick(
                                item.id,
                                item.promo_code
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Promo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-400"
                  >
                    Belum ada data promo dari database.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT PROMO */}

      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white p-6 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">

            <div className="flex items-center justify-between mb-5">

              <h3 className="text-base font-bold text-gray-800">
                {editingItem ? 'Edit Promo' : 'Tambah Promo Baru'}
              </h3>

              <button
                onClick={closeFormModal}
                disabled={saving}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">

              {/* KODE PROMO */}

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Kode Promo
                </label>

                <input
                  type="text"
                  value={form.promo_code}
                  onChange={(e) =>
                    updateForm(
                      'promo_code',
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Contoh: LIBURANSERU"
                  required
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC] uppercase"
                />
              </div>

              {/* NAMA PROMO */}

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Nama Promo
                </label>

                <input
                  type="text"
                  value={form.promo_name}
                  onChange={(e) =>
                    updateForm('promo_name', e.target.value)
                  }
                  placeholder="Contoh: Diskon Akhir Tahun"
                  required
                  maxLength={150}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              {/* DESKRIPSI */}

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Deskripsi
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateForm('description', e.target.value)
                  }
                  placeholder="Deskripsi promo (opsional)"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              {/* JENIS DISKON */}

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Jenis Diskon
                  </label>

                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      updateForm(
                        'discount_type',
                        e.target.value
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Besaran Diskon
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) =>
                      updateForm(
                        'discount_value',
                        e.target.value
                      )
                    }
                    placeholder={
                      form.discount_type === 'percentage'
                        ? 'Contoh: 20'
                        : 'Contoh: 25000'
                    }
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>

              </div>

              {/* BATAS DISKON */}

              {form.discount_type === 'percentage' && (
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Maksimal Diskon (Rp)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.max_discount}
                    onChange={(e) =>
                      updateForm(
                        'max_discount',
                        e.target.value
                      )
                    }
                    placeholder="Contoh: 50000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>
              )}

              {/* MINIMUM PEMBELIAN */}

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Minimum Pembelian (Rp)
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.min_purchase}
                  onChange={(e) =>
                    updateForm('min_purchase', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                />
              </div>

              {/* KUOTA */}

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Kuota Penggunaan
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.usage_limit}
                    onChange={(e) =>
                      updateForm('usage_limit', e.target.value)
                    }
                    placeholder="Kosong = unlimited"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Limit per Pelanggan
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.per_customer_limit}
                    onChange={(e) =>
                      updateForm(
                        'per_customer_limit',
                        e.target.value
                      )
                    }
                    placeholder="Opsional"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>

              </div>

              {/* PERIODE */}

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Tanggal Mulai
                  </label>

                  <input
                    type="date"
                    value={form.starts_at}
                    onChange={(e) =>
                      updateForm('starts_at', e.target.value)
                    }
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">
                    Tanggal Selesai
                  </label>

                  <input
                    type="date"
                    value={form.ends_at}
                    onChange={(e) =>
                      updateForm('ends_at', e.target.value)
                    }
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                  />
                </div>

              </div>

              {/* STATUS */}

              <div>
                <label className="block text-gray-600 font-semibold mb-1">
                  Status Promo
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    updateForm('status', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              {/* BUTTON */}

              <div className="flex justify-end gap-2 pt-4">

                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {saving
                    ? 'Menyimpan...'
                    : editingItem
                      ? 'Simpan Perubahan'
                      : 'Simpan Promo'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">

              <h3 className="text-base font-bold text-gray-800">
                Hapus Promo?
              </h3>

              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin menghapus kode promo{' '}
                <strong>"{deleteModal.kodePromo}"</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>

            </div>

            <div className="flex items-center justify-center gap-3 pt-2">

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    id: null,
                    kodePromo: '',
                  })
                }
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}

                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
