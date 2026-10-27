'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, CheckCircle2, Clock, XCircle, FileText, X, Copy, Check } from 'lucide-react';

interface RefundItem {
  id: string;
  idBooking: string;
  nama: string;
  bank: string;
  rekening: string;
  email: string;
  telepon: string;
  tglPengajuan: string;
  alasan: string;
  catatan: string;
  hargaAsli: number;
  potongan: number; // 25%
  nominalRefund: number; // 75%
  status: 'Proses' | 'Selesai' | 'Ditolak';
}

const initialRefunds: RefundItem[] = [
  {
    id: '1',
    idBooking: 'TRV001234',
    nama: 'Siti Badriah',
    bank: 'Bank BCA',
    rekening: '8820491221',
    email: 'Situ.Badriah@gmail.com',
    telepon: '0812-3456-7890',
    tglPengajuan: '12 Okt 2026, 09:30',
    alasan: 'Sakit Mendadak',
    catatan: 'Melampirkan surat dokter RS Medika. Mohon pengembalian diproses.',
    hargaAsli: 500000,
    potongan: 125000,
    nominalRefund: 375000,
    status: 'Proses',
  },
  {
    id: '2',
    idBooking: 'TRV001235',
    nama: 'Ayu Tink Tink',
    bank: 'Bank BRI',
    rekening: '081298765432',
    email: 'ayutinktink@gmail.com',
    telepon: '0812-9876-5432',
    tglPengajuan: '11 Okt 2026, 14:15',
    alasan: 'Perubahan Rencana / Jadwal Acara',
    catatan: 'Kantor memindahkan jadwal dinas mendadak.',
    hargaAsli: 240000,
    potongan: 60000,
    nominalRefund: 180000,
    status: 'Selesai',
  },
  {
    id: '3',
    idBooking: 'TRV001236',
    nama: 'Cita Citata',
    bank: 'Bank Mandiri',
    rekening: '131000567890',
    email: 'citacitata@gmail.com',
    telepon: '0813-7788-9900',
    tglPengajuan: '10 Okt 2026, 11:00',
    alasan: 'Salah Pilih Tanggal',
    catatan: 'Ingin memesan untuk minggu depan.',
    hargaAsli: 400000,
    potongan: 100000,
    nominalRefund: 300000,
    status: 'Ditolak',
  },
  {
    id: '4',
    idBooking: 'TRV001237',
    nama: 'Tulustapitak Penyanyi',
    bank: 'Bank BNI',
    rekening: '0234567890',
    email: 'dewi.anggraini@gmail.com',
    telepon: '0856-1122-3344',
    tglPengajuan: '09 Okt 2026, 16:45',
    alasan: 'Keperluan Keluarga',
    catatan: 'Ada acara keluarga mendadak di luar kota.',
    hargaAsli: 800000,
    potongan: 200000,
    nominalRefund: 600000,
    status: 'Proses',
  },
];

