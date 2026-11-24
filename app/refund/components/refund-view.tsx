'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, XCircle, FileText, X, Copy, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

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
  potongan: number; 
  nominalRefund: number; 
  status: 'Proses' | 'Selesai' | 'Ditolak';
}

export default function RefundView() {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);
  const [copied, setCopied] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/refunds');
      const result = await res.json();
      
      if (result.success && Array.isArray(result.data)) {
        setRefunds(result.data.map((item: any) => ({
          id: item.id.toString(),
          idBooking: item.booking_code || `TRV00${item.booking_id || '1'}`,
          nama: item.bank_account_name || 'Tanpa Nama',
          bank: item.bank_name || '-',
          rekening: item.bank_account_number || '-',
          email: item.email || 'penumpang@email.com',
          telepon: item.telepon || '08123456789',
          tglPengajuan: item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : 'Baru saja',
          alasan: item.reason || '-',
          catatan: item.admin_note || 'Tidak ada catatan khusus.',
          hargaAsli: Number(item.requested_amount) || 0,
          potongan: Number(item.deduction_amount) || 0,
          nominalRefund: Number(item.refund_amount) || 0,
          status: item.status === 'pending' ? 'Proses' : item.status === 'approved' ? 'Selesai' : 'Ditolak',
        })));
      }
    } catch (err) {
      console.error('Gagal mengambil data refund:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRefunds(); }, []);

  const filteredRefunds = refunds.filter((item) => {
    const matchesSearch = item.idBooking.toLowerCase().includes(searchTerm.toLowerCase()) || item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || item.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage) || 1;
  const currentRefunds = filteredRefunds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCopyRekening = (rekening: string) => {
    navigator.clipboard.writeText(rekening);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Selesai' | 'Ditolak') => {
    const backendStatus = newStatus === 'Selesai' ? 'approved' : 'rejected';
    try {
      const res = await fetch(`http://localhost:5001/api/refunds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setRefunds(refunds.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
        setSelectedRefund(null);
      } else {
        alert('Gagal memperbarui status: ' + (result.message || 'Kesalahan pada server'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan koneksi ke server.');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full font-sans relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Data Refund Penumpang</h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Kelola pengajuan pengembalian dana tiket penumpang (potongan standar kebijakan 25%).</p>
        </div>
        <div className="bg-white border border-blue-100 px-4 py-2 rounded-xl shadow-2xs flex items-center gap-3">
          <div>
            <p className="text-[11px] font-semibold text-gray-400">Kebijakan Refund</p>
            <p className="text-xs font-bold text-gray-800">Hak Penumpang 75%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400"><p className="text-xs font-medium">TOTAL PENGAJUAN</p><FileText className="w-4 h-4 text-[#0A64BC]" /></div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 mt-2">{refunds.length}</h3>
          <p className="text-xs text-gray-500 mt-1">Pengajuan tercatat</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400"><p className="text-xs font-medium">PERLU DIPROSES</p><Clock className="w-4 h-4 text-amber-500" /></div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2">{refunds.filter(i => i.status === 'Proses').length}</h3>
          <p className="text-xs text-gray-500 mt-1">Menunggu respon admin</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400"><p className="text-xs font-medium">TOTAL NOMINAL REFUND</p><span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">75%</span></div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 mt-2">Rp {refunds.reduce((acc, curr) => acc + curr.nominalRefund, 0).toLocaleString('id-ID')}</h3>
          <p className="text-xs text-gray-500 mt-1">Hak refund keseluruhan</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-gray-400"><p className="text-xs font-medium">SELESAI TRANSAKSI</p><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 mt-2">{refunds.filter(i => i.status === 'Selesai').length}</h3>
          <p className="text-xs text-gray-500 mt-1">Telah dikirimkan</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari ID / Nama / Bank..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A64BC]" />
          </div>
          <div className="relative w-full sm:w-auto">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} type="button" className="w-full sm:w-48 bg-[#0A64BC] text-xs font-semibold border border-[#0A64BC] rounded-xl px-4 py-2 text-white flex items-center justify-between shadow-2xs cursor-pointer hover:bg-[#08529B] transition">
              <span>{statusFilter}</span><ChevronDown className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 text-xs overflow-hidden">
                {['Semua Status', 'Proses', 'Selesai', 'Ditolak'].map((status) => (
                  <button key={status} type="button" onClick={() => { setStatusFilter(status); setIsDropdownOpen(false); }} className={`w-full text-left px-4 py-2 font-medium transition cursor-pointer ${statusFilter === status ? 'bg-blue-50 text-[#0A64BC] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400">
                <th className="pb-3 pr-4 font-medium">NO</th>
                <th className="pb-3 pr-4 font-medium">ID BOOKING</th>
                <th className="pb-3 pr-4 font-medium">NAMA PENUMPANG</th>
                <th className="pb-3 pr-4 font-medium">NOMINAL REFUND (75%)</th>
                <th className="pb-3 pr-4 font-medium text-center">STATUS</th>
                <th className="pb-3 font-medium text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-xs">Memuat data dari database...</td></tr>
              ) : currentRefunds.length > 0 ? (
                currentRefunds.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-4 text-gray-500 font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="py-3 pr-4 font-semibold text-[#0A64BC]">{item.idBooking}</td>
                    <td className="py-3 pr-4"><p className="font-medium text-gray-800">{item.nama}</p><p className="text-[11px] text-gray-400">{item.bank}</p></td>
                    <td className="py-3 pr-4"><p className="font-medium text-gray-800">Rp {item.nominalRefund.toLocaleString('id-ID')}</p><p className="text-[11px] text-gray-400 line-through">Rp {item.hargaAsli.toLocaleString('id-ID')}</p></td>
                    <td className="py-3 pr-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.status === 'Proses' ? 'bg-amber-100 text-amber-700' : item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.status === 'Proses' && <Clock className="w-3 h-3" />}
                        {item.status === 'Selesai' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Ditolak' && <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => setSelectedRefund(item)} className="bg-blue-50 hover:bg-[#0A64BC] hover:text-white text-[#0A64BC] font-semibold px-3.5 py-1.5 rounded-lg text-xs transition cursor-pointer">Detail</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-xs">Tidak ada data refund yang ditemukan dari server.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredRefunds.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-3 text-xs text-gray-500">
            <div>Menampilkan <span className="font-semibold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-semibold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredRefunds.length)}</span> dari <span className="font-semibold text-gray-800">{filteredRefunds.length}</span> data refund</div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold cursor-pointer transition">
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <div className="px-3 py-1.5 font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">{currentPage} / {totalPages}</div>
              <button type="button" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold cursor-pointer transition">
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedRefund && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#0A64BC] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Detail Rincian Refund</h2>
                <p className="text-xs text-blue-100">ID Booking: <span className="font-bold underline">{selectedRefund.idBooking}</span></p>
              </div>
              <button onClick={() => setSelectedRefund(null)} className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-bold text-gray-400 tracking-wider">NAMA PENUMPANG</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${selectedRefund.status === 'Proses' ? 'bg-amber-100 text-amber-700' : selectedRefund.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {selectedRefund.status === 'Proses' ? 'Menunggu Proses' : selectedRefund.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{selectedRefund.nama}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-500 pt-1">
                  <p>✉️ {selectedRefund.email}</p>
                  <p>📞 {selectedRefund.telepon}</p>
                  <p className="col-span-2">📅 Tgl Pengajuan: {selectedRefund.tglPengajuan}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider">DETAIL MASALAH / ALASAN</label>
                <div className="bg-amber-50/50 border border-amber-100 text-amber-900 px-3.5 py-2.5 rounded-xl font-medium">{selectedRefund.alasan}</div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 tracking-wider">INFORMASI TAMBAHAN / CATATAN</label>
                <div className="bg-gray-50 border border-gray-200 text-gray-600 px-3.5 py-2.5 rounded-xl">{selectedRefund.catatan}</div>
              </div>

              <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-[#0A64BC] tracking-wider">RINCIAN PEMBATALAN TIKET</p>
                <div className="flex justify-between text-gray-600"><span>Total Harga Tiket (100%)</span><span className="font-semibold text-gray-800">Rp {selectedRefund.hargaAsli.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-red-500"><span>Potongan Admin Kebijakan (25%)</span><span className="font-semibold">- Rp {selectedRefund.potongan.toLocaleString('id-ID')}</span></div>
                <div className="border-t border-blue-100 pt-2 flex justify-between font-bold text-sm text-[#0A64BC]"><span>Total Hak Refund (75%)</span><span>Rp {selectedRefund.nominalRefund.toLocaleString('id-ID')}</span></div>
              </div>

              <div className="bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold text-emerald-700 tracking-wider">METODE / TUJUAN REKENING PENGEMBALIAN</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{selectedRefund.bank} - {selectedRefund.rekening}</p>
                  <p className="text-xs text-gray-500">a.n {selectedRefund.nama}</p>
                </div>
                <button onClick={() => handleCopyRekening(selectedRefund.rekening)} className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin No.Rek'}</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setSelectedRefund(null)} className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition cursor-pointer">Tutup</button>
              <div className="flex items-center gap-2">
                <button onClick={() => handleUpdateStatus(selectedRefund.id, 'Ditolak')} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition cursor-pointer">Tolak</button>
                <button onClick={() => handleUpdateStatus(selectedRefund.id, 'Selesai')} className="px-4 py-2 bg-[#0A64BC] hover:bg-[#08529B] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /><span>Setujui & Transfer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}