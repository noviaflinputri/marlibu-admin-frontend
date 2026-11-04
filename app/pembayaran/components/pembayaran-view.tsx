'use client';

import React, { useState } from 'react';
import { Car, Calendar, CreditCard, CheckCircle2, XCircle, X } from 'lucide-react';

interface PaymentItem {
  id: string;
  customerName: string;
  route: string;
  date: string;
  time: string;
  amount: string;
  type: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  proofUrl: string;
}

const initialPayments: PaymentItem[] = [
  {
    id: 'TRX-001',
    customerName: 'Azzura Nasmia',
    route: 'Jakarta - Yogyakarta',
    date: '10 September 2026',
    time: '07.00',
    amount: 'Rp185.000',
    type: 'Regular',
    status: 'Menunggu',
    proofUrl: '/bukti.png',
  },
  {
    id: 'TRX-002',
    customerName: 'Joel Vian',
    route: 'Malang - Surabaya',
    date: '10 Oktober 2026',
    time: '07.00',
    amount: 'Rp190.000',
    type: 'Regular',
    status: 'Disetujui',
    proofUrl: '/bukti.png',
  },
  {
    id: 'TRX-003',
    customerName: 'David Wijaya',
    route: 'Semarang - Yogyakarta',
    date: '10 September 2026',
    time: '07.00',
    amount: 'Rp185.000',
    type: 'Regular',
    status: 'Ditolak',
    proofUrl: '/bukti.png',
  },
];

