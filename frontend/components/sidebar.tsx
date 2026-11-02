'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Calendar,
  Bus,
  CreditCard,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  Compass,
  RefreshCcw,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';

const menuGroups = [
  {
    title: 'Utama',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    ]
  },
  {
    title: 'Operasional',
    items: [
      { name: 'Booking', href: '/booking', icon: <Ticket className="w-5 h-5 shrink-0" /> },
      { name: 'Pelanggan', href: '/pelanggan', icon: <Users className="w-5 h-5 shrink-0" /> },
      { name: 'Jadwal & Rute', href: '/jadwal', icon: <Calendar className="w-5 h-5 shrink-0" /> },
      { name: 'Transportasi', href: '/transportasi', icon: <Bus className="w-5 h-5 shrink-0" /> },
    ]
  },
  {
    title: 'Keuangan & Analisis',
    items: [
      { name: 'Pembayaran', href: '/pembayaran', icon: <CreditCard className="w-5 h-5 shrink-0" /> },
      { name: 'Refund', href: '/refund', icon: <RefreshCcw className="w-5 h-5 shrink-0" /> },
      { name: 'Promo', href: '/promo', icon: <Tag className="w-5 h-5 shrink-0" /> },
      { name: 'Laporan', href: '/laporan', icon: <BarChart3 className="w-5 h-5 shrink-0" /> },
    ]
  },
  {
    title: 'Sistem',
    items: [
      { name: 'Pengaturan', href: '/pengaturan', icon: <Settings className="w-5 h-5 shrink-0" /> },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  isOpen = true,
  onToggle,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const showExpanded = isOpen || isMobileOpen;

  return (
    <>
      {/* Overlay Gelap Mobile & Tablet */}
      {isMobileOpen && (
        <div 
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`bg-gradient-to-b from-[#0A64BC] to-[#084C8D] text-white shrink-0 flex flex-col transition-all duration-300 z-50 fixed lg:static inset-y-0 left-0 max-h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          showExpanded ? 'w-64 p-4' : 'w-20 p-3 items-center'
        }`}
      >
        {/* Tombol Silang (Close Mobile & Tablet) */}
        <button
          onClick={onMobileClose}
          type="button"
          aria-label="Tutup Menu"
          className="lg:hidden absolute top-3.5 right-3 z-50 p-2 text-white hover:text-blue-200 cursor-pointer rounded-lg bg-black/10 hover:bg-black/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tombol Toggle Collapse Desktop */}
        {onToggle && (
          <button
            onClick={onToggle}
            type="button"
            title={isOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
            className={`hidden lg:block absolute top-14 z-50 p-1 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer ${
              isOpen ? 'right-3' : 'right-2.5'
            }`}
          >
            {isOpen ? <PanelLeftClose className="w-6 h-6" /> : <PanelLeftOpen className="w-6 h-6" />}
          </button>
        )}

        {/* Header & Logo */}
        <div className={`flex items-center mb-3.5 shrink-0 ${showExpanded ? 'gap-2.5 px-0.5 pr-8 lg:pr-0' : 'justify-center'}`}>
          {!imgError ? (
            <img
              src="/logo.png"
              alt="Marlibu Logo"
              className="w-10 h-10 md:w-[48px] md:h-[48px] shrink-0 object-contain drop-shadow"
              onError={() => setImgError(true)}
            />
          ) : (
            <Compass className="w-10 h-10 md:w-11 md:h-11 shrink-0 text-white" />
          )}

          {showExpanded && (
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-[13px] tracking-tight text-white leading-tight">
                Marlibu Tour & Travel
              </h1>
              <p className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase opacity-90 mt-0.5 whitespace-nowrap">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        <div className="border-b border-white/25 my-2.5 shrink-0 w-full" />

        {/* Menu Navigasi (Compact) */}
        <div className="w-full flex flex-col pt-1 shrink-0">
          <nav className="space-y-4 w-full">
            {menuGroups.map((group, index) => (
              <div key={index} className="space-y-1">
                {showExpanded ? (
                  <h2 className="text-[10px] font-bold text-blue-200 uppercase tracking-wider px-3 mb-1 opacity-80">
                    {group.title}
                  </h2>
                ) : (
                  <div className="border-t border-white/10 my-2 w-full" />
                )}

                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onMobileClose}
                      title={!showExpanded ? item.name : undefined}
                      className={`flex items-center font-medium rounded-xl transition-all text-xs py-2.5 ${
                        showExpanded ? 'gap-3 px-3.5' : 'justify-center px-0'
                      } ${
                        isActive
                          ? 'bg-white text-[#0A64BC] font-semibold shadow-md translate-x-0.5'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {showExpanded && <span className="whitespace-nowrap">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Profile Langsung Nempel di Bawah Menu */}
        <div className={`pt-3 mt-3 border-t border-white/25 shrink-0 space-y-2 bg-[#084C8D]/40 rounded-xl p-2 ${showExpanded ? 'w-full' : 'w-full flex flex-col items-center'}`}>
          <div className={`flex items-center ${showExpanded ? 'gap-2.5 px-1' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
              AD
            </div>
            {showExpanded && (
              <div className="text-xs whitespace-nowrap overflow-hidden">
                <p className="font-semibold text-white leading-tight">Admin</p>
                <p className="text-[10px] text-blue-200 truncate">admin@marlibu.com</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={!showExpanded ? "Logout" : undefined}
            className={`w-full flex items-center font-medium rounded-lg transition-all text-xs py-1.5 text-blue-100 hover:bg-red-500/80 hover:text-white cursor-pointer ${
              showExpanded ? 'gap-2 px-2' : 'justify-center px-0'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {showExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}