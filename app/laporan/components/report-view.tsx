'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowDownRight } from 'lucide-react';

export default function ReportView() {
  const [selectedDate, setSelectedDate] = useState('2026-10-17');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data dari backend saat halaman dimuat
  useEffect(() => {
    fetch('http://localhost:5001/api/reports')
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setReportData(response.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data laporan:', err);
        setLoading(false);
      });
  }, []);

  // 2. Hitung Total Booking secara Real-Time
  const totalBookingsCount = reportData.length;

  // 3. Hitung Pendapatan Kotor (Gross Revenue) dari total_amount di database
  const finalGrossRevenue = reportData.reduce((acc, curr) => {
    return acc + (Number(curr.total_amount) || 0);
  }, 0);

  // 4. Nominal Total Refund (Sesuaikan jika backend refund sudah di-fetch)
  const totalRefundAmount = 975000; 

  // 5. Pendapatan Bersih (Net Revenue)
  const netRevenue = finalGrossRevenue - totalRefundAmount;

  // Data Statistik Ringkasan
  const stats = [
    {
      title: 'Total Booking',
      value: totalBookingsCount.toString(),
      change: '+ 12%',
    },
    {
      title: 'Pendapatan Kotor (Gross)',
      value: `Rp ${finalGrossRevenue.toLocaleString('id-ID')}`,
      change: '+ 15%',
    },
    {
      title: 'Total Refund',
      value: `Rp ${totalRefundAmount.toLocaleString('id-ID')}`,
      change: 'Potongan',
      isNegative: true,
    },
    {
      title: 'Pendapatan Bersih (Net)',
      value: `Rp ${netRevenue.toLocaleString('id-ID')}`,
      change: 'Aktif',
    },
  ];

  // 6. Hitung Status Booking Otomatis & Real-Time dari Database
  const statusCounts = reportData.reduce((acc: any, curr: any) => {
    const status = curr.booking_status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const getPercentage = (count: number) => {
    if (totalBookingsCount === 0) return '0%';
    return `${Math.round((count / totalBookingsCount) * 100)}%`;
  };

  const bookingStatusData = [
    { 
      label: 'Dikonfirmasi / Selesai', 
      percentage: getPercentage(statusCounts['confirmed'] || statusCounts['completed'] || 0), 
      color: 'bg-[#0A64BC]' 
    },
    { 
      label: 'Menunggu Konfirmasi', 
      percentage: getPercentage(statusCounts['pending'] || 0), 
      color: 'bg-[#FF6B00]' 
    },
    { 
      label: 'Dalam Perjalanan', 
      percentage: getPercentage(statusCounts['ongoing'] || 0), 
      color: 'bg-sky-400' 
    },
    { 
      label: 'Dibatalkan', 
      percentage: getPercentage(statusCounts['cancelled'] || 0), 
      color: 'bg-red-500' 
    },
  ];

  // 7. GRAFIK BATANG 100% REAL-TIME DARI DATABASE
  // Kelompokkan total pendapatan berdasarkan tanggal asli created_at
  const groupedRevenue = reportData.reduce((acc: any, item: any) => {
    if (item.created_at) {
      const dateKey = new Date(item.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      });
      acc[dateKey] = (acc[dateKey] || 0) + (Number(item.total_amount) || 0);
    }
    return acc;
  }, {});

  // Mengubah objek tanggal menjadi array untuk dirender di grafik
  const revenueChartData = Object.keys(groupedRevenue).map((date) => ({
    date,
    amount: groupedRevenue[date],
  }));

  // Cari angka tertinggi untuk menentukan persentase tinggi relatif batang grafik
  const maxAmount = Math.max(...revenueChartData.map((d) => d.amount), 1);

  return (
    <div className="pt-2 px-4 md:px-6 pb-6 space-y-4 w-full font-sans max-w-5xl mx-auto">
      
      {/* Header Area Judul Halaman */}
      <div>
        <h1 className="text-xl font-bold text-[#0A64BC] tracking-tight">
          Laporan & Statistik Keuangan
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Pantau performa pendapatan kotor, bersih, dan statistik booking. {loading && '(Memuat data dari database...)'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2.5 pt-1">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-50 text-xs border border-gray-200 rounded-xl px-3.5 py-2 text-gray-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0A64BC] cursor-pointer"
        />

        <button className="bg-[#0A64BC] hover:bg-[#08529B] text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer">
          Tampilkan
        </button>
      </div>

      {/* 4 Card Stats Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-1">
            <p className="text-[11px] font-semibold text-gray-400">{item.title}</p>
            <h3 className={`text-base font-extrabold ${idx === 3 ? 'text-[#0A64BC]' : 'text-gray-800'}`}>
              {item.value}
            </h3>
            <p className={`text-[11px] font-semibold flex items-center gap-1 ${item.isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
              {item.isNegative ? <ArrowDownRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              <span>{item.change}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Section Grafik: Pendapatan & Status Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card Grafik Pendapatan Batang (100% Real-Time) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-gray-800">Grafik Pendapatan (Rp)</h2>
            <span className="text-[10px] text-emerald-600 font-semibold">● Real-time Database</span>
          </div>
          
          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-gray-100 pb-2">
            {revenueChartData.length > 0 ? (
              revenueChartData.map((bar, idx) => {
                // Hitung tinggi relatif batang grafik (minimal 15% tinggi agar tetap terlihat rapi)
                const heightPercent = Math.max(Math.round((bar.amount / maxAmount) * 100), 15);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[32px] bg-[#0A64BC] rounded-t-lg hover:bg-[#08529B] transition-all cursor-pointer relative group"
                    >
                      {/* Tooltip saat hover menunjukkan detail nominal */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[9px] py-1 px-2 rounded whitespace-nowrap z-10">
                        Rp {bar.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{bar.date}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-xs text-gray-400 py-12">
                Belum ada data transaksi di database.
              </div>
            )}
          </div>
        </div>

        {/* Card Donut Chart Status Booking (Real-Time) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-gray-800">Status Booking</h2>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full border-[12px] border-[#0A64BC] border-t-[#FF6B00] border-r-sky-400 border-b-gray-300 flex items-center justify-center shrink-0">
              <div className="text-center">
                <p className="text-base font-bold text-gray-800">{totalBookingsCount}</p>
                <p className="text-[10px] text-gray-400 font-medium">Total</p>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-xs">
              {bookingStatusData.map((status, idx) => (
                <div key={idx} className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span className="text-[10px] text-gray-600">{status.label}</span>
                  </div>
                  <span className="font-bold text-gray-800 text-[10px]">{status.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}