export default function PembayaranView() {
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Menunggu' | 'Disetujui' | 'Ditolak'>('Semua');

  // Modal 1: Bukti Pembayaran Saja (Hanya Gambar)
  const [selectedProofOnly, setSelectedProofOnly] = useState<PaymentItem | null>(null);

  // Modal 2: Detail Pembayaran Lengkap (Teks + Gambar)
  const [selectedDetail, setSelectedDetail] = useState<PaymentItem | null>(null);

  // Modal 3: Konfirmasi ACC / Tolak
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'ACC' | 'Tolak';
    payment: PaymentItem | null;
  }>({
    isOpen: false,
    type: 'ACC',
    payment: null,
  });

  // Filter Data berdasarkan Tab
  const filteredPayments = payments.filter((payment) => {
    if (activeTab === 'Semua') return true;
    return payment.status === activeTab;
  });

  // Buka Modal Konfirmasi
  const openConfirmModal = (type: 'ACC' | 'Tolak', payment: PaymentItem) => {
    setConfirmModal({ isOpen: true, type, payment });
  };

  // Eksekusi Status Change
  const handleExecuteStatusChange = () => {
    if (!confirmModal.payment) return;

    const newStatus = confirmModal.type === 'ACC' ? 'Disetujui' : 'Ditolak';
    setPayments((prev) =>
      prev.map((p) => (p.id === confirmModal.payment?.id ? { ...p, status: newStatus } : p))
    );

    setConfirmModal({ isOpen: false, type: 'ACC', payment: null });
  };

  return (
    <div className="pt-2 px-4 md:px-6 pb-6 space-y-3 w-full font-sans max-w-5xl mx-auto">
      
      {/* 1. Header Judul Halaman */}
      <div>
        <h1 className="text-xl font-bold text-[#0A64BC] tracking-tight">Data Pembayaran</h1>
        <p className="text-[11px] text-gray-500 mt-0.5">Kelola konfirmasi transaksi dan riwayat pembayaran pelanggan.</p>
      </div>

      {/* 2. Filter Tab Status */}
      <div className="flex items-center gap-1.5 pt-1">
        {(['Semua', 'Menunggu', 'Disetujui', 'Ditolak'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#FF6B00] text-white shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Card List Transaksi Pembayaran */}
      <div className="space-y-3 pt-1">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-2xl p-4.5 space-y-3 shadow-sm hover:shadow-md transition-all"
            >
              {/* Header Card Nama & Badge Status */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">{item.customerName}</h3>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A64BC] border border-blue-100">
                  {item.status}
                </span>
              </div>

              {/* Detail Info dengan Ikon Lucide */}
              <div className="space-y-2.5 text-xs text-gray-700">
                {/* Rute Mobil */}
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-[#0A64BC] shrink-0" />
                  <span className="font-semibold text-gray-800">{item.route}</span>
                </div>

                {/* Kalender & Jam */}
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#0A64BC] shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{item.date}</span>
                    <span className="text-[11px] text-gray-500">{item.time}</span>
                  </div>
                </div>

                {/* Kartu Kredit */}
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#0A64BC] shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{item.amount}</span>
                    <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-200 text-gray-500 font-medium">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Bawah */}
              <div className="pt-1">
                {item.status === 'Menunggu' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedProofOnly(item)}
                      className="py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                    >
                      Lihat Bukti
                    </button>
                    <button
                      onClick={() => openConfirmModal('ACC', item)}
                      className="py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                    >
                      ACC
                    </button>
                    <button
                      onClick={() => openConfirmModal('Tolak', item)}
                      className="py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                    >
                      Tolak
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedDetail(item)}
                    className="w-full py-2.5 bg-[#0A64BC] hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                  >
                    Lihat Detail
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-xs">
            Tidak ada transaksi pembayaran dengan status "{activeTab}".
          </div>
        )}
      </div>

      {/* 4. MODAL POP-UP "BUKTI PEMBAYARAN :" (HANYA GAMBAR BUKTI LANGSUNG TANPA CARD DOUBLE) */}
      {selectedProofOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header Modal */}
            <div className="bg-[#0A64BC] px-5 py-3.5 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold tracking-wide">Bukti Pembayaran :</h3>
              <button
                onClick={() => setSelectedProofOnly(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gambar Bukti Langsung Tanpa Pembungkus Card */}
            <div className="p-5 flex items-center justify-center">
              <img
                src={selectedProofOnly.proofUrl}
                alt="Bukti Pembayaran"
                className="w-full h-80 object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL POP-UP "DETAIL PEMBAYARAN" (TEKS KIRI, GAMBAR KANAN TANPA CARD DOUBLE) */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header Modal */}
            <div className="bg-[#0A64BC] px-5 py-3.5 flex items-center justify-between text-white">
              <h3 className="text-base font-bold tracking-wide">Detail Pembayaran</h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal 2 Kolom */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Sisi Kiri: Rincian Teks */}
              <div className="space-y-3.5 text-xs text-gray-800">
                <p>
                  <span className="font-bold">Nama: </span>
                  <span>{selectedDetail.customerName}</span>
                </p>
                <p>
                  <span className="font-bold">Rute: </span>
                  <span>{selectedDetail.route}</span>
                </p>
                <p>
                  <span className="font-bold">Jadwal: </span>
                  <span>{selectedDetail.date} ({selectedDetail.time})</span>
                </p>
                <p>
                  <span className="font-bold">Total: </span>
                  <span>{selectedDetail.amount}</span>
                </p>
                <p>
                  <span className="font-bold">Kategori: </span>
                  <span>{selectedDetail.type}</span>
                </p>
                <p>
                  <span className="font-bold">Status: </span>
                  <span className="font-semibold text-[#0A64BC]">{selectedDetail.status}</span>
                </p>
              </div>

              {/* Sisi Kanan: Gambar Bukti Langsung */}
              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-gray-800 text-left md:text-center">Bukti Transfer :</p>
                <img
                  src={selectedDetail.proofUrl}
                  alt="Bukti Transfer"
                  className="w-full h-60 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL POP-UP KONFIRMASI (ACC / TOLAK) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Icon Status */}
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0A64BC] flex items-center justify-center mx-auto">
              {confirmModal.type === 'ACC' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
            </div>

            {/* Pesan Konfirmasi */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-800">
                Konfirmasi {confirmModal.type === 'ACC' ? 'Persetujuan' : 'Penolakan'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin {confirmModal.type === 'ACC' ? 'menyetujui' : 'menolak'} pembayaran dari{' '}
                <span className="font-semibold text-gray-800">
                  "{confirmModal.payment?.customerName}"
                </span>
                ?
              </p>
            </div>

            {/* Tombol Aksi Modal */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'ACC', payment: null })}
                className="w-1/2 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusChange}
                className="w-1/2 py-2.5 text-xs font-semibold text-white bg-[#0A64BC] hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                {confirmModal.type === 'ACC' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}