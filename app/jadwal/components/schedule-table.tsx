'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';

// ========================================
// CONFIG API
// ========================================

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  'http://localhost:5001/api';

// Pastikan URL selalu memiliki prefix /api
const API_URL = (() => {
  const cleaned = RAW_API_URL.replace(/\/+$/, '');

  return /\/api$/i.test(cleaned)
    ? cleaned
    : `${cleaned}/api`;
})();

// ========================================
// INTERFACES
// ========================================

interface RouteOption {
  id: number;
  route_code: string;
  origin_city: string;
  destination_city: string;
}

interface TransportOption {
  id: number;
  transport_code: string;
  vehicle_name: string;
  capacity: number;
  status: string;
}

type ScheduleStatus =
  | 'scheduled'
  | 'boarding'
  | 'departed'
  | 'completed'
  | 'cancelled';

interface ScheduleResponse {
  id: number;
  schedule_code: string;
  route_id: number;
  transport_id: number;
  departure_datetime: string;
  arrival_datetime?: string | null;
  price: number | string;
  quota: number;
  status: ScheduleStatus;
  notes?: string | null;
  origin_city?: string;
  destination_city?: string;
  vehicle_name?: string;
}

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

interface ApiResult<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Hindari masalah parsing tanggal akibat timezone.
const formatDateTime = (value: string) => {
  const normalized = value.replace('T', ' ');
  const [datePart, timePart = ''] = normalized.split(' ');

  return {
    tanggal: datePart.slice(0, 10),
    jam: timePart.slice(0, 5),
  };
};