export default function RefundView() {
  const [refunds, setRefunds] = useState<RefundItem[]>(initialRefunds);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredRefunds = refunds.filter((item) => {
    const matchesSearch =
      item.idBooking.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyRekening = (rekening: string) => {
    navigator.clipboard.writeText(rekening);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Selesai' | 'Ditolak') => {
    setRefunds(refunds.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    setSelectedRefund(null);
  };

  return (
    <div className="pt-2 px-4 md:px-6 pb-6 space-y-5 w-full font-sans max-w-7xl mx-auto relative">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0A64BC] tracking-tight">Data Refund Penumpang</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Kelola pengajuan pengembalian dana tiket penumpang (potongan standar kebijakan 25%).
          </p>
        </div>
        <div className="bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#0A64BC] rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400">Kebijakan Refund</p>
            <p className="text-xs font-bold text-gray-800">Hak Penumpang 75%</p>
          </div>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <p className="text-[11px] font-semibold">TOTAL PENGAJUAN</p>
            <FileText className="w-4 h-4 text-[#0A64BC]" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-800">24</h3>
          <p className="text-[11px] font-medium text-gray-400">Pengajuan bulan ini</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <p className="text-[11px] font-semibold">PERLU DIPROSES</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-lg font-extrabold text-amber-600">2</h3>
          <p className="text-[11px] font-medium text-gray-400">Menunggu respon admin</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <p className="text-[11px] font-semibold">TOTAL NOMINAL REFUND</p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">75%</span>
          </div>
          <h3 className="text-lg font-extrabold text-gray-800">Rp 13.900.000</h3>
          <p className="text-[11px] font-medium text-gray-400">Hak refund keseluruhan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-gray-400">
            <p className="text-[11px] font-semibold">SELESAI TRANSAKSI</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-800">19</h3>
          <p className="text-[11px] font-medium text-gray-400">Telah dikirimkan</p>
        </div>
      </div>

      {/* Filter & Tabel */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID / Nama / Bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A64BC]"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Filter Status dengan Warna Biru Sidebar (#0A64BC) */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0A64BC] text-xs font-semibold border border-[#0A64BC] rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#08529B] cursor-pointer shadow-xs"
            >
              <option value="Semua Status" className="bg-white text-gray-800">Semua Status</option>
              <option value="Proses" className="bg-white text-gray-800">Proses</option>
              <option value="Selesai" className="bg-white text-gray-800">Selesai</option>
              <option value="Ditolak" className="bg-white text-gray-800">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400">
                <th className="py-3 px-3">NO</th>
                <th className="py-3 px-3">ID BOOKING</th>
                <th className="py-3 px-3">NAMA PENUMPANG</th>
                <th className="py-3 px-3">NOMINAL REFUND (75%)</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredRefunds.length > 0 ? (
                filteredRefunds.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-3 text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-3.5 px-3 font-bold text-[#0A64BC]">{item.idBooking}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-gray-800">{item.nama}</p>
                      <p className="text-[10px] text-gray-400">{item.bank}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-gray-800">Rp {item.nominalRefund.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] text-gray-400 line-through">Rp {item.hargaAsli.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold ${
                          item.status === 'Proses'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : item.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {item.status === 'Proses' && <Clock className="w-3 h-3" />}
                        {item.status === 'Selesai' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Ditolak' && <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedRefund(item)}
                        className="bg-blue-50 hover:bg-[#0A64BC] hover:text-white text-[#0A64BC] font-semibold px-3.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400 text-xs">
                    Tidak ada data refund yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#0A64BC] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Detail Rincian Refund</h2>
                <p className="text-[11px] text-blue-100">ID Booking: <span className="font-bold underline">{selectedRefund.idBooking}</span></p>
              </div>
              <button
                onClick={() => setSelectedRefund(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider">NAMA PENUMPANG</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    selectedRefund.status === 'Proses' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                    selectedRefund.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {selectedRefund.status === 'Proses' ? 'Menunggu Proses' : selectedRefund.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{selectedRefund.nama}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-gray-500 pt-1">
                  <p>✉️ {selectedRefund.email}</p>
                  <p>📞 {selectedRefund.telepon}</p>
                  <p className="col-span-2">📅 Tgl Pengajuan: {selectedRefund.tglPengajuan}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 tracking-wider">DETAIL MASALAH / ALASAN</label>
                <div className="bg-amber-50/50 border border-amber-100 text-amber-900 px-3.5 py-2.5 rounded-xl font-medium">
                  {selectedRefund.alasan}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 tracking-wider">INFORMASI TAMBAHAN / CATATAN</label>
                <div className="bg-gray-50 border border-gray-200 text-gray-600 px-3.5 py-2.5 rounded-xl">
                  {selectedRefund.catatan}
                </div>
              </div>

              <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-[#0A64BC] tracking-wider">RINCIAN PEMBATALAN TIKET</p>
                <div className="flex justify-between text-gray-600">
                  <span>Total Harga Tiket (100%)</span>
                  <span className="font-semibold text-gray-800">Rp {selectedRefund.hargaAsli.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Potongan Admin Kebijakan (25%)</span>
                  <span className="font-semibold">- Rp {selectedRefund.potongan.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-blue-100 pt-2 flex justify-between font-bold text-sm text-[#0A64BC]">
                  <span>Total Hak Refund (75%)</span>
                  <span>Rp {selectedRefund.nominalRefund.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 tracking-wider">METODE / TUJUAN REKENING PENGEMBALIAN</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{selectedRefund.bank} - {selectedRefund.rekening}</p>
                  <p className="text-[11px] text-gray-500">a.n {selectedRefund.nama}</p>
                </div>
                <button
                  onClick={() => handleCopyRekening(selectedRefund.rekening)}
                  className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin No.Rek'}</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedRefund(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedRefund.id, 'Ditolak')}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Tolak
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRefund.id, 'Selesai')}
                  className="px-4 py-2 bg-[#0A64BC] hover:bg-[#08529B] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Setujui & Transfer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}