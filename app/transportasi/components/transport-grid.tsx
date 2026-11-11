
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2, AlertTriangle, RefreshCw, X } from 'lucide-react';

// ======================================================
// API CONFIGURATION
// ======================================================

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
).replace(/\/+$/, '');

const API_URL = API_ORIGIN.endsWith('/api')
  ? API_ORIGIN
  : `${API_ORIGIN}/api`;

// ======================================================
// TYPES
// ======================================================

type BackendStatus =
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'inactive';

type FrontendStatus =
  | 'Tersedia'
  | 'Dalam Perjalanan'
  | 'Perawatan';

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

interface BackendTransport {
  id: number;
  transport_code: string;
  vehicle_name: string;
  vehicle_type: string;
  plate_number: string;
  capacity: number;
  facilities?: string | null;
  description?: string | null;
  image_url?: string | null;
  status: BackendStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const initialMobilOptions = [
  { unit: 'Toyota Hiace Premio', kapasitas: '11 Penumpang' },
  { unit: 'Toyota Hiace Commuter', kapasitas: '14 Penumpang' },
  { unit: 'Innova Reborn', kapasitas: '7 Penumpang' },
  { unit: 'Avanza Veloz', kapasitas: '6 Penumpang' },
  { unit: 'Elf Long', kapasitas: '19 Penumpang' },
];

// ======================================================
// STATUS CONVERSION
// ======================================================

const toFrontendStatus = (
  status: BackendStatus
): FrontendStatus => {
  switch (status) {
    case 'available':
      return 'Tersedia';

    case 'in_use':
      return 'Dalam Perjalanan';

    case 'maintenance':
    case 'inactive':
      return 'Perawatan';

    default:
      return 'Tersedia';
  }
};

const toBackendStatus = (
  status: FrontendStatus
): BackendStatus => {
  switch (status) {
    case 'Tersedia':
      return 'available';

    case 'Dalam Perjalanan':
      return 'in_use';

    case 'Perawatan':
      return 'maintenance';
  }
};

// ======================================================
// API HELPERS
// ======================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();