const getStatusLabel = (status: ScheduleStatus) => {
  const labels: Record<ScheduleStatus, string> = {
    scheduled: 'Dijadwalkan',
    boarding: 'Boarding',
    departed: 'Berangkat',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  return labels[status] || status;
};

const getStatusBadge = (status: ScheduleStatus) => {
  switch (status) {
    case 'scheduled':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';

    case 'boarding':
      return 'bg-amber-100 text-amber-700 border-amber-200';

    case 'departed':
      return 'bg-blue-100 text-blue-700 border-blue-200';

    case 'completed':
      return 'bg-gray-100 text-gray-700 border-gray-200';

    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';

    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// ========================================
// COMPONENT
// ========================================

export default function ScheduleTable() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ScheduleItem | null>(null);

  const [optionsLoaded, setOptionsLoaded] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
    rute: string;
  }>({
    isOpen: false,
    id: null,
    rute: '',
  });

  const [formData, setFormData] = useState<FormData>({
    routeId: '',
    tanggal: '',
    jam: '08:00',
    transportId: '',
    hargaTiket: '150000',
    kuota: '',
    status: 'scheduled',
  });

  // ========================================
  // API REQUEST
  // ========================================

  const apiRequest = async <T,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResult<T>> => {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');

    const url = `${API_URL}/${cleanEndpoint}`;

    console.log('REQUEST URL:', url);

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (err) {
      console.error('API CONNECTION ERROR:', err);

      throw new Error(
        'Tidak dapat terhubung ke backend. Pastikan server berjalan di port 5001.'
      );
    }

    const responseText = await response.text();

    let result: ApiResult<T>;

    try {
      result = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      console.error('Invalid API response:', responseText);

      throw new Error(
        `Response API bukan JSON. HTTP ${response.status}`
      );
    }

    console.log('RESPONSE STATUS:', response.status);
    console.log('RESPONSE DATA:', result);

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message ||
          `Request gagal. HTTP ${response.status}`
      );
    }

    return result;
  };

  // ========================================
  // FETCH ROUTES AND TRANSPORTS
  // ========================================

  const fetchOptions = useCallback(async () => {
    console.log('Mengambil data Routes dan Transports...');

    const [routeResult, transportResult] = await Promise.all([
      apiRequest<RouteOption[]>('/routes'),
      apiRequest<TransportOption[]>('/transports'),
    ]);

    const routeData = Array.isArray(routeResult.data)
      ? routeResult.data
      : [];

    const transportData = Array.isArray(transportResult.data)
      ? transportResult.data
      : [];

    setRoutes(routeData);
    setTransports(transportData);

    console.log('ROUTES:', routeData);
    console.log('TRANSPORTS:', transportData);
  }, []);

  // ========================================
  // FETCH SCHEDULES
  // ========================================

  const fetchSchedules = useCallback(async () => {
    console.log('Mengambil data Schedules...');

    const result =
      await apiRequest<ScheduleResponse[]>('/schedules');

    const data = Array.isArray(result.data)
      ? result.data
      : [];

    const mappedData: ScheduleItem[] = data.map((item) => {
      const dateTime = formatDateTime(
        item.departure_datetime
      );

      const route = routes.find(
        (r) => r.id === Number(item.route_id)
      );

      const transport = transports.find(
        (t) => t.id === Number(item.transport_id)
      );

      return {
        id: Number(item.id),

        scheduleCode: item.schedule_code,

        routeId: Number(item.route_id),

        transportId: Number(item.transport_id),

        rute:
          item.origin_city && item.destination_city
            ? `${item.origin_city} - ${item.destination_city}`
            : route
              ? `${route.origin_city} - ${route.destination_city}`
              : `Rute #${item.route_id}`,

        tanggalWaktu: dateTime.tanggal,

        jam: `${dateTime.jam} WIB`,

        unitKendaraan:
          item.vehicle_name ||
          transport?.vehicle_name ||
          `Kendaraan #${item.transport_id}`,

        hargaTiket: Number(item.price),

        kuotaTerisi: 0,

        kuotaTotal: Number(item.quota),

        status: item.status,
      };
    });

    setSchedules(mappedData);

    console.log('SCHEDULES:', mappedData);
  }, [routes, transports]);

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setLoading(true);
      setError('');

      try {
        await fetchOptions();

        if (active) {
          setOptionsLoaded(true);
        }
      } catch (err) {
        console.error('Load options error:', err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil data rute dan kendaraan.'
          );

          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, [fetchOptions]);

  // ========================================
  // LOAD SCHEDULE AFTER OPTIONS
  // ========================================

  useEffect(() => {
    if (!optionsLoaded) return;

    let active = true;

    const loadSchedules = async () => {
      setLoading(true);

      try {
        await fetchSchedules();
      } catch (err) {
        console.error('Load schedule error:', err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat data jadwal.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSchedules();

    return () => {
      active = false;
    };
  }, [optionsLoaded, fetchSchedules]);

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setFormData({
      routeId: routes[0]
        ? String(routes[0].id)
        : '',

      tanggal: new Date()
        .toLocaleDateString('en-CA'),

      jam: '08:00',

      transportId: transports[0]
        ? String(transports[0].id)
        : '',

      hargaTiket: '150000',

      kuota: transports[0]
        ? String(transports[0].capacity)
        : '',

      status: 'scheduled',
    });
  };

  // ========================================
  // TRANSPORT CHANGE
  // ========================================

  const handleTransportChange = (transportId: string) => {
    const selected = transports.find(
      (transport) =>
        transport.id === Number(transportId)
    );

    setFormData((prev) => ({
      ...prev,
      transportId,
      kuota: selected
        ? String(selected.capacity)
        : prev.kuota,
    }));
  };

  // ========================================
  // PRICE CHANGE
  // ========================================

  const handleHargaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawNumber = e.target.value.replace(/\D/g, '');

    setFormData((prev) => ({
      ...prev,
      hargaTiket: rawNumber,
    }));
  };

  // ========================================
  // CREATE PAYLOAD
  // ========================================

  const createPayload = () => {
    return {
      schedule_code:
        editingItem?.scheduleCode ||
        `SCH-${Date.now()}`,

      route_id: Number(formData.routeId),

      transport_id: Number(formData.transportId),

      departure_datetime:
        `${formData.tanggal} ${formData.jam}:00`,

      price: Number(formData.hargaTiket),

      quota: Number(formData.kuota),

      status: formData.status,
    };
  };

  // ========================================
  // VALIDATE FORM
  // ========================================

  const validateForm = () => {
    if (!formData.routeId || !formData.transportId) {
      setError('Silakan pilih rute dan kendaraan.');
      return false;
    }

    if (!formData.tanggal || !formData.jam) {
      setError('Tanggal dan jam keberangkatan wajib diisi.');
      return false;
    }

    if (
      !formData.hargaTiket ||
      Number(formData.hargaTiket) <= 0
    ) {
      setError('Harga tiket harus lebih dari 0.');
      return false;
    }

    if (
      !formData.kuota ||
      Number(formData.kuota) <= 0
    ) {
      setError('Kuota kursi harus lebih dari 0.');
      return false;
    }

    return true;
  };

  // ========================================
  // ADD SCHEDULE
  // ========================================

  const handleAddSchedule = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      await apiRequest('/schedules', {
        method: 'POST',
        body: JSON.stringify(createPayload()),
      });

      setIsAdding(false);
      resetForm();

      await fetchSchedules();

      alert('Jadwal berhasil ditambahkan!');
    } catch (err) {
      console.error('Create schedule error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menambahkan jadwal.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // OPEN EDIT MODAL
  // ========================================

  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);

    setFormData({
      routeId: String(item.routeId),

      tanggal: item.tanggalWaktu,

      jam: item.jam.replace(' WIB', ''),

      transportId: String(item.transportId),

      hargaTiket: String(item.hargaTiket),

      kuota: String(item.kuotaTotal),

      status: item.status,
    });

    setError('');
  };

  // ========================================
  // UPDATE SCHEDULE
  // ========================================

  const handleSaveEdit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingItem || !validateForm()) return;

    setSaving(true);
    setError('');

    try {
      await apiRequest(
        `/schedules/${editingItem.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(createPayload()),
        }
      );

      setEditingItem(null);
      resetForm();

      await fetchSchedules();

      alert('Jadwal berhasil diperbarui!');
    } catch (err) {
      console.error('Update schedule error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memperbarui jadwal.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // DELETE SCHEDULE
  // ========================================

  const confirmDelete = async () => {
    if (deleteModal.id === null) return;

    setSaving(true);
    setError('');

    try {
      await apiRequest(
        `/schedules/${deleteModal.id}`,
        {
          method: 'DELETE',
        }
      );

      setDeleteModal({
        isOpen: false,
        id: null,
        rute: '',
      });

      await fetchSchedules();

      alert('Jadwal berhasil dihapus!');
    } catch (err) {
      console.error('Delete schedule error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus jadwal.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // FORM COMPONENT
  // ========================================

  const renderForm = (
    onSubmit: (e: React.FormEvent) => void,
    title: string
  ) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">

        <h3 className="text-base font-bold text-gray-800">
          {title}
        </h3>

        <form onSubmit={onSubmit} className="space-y-3">

          {/* RUTE */}

          <div>
            <label className="block text-gray-600 font-semibold mb-1">
              Rute Perjalanan
            </label>

            <select
              value={formData.routeId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  routeId: e.target.value,
                }))
              }
              required
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
            >
              <option value="">Pilih Rute</option>

              {routes.map((route) => (
                <option
                  key={route.id}
                  value={route.id}
                >
                  {route.origin_city} - {route.destination_city}
                </option>
              ))}
            </select>
          </div>

          {/* TANGGAL DAN JAM */}

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Tanggal Keberangkatan
              </label>

              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tanggal: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Jam Keberangkatan
              </label>

              <input
                type="time"
                value={formData.jam}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jam: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
              />
            </div>

          </div>

          {/* KENDARAAN */}

          <div>
            <label className="block text-gray-600 font-semibold mb-1">
              Unit Kendaraan
            </label>

            <select
              value={formData.transportId}
              onChange={(e) =>
                handleTransportChange(e.target.value)
              }
              required
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
            >
              <option value="">Pilih Kendaraan</option>

              {transports.map((transport) => (
                <option
                  key={transport.id}
                  value={transport.id}
                  disabled={
                    transport.status !== 'available' &&
                    transport.id !== editingItem?.transportId
                  }
                >
                  {transport.vehicle_name}
                  {' '}(Kapasitas: {transport.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* HARGA */}

          <div>
            <label className="block text-gray-600 font-semibold mb-1">
              Harga Tiket
            </label>

            <input
              type="text"
              value={formData.hargaTiket}
              onChange={handleHargaChange}
              required
              placeholder="Contoh: 150000"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
            />

            <p className="text-gray-400 mt-1">
              {formData.hargaTiket
                ? formatRupiah(Number(formData.hargaTiket))
                : 'Rp 0'}
            </p>
          </div>

          {/* KUOTA */}

          <div>
            <label className="block text-gray-600 font-semibold mb-1">
              Kuota Kursi
            </label>

            <input
              type="number"
              min="1"
              max={
                transports.find(
                  (t) => t.id === Number(formData.transportId)
                )?.capacity
              }
              value={formData.kuota}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  kuota: e.target.value,
                }))
              }
              required
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="block text-gray-600 font-semibold mb-1">
              Status Jadwal
            </label>

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as ScheduleStatus,
                }))
              }
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
            >
              <option value="scheduled">Dijadwalkan</option>
              <option value="boarding">Boarding</option>
              <option value="departed">Berangkat</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          {/* BUTTON */}

          <div className="flex justify-end gap-2 pt-3">

            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setIsAdding(false);
                setEditingItem(null);
                resetForm();
                setError('');
              }}
              className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !routes.length ||
                !transports.length
              }
              className="px-5 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">
            Jadwal & Rute Travel
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Kelola jam keberangkatan, rute, ketersediaan kursi, dan armada travel.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setError('');
            setIsAdding(true);
          }}
          disabled={!optionsLoaded || !routes.length || !transports.length}
          className="px-4 py-2.5 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          + Tambah Jadwal
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex justify-between items-center gap-3">
          <span>{error}</span>

          <button
            onClick={() => setError('')}
            className="font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* TABLE */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs whitespace-nowrap">

            <thead className="bg-white border-b border-gray-100">
              <tr>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  ID JADWAL
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  RUTE PERJALANAN
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  TANGGAL & WAKTU
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  UNIT KENDARAAN
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  HARGA TIKET
                </th>

                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase tracking-wider">
                  KUOTA KURSI
                </th>

                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase tracking-wider">
                  STATUS
                </th>

                <th className="py-3.5 px-4 text-center w-24 text-gray-900 font-bold uppercase tracking-wider">
                  AKSI
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">

              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-gray-400"
                  >
                    Memuat data jadwal...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-gray-400"
                  >
                    Belum ada data jadwal perjalanan.
                  </td>
                </tr>
              ) : (
                schedules.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 transition"
                  >

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {item.scheduleCode}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#0A64BC]">
                      {item.rute}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="font-medium text-gray-800">
                        {item.tanggalWaktu}
                      </div>

                      <div className="text-[10px] text-gray-400">
                        Jam: {item.jam}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-800 font-medium">
                      {item.unitKendaraan}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {formatRupiah(item.hargaTiket)}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-gray-700">

                      <span className="text-gray-900 font-bold">
                        {item.kuotaTerisi}
                      </span>

                      <span className="text-gray-400 font-normal">
                        {' '}/ {item.kuotaTotal}
                      </span>

                    </td>

                    <td className="py-3.5 px-4 text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}
                      >
                        {getStatusLabel(item.status)}
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
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              id: item.id,
                              rute: item.rute,
                            })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL ADD */}

      {isAdding &&
        renderForm(
          handleAddSchedule,
          'Tambah Jadwal Baru'
        )}

      {/* MODAL EDIT */}

      {editingItem &&
        renderForm(
          handleSaveEdit,
          `Edit Jadwal (${editingItem.scheduleCode})`
        )}

      {/* MODAL DELETE */}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">

          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">

              <h3 className="text-base font-bold text-gray-800">
                Hapus Jadwal Travel?
              </h3>

              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin menghapus jadwal{' '}
                <strong>
                  "{deleteModal.id}"
                </strong>{' '}
                ({deleteModal.rute})? Tindakan ini tidak dapat dibatalkan.
              </p>

            </div>

            <div className="flex items-center justify-center gap-3 pt-2">

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    id: null,
                    rute: '',
                  })
                }
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={confirmDelete}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}