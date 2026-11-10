'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface DetailBookingProps {
  id: string;
}

export default function DetailBookingView({ id }: DetailBookingProps) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-white min-h-screen">
      {/* Top Navigation - Judul Biru & Tombol Back Lebih Besar */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href="/booking"
            className="p-1 -ml-1 text-gray-600 hover:text-[#0A64BC] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Kembali ke Data Booking"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">
            Detail Booking ({id})
          </h1>
        </div>
        <p className="text-xs text-gray-500 pl-8">
          Rincian lengkap transaksi pemesanan travel.
        </p>
      </div>

      {/* Grid Informasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Info Pemesan & Perjalanan (Sisi Kiri) */}
        <div className="md:col-span-2 space-y-6">
          {/* Informasi Pemesan */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Informasi Pemesan
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Nama Pelanggan</p>
                <p className="font-semibold text-gray-800 mt-1">Andi Pratama</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">No. Telepon / WhatsApp</p>
                <p className="font-semibold text-gray-800 mt-1">+62 812-3456-7890</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Email</p>
                <p className="font-semibold text-gray-800 mt-1">andi.pratama@gmail.com</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Tanggal Transaksi</p>
                <p className="font-semibold text-gray-800 mt-1">10 Okt 2026, 14:20 WIB</p>
              </div>
            </div>
          </div>

          {/* Detail Perjalanan */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Detail Perjalanan
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Rute</p>
                <p className="font-bold text-[#0A64BC] mt-1">Malang - Surabaya</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Tanggal & Jam Berangkat</p>
                <p className="font-semibold text-gray-800 mt-1">13 Okt 2026, 08:00 WIB</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Armada / Bus</p>
                <p className="font-semibold text-gray-800 mt-1">Toyota HiAce Premio (N 1234 AB)</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Nomor Kursi</p>
                <p className="font-semibold text-gray-800 mt-1">Kursi 03 (Jendela)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Pembayaran (Sisi Kanan) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 h-fit">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            Ringkasan Pembayaran
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Tiket Travel (1x)</span>
              <span className="font-semibold text-gray-800">Rp 150.000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Biaya Layanan</span>
              <span className="font-semibold text-gray-800">Rp 5.000</span>
            </div>
            
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-bold">
              <span className="text-gray-900">Total Pembayaran</span>
              <span className="text-gray-900 font-bold">Rp 155.000</span>
            </div>
            
            <div className="pt-3">
              <span className="w-full py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 block text-center">
                LUNAS (Dikonfirmasi)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}