  let result: ApiResponse<T> | null = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Server mengembalikan respons yang bukan JSON. HTTP ${response.status}`
    );
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
      `Permintaan gagal. HTTP ${response.status}`
    );
  }

  return result.data;
}

// ======================================================
// COMPONENT
// ======================================================

export default function TransportGrid() {
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [mobilOptions, setMobilOptions] = useState(initialMobilOptions);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] =
    useState<TransportItem | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: TransportItem | null;
  }>({
    isOpen: false,
    item: null,
  });

  // ====================================================
  // FORM STATES
  // ====================================================

  const [platDepan, setPlatDepan] = useState('');
  const [platAngka, setPlatAngka] = useState('');
  const [platBelakang, setPlatBelakang] = useState('');

  const [unitMobil, setUnitMobil] = useState(
    initialMobilOptions[0].unit
  );

  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState('');

  const [kapasitas, setKapasitas] = useState(
    initialMobilOptions[0].kapasitas
  );

  const [isCustomKapasitas, setIsCustomKapasitas] =
    useState(false);

  const [customKapasitasNum, setCustomKapasitasNum] =
    useState('');

  const [status, setStatus] =
    useState<FrontendStatus>('Tersedia');

  const [platErrors, setPlatErrors] = useState({
    depan: '',
    angka: '',
    belakang: '',
  });

  // ====================================================
  // FETCH DATA
  // ====================================================

  const fetchTransports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiRequest<BackendTransport[]>(
        '/transports',
        { method: 'GET' }
      );

      const mappedData: TransportItem[] = data.map(
        (item, index) => ({
          id: item.id,
          transport_code: item.transport_code,
          vehicle_type: item.vehicle_type,
          no: index + 1,
          platNomor: item.plate_number,
          unitMobil: item.vehicle_name,
          kapasitas: `${item.capacity} Penumpang`,
          status: toFrontendStatus(item.status),
        })
      );

      setTransports(mappedData);

      // Menambahkan unit dari database ke dropdown
      setMobilOptions((previous) => {
        const options = [...previous];

        mappedData.forEach((item) => {
          const exists = options.some(
            (option) => option.unit === item.unitMobil
          );

          if (!exists) {
            options.push({
              unit: item.unitMobil,
              kapasitas: item.kapasitas,
            });
          }
        });

        return options;
      });
    } catch (err) {
      console.error('Fetch transports error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data transportasi'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransports();
  }, [fetchTransports]);

  // ====================================================
  // GENERATE TRANSPORT CODE
  // ====================================================

  const generateTransportCode = () => {
    const maxNumber = transports.reduce((max, item) => {
      const match = item.transport_code.match(/^TRP-(\d+)$/i);

      return match
        ? Math.max(max, Number(match[1]))
        : max;
    }, 0);

    return `TRP-${String(maxNumber + 1).padStart(3, '0')}`;
  };

  // ====================================================
  // RESET FORM
  // ====================================================

  const resetForm = () => {
    setPlatDepan('');
    setPlatAngka('');
    setPlatBelakang('');

    setUnitMobil(
      mobilOptions[0]?.unit || 'Innova Reborn'
    );

    setIsCustomUnit(false);
    setCustomUnit('');

    setKapasitas(
      mobilOptions[0]?.kapasitas || '7 Penumpang'
    );

    setIsCustomKapasitas(false);
    setCustomKapasitasNum('');

    setStatus('Tersedia');

    setPlatErrors({
      depan: '',
      angka: '',
      belakang: '',
    });

    setError('');
  };

  // ====================================================
  // PLATE NUMBER VALIDATION
  // ====================================================

  const handlePlatDepan = (val: string) => {
    const hasInvalid = /[^a-zA-Z]/.test(val);
    const clean = val
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase();

    setPlatDepan(clean);

    setPlatErrors((prev) => ({
      ...prev,
      depan: hasInvalid
        ? 'Kode depan hanya boleh huruf!'
        : '',
    }));
  };

  const handlePlatAngka = (val: string) => {
    const hasInvalid = /[^0-9]/.test(val);
    const clean = val.replace(/[^0-9]/g, '');

    setPlatAngka(clean);

    setPlatErrors((prev) => ({
      ...prev,
      angka: hasInvalid
        ? 'Harus diisi angka!'
        : '',
    }));
  };

  const handlePlatBelakang = (val: string) => {
    const hasInvalid = /[^a-zA-Z]/.test(val);
    const clean = val
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase();

    setPlatBelakang(clean);

    setPlatErrors((prev) => ({
      ...prev,
      belakang: hasInvalid
        ? 'Kode belakang hanya boleh huruf!'
        : '',
    }));
  };

  // ====================================================
  // FORM VALIDATION
  // ====================================================

  const validateForm = () => {
    const errors = {
      depan: '',
      angka: '',
      belakang: '',
    };

    if (!platDepan || platDepan.length > 2) {
      errors.depan = 'Kode depan wajib 1-2 huruf!';
    }

    if (
      !platAngka ||
      platAngka.length < 1 ||
      platAngka.length > 4
    ) {
      errors.angka = 'Nomor harus 1-4 angka!';
    }

    if (
      !platBelakang ||
      platBelakang.length > 3
    ) {
      errors.belakang = 'Kode belakang wajib 1-3 huruf!';
    }

    setPlatErrors(errors);

    if (
      errors.depan ||
      errors.angka ||
      errors.belakang
    ) {
      return false;
    }

    if (isCustomUnit && !customUnit.trim()) {
      setError('Nama unit mobil wajib diisi');
      return false;
    }

    if (isCustomKapasitas) {
      const number = Number(customKapasitasNum);

      if (
        !Number.isInteger(number) ||
        number <= 0
      ) {
        setError('Kapasitas harus berupa angka lebih dari 0');
        return false;
      }
    }

    return true;
  };

  // ====================================================
  // PREPARE PAYLOAD
  // ====================================================

  const getFormData = () => {
    const finalUnit = isCustomUnit
      ? customUnit.trim()
      : unitMobil;

    const finalCapacity = isCustomKapasitas
      ? Number(customKapasitasNum)
      : Number(kapasitas.replace(/\D/g, ''));

    const fullPlate =
      `${platDepan} ${platAngka} ${platBelakang}`;

    return {
      transport_code:
        editingItem?.transport_code || generateTransportCode(),

      vehicle_name: finalUnit,

      // Backend membutuhkan vehicle_type.
      // UI lama tidak memiliki input terpisah untuk field ini.
      vehicle_type: editingItem?.vehicle_type || finalUnit,

      plate_number: fullPlate,

      capacity: finalCapacity,

      facilities: null,
      description: null,
      image_url: null,

      status: toBackendStatus(status),
    };
  };

  // ====================================================
  // ADD TRANSPORT
  // ====================================================

  const handleAddTransport = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const payload = getFormData();

      await apiRequest<BackendTransport>(
        '/transports',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );

      // Simpan unit baru untuk dropdown
      if (
        isCustomUnit &&
        !mobilOptions.some(
          (item) => item.unit === payload.vehicle_name
        )
      ) {
        setMobilOptions((prev) => [
          ...prev,
          {
            unit: payload.vehicle_name,
            kapasitas: `${payload.capacity} Penumpang`,
          },
        ]);
      }

      setIsAdding(false);
      resetForm();

      await fetchTransports();
    } catch (err) {
      console.error('Add transport error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menambahkan armada'
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // EDIT TRANSPORT
  // ====================================================

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

    setPlatErrors({
      depan: '',
      angka: '',
      belakang: '',
    });

    setError('');
  };

  const handleSaveEdit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingItem) return;
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');

      const payload = getFormData();

      await apiRequest<BackendTransport>(
        `/transports/${editingItem.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      );

