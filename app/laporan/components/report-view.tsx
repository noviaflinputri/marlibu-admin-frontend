'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function ReportView() {
  const [selectedDate, setSelectedDate] = useState('2026-10-17');

  // Data ringkasan statistik
  const stats = [
    {
      title: 'Total Booking',
      value: '248',
      change: '+ 12%',
    },
    {
      title: 'Total Pendapatan',
      value: 'Rp 24.800.000',
      change: '+ 15%',
    },
    {
      title: 'Rata-rata Perjalanan',
      value: '3.2 hari',
      change: '+ 0%',
    },
    {
      title: 'Tingkat Kepuasan',
      value: '4.8 /5',
      change: '+ 6%',
    },
  ];

  // Data Grafik Bar Pendapatan
  const revenueData = [
    { date: '6 Okt', height: '35%' },
    { date: '7 Okt', height: '55%' },
    { date: '8 Okt', height: '70%' },
    { date: '9 Okt', height: '70%' },
    { date: '10 Okt', height: '90%' },
    { date: '11 Okt', height: '70%' },
    { date: '12 Okt', height: '85%' },
  ];

  // Data Status Booking (Donut Chart Legend)
  const bookingStatusData = [
    { label: 'Dikonfirmasi', percentage: '62%', color: 'bg-[#0A64BC]' },
    { label: 'Menunggu Konfirmasi', percentage: '18%', color: 'bg-[#FF6B00]' },
    { label: 'Dalam Perjalanan', percentage: '12%', color: 'bg-sky-400' },
    { label: 'Selesai', percentage: '6%', color: 'bg-gray-300' },
    { label: 'Dibatalkan', percentage: '2%', color: 'bg-red-500' },
  ];

  return (
    <div className="pt-2 px-4 md:px-6 pb-6 space-y-4 w-full font-sans max-w-5xl mx-auto">
      
      {/* Header Area Judul Halaman */}
      <div>
        <h1 className="text-xl font-bold text-[#0A64BC] tracking-tight">
          Laporan & Statistik
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Pantau performa dan statistik bisnis travel Anda.
        </p>
      </div>

      {/* Filter Bar (Input Date Picker & Tombol Tampilkan) */}
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
            <h3 className="text-lg font-extrabold text-gray-800">{item.value}</h3>
            <p className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{item.change}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Section Grafik: Pendapatan & Status Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card Grafik Pendapatan */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-gray-800">Pendapatan (Rp)</h2>
          
          <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-gray-100 pb-2">
            {revenueData.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  style={{ height: bar.height }}
                  className="w-full max-w-[32px] bg-[#0A64BC] rounded-t-lg hover:bg-[#08529B] transition-all cursor-pointer"
                  title={`${bar.date}: ${bar.height}`}
                />
                <span className="text-[10px] font-medium text-gray-400">{bar.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Donut Chart Status Booking */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-gray-800">Status Booking</h2>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full border-[12px] border-[#0A64BC] border-t-[#FF6B00] border-r-sky-400 border-b-gray-300 flex items-center justify-center shrink-0">
              <div className="text-center">
                <p className="text-base font-bold text-gray-800">248</p>
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