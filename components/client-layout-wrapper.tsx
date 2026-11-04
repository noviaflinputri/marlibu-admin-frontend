'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import { Menu } from 'lucide-react';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Jika di halaman Login, HANYA tampilkan halaman login (Tanpa Sidebar & Header)
  if (isLoginPage) {
    return <main className="w-full h-full overflow-y-auto bg-white">{children}</main>;
  }

  // Jika di halaman Admin/Dashboard, tampilkan dengan Sidebar & Header
  return (
    <div className="flex w-full h-full overflow-hidden bg-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white">
        {/* Header Atas */}
        <header className="bg-white border-b border-gray-100 py-3 px-4 md:px-6 flex justify-between lg:justify-end items-center shrink-0 z-10">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer focus:outline-none"
            title="Buka Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Profil Admin Pojok Kanan (Non-Interaktif) */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-full border border-gray-200 bg-transparent text-[#0A64BC] font-bold text-xs flex items-center justify-center shrink-0">
              AD
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800 leading-tight">Admin</span>
              <span className="text-[10px] text-gray-400 leading-tight">admin@marlibu.com</span>
            </div>
          </div>
        </header>

        {/* Area Konten Utama */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}