      if (
        isCustomUnit &&
        !mobilOptions.some(
          (item) => item.unit === payload.vehicle_name
        )
      ) {
        setMobilOptions((prev) => [
          ...prev,
          {
            unit: payload.vehicle_name,
            kapasitas: `${payload.capacity} Penumpang`,
          },
        ]);
      }

      setEditingItem(null);
      resetForm();

      await fetchTransports();
    } catch (err) {
      console.error('Edit transport error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memperbarui armada'
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // DELETE TRANSPORT
  // ====================================================

  const handleDeleteClick = (item: TransportItem) => {
    setDeleteModal({
      isOpen: true,
      item,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;

    try {
      setSaving(true);
      setError('');

      await apiRequest(
        `/transports/${deleteModal.item.id}`,
        {
          method: 'DELETE',
        }
      );

      setDeleteModal({
        isOpen: false,
        item: null,
      });

      await fetchTransports();
    } catch (err) {
      console.error('Delete transport error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus armada'
      );

      setDeleteModal({
        isOpen: false,
        item: null,
      });
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // STATUS BADGE
  // ====================================================

  const getStatusBadge = (
    status: FrontendStatus
  ) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';

      case 'Dalam Perjalanan':
        return 'bg-blue-100 text-blue-700 border-blue-200';

      case 'Perawatan':
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  // ====================================================
  // FORM CONTENT
  // ====================================================

  const renderTransportForm = (
    submitHandler: (e: React.FormEvent) => void,
    editMode = false
  ) => (
    <form onSubmit={submitHandler} className="space-y-3">

      {/* Plat Nomor */}
      <div>
        <label className="block text-gray-600 font-semibold mb-1">
          Plat Nomor{' '}
          <span className="text-[10px] text-gray-400 font-normal">
            *(Depan - Angka - Belakang)*
          </span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            maxLength={2}
            value={platDepan}
            onChange={(e) => handlePlatDepan(e.target.value)}
            placeholder="B"
            required
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
          />

          <input
            type="text"
            maxLength={4}
            value={platAngka}
            onChange={(e) => handlePlatAngka(e.target.value)}
            placeholder="1234"
            required
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
          />

          <input
            type="text"
            maxLength={3}
            value={platBelakang}
            onChange={(e) => handlePlatBelakang(e.target.value)}
            placeholder="KZ"
            required
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-center uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
          />
        </div>

        {(platErrors.depan ||
          platErrors.angka ||
          platErrors.belakang) && (
          <p className="text-red-500 text-[11px] mt-1 font-medium">
            {platErrors.depan ||
              platErrors.angka ||
              platErrors.belakang}
          </p>
        )}
      </div>

      {/* Unit Mobil */}
      <div>
        <label className="block text-gray-600 font-semibold mb-1">
          Unit Mobil
        </label>

        <select
          value={isCustomUnit ? 'NEW_UNIT' : unitMobil}
          onChange={(e) => {
            const val = e.target.value;

            if (val === 'NEW_UNIT') {
              setIsCustomUnit(true);
            } else {
              setIsCustomUnit(false);
              setUnitMobil(val);

              const matched = mobilOptions.find(
                (m) => m.unit === val
              );

              if (matched && !isCustomKapasitas) {
                setKapasitas(matched.kapasitas);
              }
            }
          }}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
        >
          {mobilOptions.map((item) => (
            <option key={item.unit} value={item.unit}>
              {item.unit}
            </option>
          ))}

          <option
            value="NEW_UNIT"
            className="font-semibold text-[#0A64BC]"
          >
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

      {/* Kapasitas */}
      <div>
        <label className="block text-gray-600 font-semibold mb-1">
          Kapasitas
        </label>

        <select
          value={
            isCustomKapasitas
              ? 'CUSTOM_KAPASITAS'
              : kapasitas
          }
          onChange={(e) => {
            const val = e.target.value;

            if (val === 'CUSTOM_KAPASITAS') {
              setIsCustomKapasitas(true);
            } else {
              setIsCustomKapasitas(false);
              setKapasitas(val);
            }
          }}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
        >
          <option value="6 Penumpang">6 Penumpang</option>
          <option value="7 Penumpang">7 Penumpang</option>
          <option value="11 Penumpang">11 Penumpang</option>
          <option value="14 Penumpang">14 Penumpang</option>
          <option value="19 Penumpang">19 Penumpang</option>

          <option
            value="CUSTOM_KAPASITAS"
            className="font-semibold text-[#0A64BC]"
          >
            + Input Kapasitas Kustom...
          </option>
        </select>

        {isCustomKapasitas && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              min={1}
              value={customKapasitasNum}
              onChange={(e) =>
                setCustomKapasitasNum(e.target.value)
              }
              placeholder="Jumlah Penumpang (misal: 30)"
              required
              className="w-full px-3.5 py-2 bg-white border border-[#0A64BC] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
            />

            <span className="text-gray-500 text-xs font-medium whitespace-nowrap">
              Penumpang
            </span>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-gray-600 font-semibold mb-1">
          Status Operasional
        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as FrontendStatus)
          }
          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A64BC]"
        >
          <option value="Tersedia">Tersedia</option>
          <option value="Dalam Perjalanan">
            Dalam Perjalanan
          </option>
          <option value="Perawatan">Perawatan</option>
        </select>
      </div>

      {/* API Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            if (editMode) {
              setEditingItem(null);
            } else {
              setIsAdding(false);
            }

            resetForm();
          }}
          className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-[#0A64BC] text-white rounded-xl font-semibold hover:bg-[#08529B] cursor-pointer shadow-xs disabled:opacity-50"
        >
          {saving
            ? 'Menyimpan...'
            : editMode
              ? 'Simpan'
              : 'Simpan'}
        </button>
      </div>
    </form>
  );

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">
            Data Armada & Transportasi
          </h1>

          <p className="text-xs text-gray-500 mt-1">
            Kelola unit mobil kendaraan dan status operasional armada.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchTransports}
            disabled={loading}
            className="p-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

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
      </div>

      {/* Error */}
      {error && !isAdding && !editingItem && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex justify-between items-center gap-2">
          <span>{error}</span>

          <button
            onClick={fetchTransports}
            className="font-bold underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Tabel Armada */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center text-gray-900 font-bold uppercase tracking-wider">
                  NO
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  PLAT NOMOR
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  UNIT MOBIL
                </th>

                <th className="py-3.5 px-4 text-gray-900 font-bold uppercase tracking-wider">
                  KAPASITAS
                </th>

                <th className="py-3.5 px-4 text-center text-gray-900 font-bold uppercase tracking-wider">
                  STATUS
                </th>

                <th className="py-3.5 px-4 text-center w-28 text-gray-900 font-bold uppercase tracking-wider">
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-400"
                  >
                    Memuat data transportasi...
                  </td>
                </tr>
              ) : transports.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-400"
                  >
                    Belum ada data armada transportasi.
                  </td>
                </tr>
              ) : (
                transports.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 transition"
                  >
                    <td className="py-3.5 px-4 text-center text-gray-400 font-medium">
                      {item.no}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {item.platNomor}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#0A64BC]">
                      {item.unitMobil}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {item.kapasitas}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(item.status)}`}
                      >
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
                          onClick={() => handleDeleteClick(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Armada"
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

      {/* Modal Tambah Armada */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">
                Tambah Armada Baru
              </h3>

              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderTransportForm(handleAddTransport)}
          </div>
        </div>
      )}

      {/* Modal Edit Armada */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">
                Edit Armada (No. {editingItem.no})
              </h3>

              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderTransportForm(handleSaveEdit, true)}
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm text-center space-y-4 shadow-xl border border-gray-100">

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">
                Hapus Data Armada?
              </h3>

              <p className="text-xs text-gray-500">
                Apakah Anda yakin ingin menghapus armada dengan Plat{' '}
                <strong>
                  "{deleteModal.item.platNomor}"
                </strong>{' '}
                ({deleteModal.item.unitMobil})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    item: null,
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
