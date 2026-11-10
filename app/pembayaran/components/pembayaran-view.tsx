
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Car,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
).replace(/\/$/, '');

interface PaymentItem {
  id: number;
  payment_code: string;
  booking_id: number;
  payment_method: string;
  amount: number | string;
  payment_date: string | null;
  proof_url: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'expired' | 'refunded';

  booking_code?: string | null;
  customer_name?: string | null;
  booking_datetime?: string | null;
  passenger_count?: number;
  total_amount?: number | string;
  route?: string | null;
  departure_time?: string | null;
}

type TabStatus = 'Semua' | 'Menunggu' | 'Disetujui' | 'Ditolak';

const statusMap: Record<string, string> = {
  pending: 'Menunggu',
  verified: 'Disetujui',
  rejected: 'Ditolak',
  expired: 'Kedaluwarsa',
  refunded: 'Dikembalikan',
};

const formatRupiah = (amount: number | string): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

// Menerima string, null, maupun undefined
const formatDate = (
  date: string | null | undefined
): string => {
  if (!date) return '-';

  const parsedDate = new Date(
    date.includes('T') ? date : date.replace(' ', 'T')
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const getToken = (): string => {
  if (typeof window === 'undefined') return '';

  return localStorage.getItem('admin_token') || '';
};

const getStatusStyle = (status: string): string => {
  switch (status) {
    case 'verified':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';

    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-100';

    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-100';

    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

// Membaca respons API dengan aman
const readResponse = async (response: Response) => {
  const text = await response.text();

  let result: any;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Respons server tidak valid.');
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `Terjadi kesalahan server (${response.status}).`
    );
  }

  return result;
};

export default function PembayaranView() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>('Semua');

  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [selectedProofOnly, setSelectedProofOnly] =
    useState<PaymentItem | null>(null);

  const [selectedDetail, setSelectedDetail] =
    useState<PaymentItem | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'ACC' | 'Tolak';
    payment: PaymentItem | null;
  }>({
    isOpen: false,
    type: 'ACC',
    payment: null,
  });

  // ==========================================
  // GET ALL PAYMENTS
  // ==========================================

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          'Sesi admin tidak ditemukan. Silakan login kembali.'
        );
      }

      const response = await fetch(
        `${API_URL}/api/payments`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      const result = await readResponse(response);

      setPayments(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (error) {
      console.error('Fetch payments error:', error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pembayaran.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ==========================================
  // FILTER PAYMENTS
  // ==========================================

  const filteredPayments = payments.filter((payment) => {
    if (activeTab === 'Semua') return true;

    if (activeTab === 'Menunggu') {
      return payment.status === 'pending';
    }

    if (activeTab === 'Disetujui') {
      return payment.status === 'verified';
    }

    if (activeTab === 'Ditolak') {
      return payment.status === 'rejected';
    }

    return true;
  });

  // ==========================================
  // OPEN CONFIRMATION MODAL
  // ==========================================

  const openConfirmModal = (
    type: 'ACC' | 'Tolak',
    payment: PaymentItem
  ) => {
    setErrorMsg('');

    setConfirmModal({
      isOpen: true,
      type,
      payment,
    });
  };

  // ==========================================
  // UPDATE PAYMENT STATUS
  // ==========================================

  const handleExecuteStatusChange = async () => {
    const payment = confirmModal.payment;

    if (!payment || updating) return;

    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          'Sesi admin tidak ditemukan. Silakan login kembali.'
        );
      }

      const newStatus =
        confirmModal.type === 'ACC'
          ? 'verified'
          : 'rejected';

      const response = await fetch(
        `${API_URL}/api/payments/${payment.id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            adminNote:
              newStatus === 'rejected'
                ? 'Pembayaran ditolak oleh admin.'
                : 'Pembayaran telah diverifikasi oleh admin.',
          }),
        }
      );

      await readResponse(response);

      setSuccessMsg(
        newStatus === 'verified'
          ? 'Pembayaran berhasil disetujui.'
          : 'Pembayaran berhasil ditolak.'
      );

      setConfirmModal({
        isOpen: false,
        type: 'ACC',
        payment: null,
      });

      // Refresh data setelah update berhasil
      await fetchPayments();

    } catch (error) {
      console.error('Update payment error:', error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui status pembayaran.'
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // CLOSE CONFIRMATION MODAL
  // ==========================================

  const closeConfirmModal = () => {
    if (updating) return;

    setConfirmModal({
      isOpen: false,
      type: 'ACC',
      payment: null,
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="pt-2 px-4 md:px-6 pb-6 space-y-3 w-full font-sans max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0A64BC] tracking-tight">
            Data Pembayaran
          </h1>

          <p className="text-[11px] text-gray-500 mt-0.5">
            Kelola konfirmasi transaksi dan riwayat pembayaran pelanggan.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPayments}
          disabled={loading}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
          title="Refresh pembayaran"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
          {errorMsg}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {successMsg && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-xs">
          {successMsg}

          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="float-right font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* FILTER TAB */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
        {(['Semua', 'Menunggu', 'Disetujui', 'Ditolak'] as const).map(
          (tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* PAYMENT LIST */}
      <div className="space-y-3 pt-1">

        {loading ? (
          <div className="bg-white rounded-xl p-10 flex flex-col items-center gap-3 border border-gray-100">
            <Loader2 className="w-6 h-6 text-[#0A64BC] animate-spin" />

            <p className="text-xs text-gray-500">
              Mengambil data pembayaran...
            </p>
          </div>
        ) : filteredPayments.length > 0 ? (

          filteredPayments.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md transition-all"
            >

              {/* PAYMENT HEADER */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    {item.customer_name || 'Pelanggan'}
                  </h3>

                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.payment_code}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getStatusStyle(item.status)}`}
                >
                  {statusMap[item.status] || item.status}
                </span>
              </div>

              {/* PAYMENT INFORMATION */}
              <div className="space-y-2.5 text-xs text-gray-700">

                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-[#0A64BC] shrink-0" />

                  <span className="font-semibold text-gray-800">
                    {item.route ||
                      `Booking ${item.booking_code || item.booking_id}`}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#0A64BC] shrink-0" />

                  <span className="font-semibold text-gray-800">
                    {formatDate(
                      item.booking_datetime || item.payment_date
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#0A64BC] shrink-0" />

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">
                      {formatRupiah(item.amount)}
                    </span>

                    <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-200 text-gray-500 font-medium">
                      {item.payment_method}
                    </span>
                  </div>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-1">

                {item.status === 'pending' ? (

                  <div className="grid grid-cols-3 gap-2">

                    <button
                      type="button"
                      onClick={() => setSelectedProofOnly(item)}
                      disabled={!item.proof_url}
                      className="py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold rounded-xl text-xs disabled:opacity-40"
                    >
                      Lihat Bukti
                    </button>

                    <button
                      type="button"
                      onClick={() => openConfirmModal('ACC', item)}
                      className="py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold rounded-xl text-xs"
                    >
                      ACC
                    </button>

                    <button
                      type="button"
                      onClick={() => openConfirmModal('Tolak', item)}
                      className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs"
                    >
                      Tolak
                    </button>

                  </div>

                ) : (

                  <button
                    type="button"
                    onClick={() => setSelectedDetail(item)}
                    className="w-full py-2.5 bg-[#0A64BC] hover:bg-blue-700 text-white font-semibold rounded-xl text-xs"
                  >
                    Lihat Detail
                  </button>

                )}

              </div>

            </div>
          ))

        ) : (

          <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-sm">
            {payments.length === 0
              ? 'Belum ada data pembayaran dari database.'
              : `Tidak ada transaksi pembayaran dengan status "${activeTab}".`}
          </div>

        )}

      </div>

      {/* ====================================== */}
      {/* MODAL BUKTI PEMBAYARAN */}
      {/* ====================================== */}

      {selectedProofOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">

            <div className="bg-[#0A64BC] px-5 py-3.5 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold">
                Bukti Pembayaran
              </h3>

              <button
                type="button"
                onClick={() => setSelectedProofOnly(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex items-center justify-center">
              {selectedProofOnly.proof_url ? (
                <img
                  src={selectedProofOnly.proof_url}
                  alt="Bukti Pembayaran"
                  className="w-full h-80 object-contain"
                />
              ) : (
                <p className="text-xs text-gray-400">
                  Bukti pembayaran belum tersedia.
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* MODAL DETAIL PEMBAYARAN */}
      {/* ====================================== */}

      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">

            <div className="bg-[#0A64BC] px-5 py-3.5 flex items-center justify-between text-white">
              <h3 className="text-base font-bold">
                Detail Pembayaran
              </h3>

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

              <div className="space-y-3.5 text-xs text-gray-800">

                <p>
                  <b>Kode Pembayaran:</b>{' '}
                  {selectedDetail.payment_code}
                </p>

                <p>
                  <b>Nama:</b>{' '}
                  {selectedDetail.customer_name || '-'}
                </p>

                <p>
                  <b>Kode Booking:</b>{' '}
                  {selectedDetail.booking_code || selectedDetail.booking_id}
                </p>

                <p>
                  <b>Rute:</b>{' '}
                  {selectedDetail.route || '-'}
                </p>

                <p>
                  <b>Jadwal:</b>{' '}
                  {formatDate(
                    selectedDetail.booking_datetime ||
                    selectedDetail.payment_date
                  )}
                </p>

                <p>
                  <b>Total:</b>{' '}
                  {formatRupiah(selectedDetail.amount)}
                </p>

                <p>
                  <b>Metode:</b>{' '}
                  {selectedDetail.payment_method}
                </p>

                <p>
                  <b>Status:</b>{' '}
                  {statusMap[selectedDetail.status] || selectedDetail.status}
                </p>

              </div>

              <div className="text-center space-y-2">

                <p className="text-xs font-bold text-gray-800">
                  Bukti Transfer
                </p>

                {selectedDetail.proof_url ? (
                  <img
                    src={selectedDetail.proof_url}
                    alt="Bukti Transfer"
                    className="w-full h-60 object-contain"
                  />
                ) : (
                  <p className="text-xs text-gray-400">
                    Bukti belum tersedia.
                  </p>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* MODAL KONFIRMASI ACC / TOLAK */}
      {/* ====================================== */}

      {confirmModal.isOpen && confirmModal.payment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center space-y-4">

            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0A64BC] flex items-center justify-center mx-auto">

              {confirmModal.type === 'ACC' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}

            </div>

            <div className="space-y-1.5">

              <h3 className="text-base font-bold text-gray-800">
                Konfirmasi{' '}
                {confirmModal.type === 'ACC'
                  ? 'Persetujuan'
                  : 'Penolakan'}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed">
                Apakah kamu yakin ingin{' '}
                {confirmModal.type === 'ACC'
                  ? 'menyetujui'
                  : 'menolak'}{' '}
                pembayaran dari{' '}

                <span className="font-semibold text-gray-800">
                  {confirmModal.payment.customer_name ||
                    confirmModal.payment.payment_code}
                </span>
                ?
              </p>

            </div>

            <div className="flex items-center justify-center gap-3 pt-2">

              <button
                type="button"
                disabled={updating}
                onClick={closeConfirmModal}
                className="w-1/2 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={handleExecuteStatusChange}
                className="w-1/2 py-2.5 text-xs font-semibold text-white bg-[#0A64BC] hover:bg-blue-700 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >

                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  confirmModal.type === 'ACC'
                    ? 'Ya, Setujui'
                    : 'Ya, Tolak'
                )}

              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
