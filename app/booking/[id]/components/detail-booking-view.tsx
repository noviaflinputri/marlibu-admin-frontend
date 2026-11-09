'use client';

import React from 'react';
import Link from 'next/link';

interface DetailBookingProps {
  id: string;
}

export default function DetailBookingView({ id }: DetailBookingProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/booking"
          className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-xs font-semibold flex items-center gap-1.5"
        >
          ← Kembali
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Detail Booking ({id})</h1>
          <p className="text-xs text-gray-500">Rincian lengkap transaksi pemesanan travel.</p>
        </div>
      </div>

      {/* Grid Informasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Pemesan & Perjalanan */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Informasi Pemesan</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Nama Pelanggan</p>
                <p className="font-semibold text-gray-800 mt-0.5">Andi Pratama</p>
              </div>
              <div>
                <p className="text-gray-400">No. Telepon / WhatsApp</p>
                <p className="font-semibold text-gray-800 mt-0.5">+62 812-3456-7890</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="font-semibold text-gray-800 mt-0.5">andi.pratama@gmail.com</p>
              </div>
              <div>
                <p className="text-gray-400">Tanggal Transaksi</p>
                <p className="font-semibold text-gray-800 mt-0.5">10 Okt 2026, 14:20 WIB</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Detail Perjalanan</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Rute</p>
                <p className="font-bold text-[#0A64BC] mt-0.5">Malang - Surabaya</p>
              </div>
              <div>
                <p className="text-gray-400">Tanggal & Jam Berangkat</p>
                <p className="font-semibold text-gray-800 mt-0.5">13 Okt 2026, 08:00 WIB</p>
              </div>
              <div>
                <p className="text-gray-400">Armada / Bus</p>
                <p className="font-semibold text-gray-800 mt-0.5">Toyota HiAce Premio (N 1234 AB)</p>
              </div>
              <div>
                <p className="text-gray-400">Nomor Kursi</p>
                <p className="font-semibold text-gray-800 mt-0.5">Kursi 03 (Jendela)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 h-fit">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3">Ringkasan Pembayaran</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Tiket Travel (1x)</span>
              <span className="font-semibold text-gray-800">Rp 150.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Biaya Layanan</span>
              <span className="font-semibold text-gray-800">Rp 5.000</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold">
              <span className="text-gray-800">Total Pembayaran</span>
              <span className="text-[#F97316]">Rp 155.000</span>
            </div>
            <div className="pt-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 block text-center">
                LUNAS (Dikonfirmasi)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}