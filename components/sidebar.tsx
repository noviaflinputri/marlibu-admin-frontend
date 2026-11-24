'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

const initialMenuGroups = [
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    'Utama': true,
    'Operasional': true,
    'Keuangan & Analisis': true,
    'Sistem': true,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Klik tombol Logout di sidebar -> hanya membuka dialog konfirmasi
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    if (isLoggingOut) return;
    setShowLogoutConfirm(false);
  };

  // Logout benar-benar dijalankan hanya setelah user menekan "Ya, Keluar"
  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Gagal logout:', error);
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Tutup dialog dengan tombol Escape
  useEffect(() => {
    if (!showLogoutConfirm) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        setShowLogoutConfirm(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showLogoutConfirm, isLoggingOut]);

  const showExpanded = isOpen || isMobileOpen;

  return (
    <>
      {isMobileOpen && (
        <div 
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`bg-gradient-to-b from-[#0A64BC] to-[#084C8D] text-white shrink-0 flex flex-col justify-between h-screen transition-all duration-300 z-50 fixed lg:static inset-y-0 left-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          showExpanded ? 'w-64 p-4 pr-2' : 'w-20 p-3 items-center'
        }`}
      >
        <button
          onClick={onMobileClose}
          type="button"
          aria-label="Tutup Menu"
          className="lg:hidden absolute top-3.5 right-3 z-50 p-2 text-white hover:text-blue-200 cursor-pointer rounded-lg bg-black/10 hover:bg-black/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. BAGIAN ATAS: Header Sidebar (Dipertahankan diam di atas) */}
        <div className="w-full shrink-0 pb-3 border-b border-white/20">
          <div className={`w-full flex items-center ${showExpanded ? 'justify-between px-1' : 'justify-center'}`}>
            {showExpanded ? (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  {!imgError ? (
                    <img
                      src="/logo.png"
                      alt="Marlibu Logo"
                      className="w-10 h-10 md:w-11 md:h-11 shrink-0 object-contain drop-shadow"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <Compass className="w-10 h-10 md:w-11 md:h-11 shrink-0 text-white" />
                  )}

                  <div className="flex flex-col min-w-0">
                    <h1 className="font-extrabold text-xs tracking-tight text-white leading-snug truncate">
                      Marlibu Tour & Travel
                    </h1>
                    <p className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase opacity-90 mt-0.5">
                      Admin Panel
                    </p>
                  </div>
                </div>

                {onToggle && (
                  <button
                    onClick={onToggle}
                    type="button"
                    title="Tutup Sidebar"
                    className="text-white hover:text-blue-200 transition-all cursor-pointer p-1 shrink-0"
                  >
                    <PanelLeftClose className="w-5 h-5" />
                  </button>
                )}
              </>
            ) : (
              <div className="w-full flex justify-center py-1">
                {onToggle && (
                  <button
                    onClick={onToggle}
                    type="button"
                    title="Buka Sidebar"
                    className="text-blue-100 hover:text-white transition-all cursor-pointer p-0"
                  >
                    <PanelLeftOpen className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. BAGIAN TENGAH: Navigasi Menu (Bisa di-scroll jika menu panjang) */}
        <div className="w-full flex-1 overflow-y-auto py-3 pr-1.5 
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-white/20 
          [&::-webkit-scrollbar-thumb]:rounded-full 
          hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
          
          <nav className="space-y-3 w-full">
            {initialMenuGroups.map((group, index) => {
              const isGroupOpen = openGroups[group.title] ?? true;

              return (
                <div key={index} className="space-y-1">
                  {showExpanded ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      type="button"
                      className="w-full flex items-center justify-between text-[10px] font-bold text-blue-200 uppercase tracking-wider px-3 py-1 hover:text-white transition cursor-pointer rounded-lg hover:bg-white/5"
                    >
                      <span>{group.title}</span>
                      {isGroupOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 opacity-70" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </button>
                  ) : (
                    <div className="my-2 w-full" />
                  )}

                  {(isGroupOpen || !showExpanded) && (
                    <div className="space-y-1">
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
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* 3. BAGIAN BAWAH: Card Profil Admin & Logout (Dipertahankan dengan garis lurus di atasnya) */}
        <div className="w-full shrink-0 pt-3 border-t border-white/20 mt-auto">
          <div className={`bg-[#084C8D]/70 border border-white/20 rounded-2xl p-3.5 ${showExpanded ? 'w-full space-y-3' : 'w-full flex flex-col items-center gap-3'}`}>
            <div className={`flex items-center ${showExpanded ? 'gap-3' : 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-inner">
                AD
              </div>
              {showExpanded && (
                <div className="text-xs whitespace-nowrap overflow-hidden">
                  <p className="font-semibold text-white leading-tight">Admin</p>
                  <p className="text-[10px] text-blue-200 truncate mt-0.5">admin@marlibu.com</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              title={!showExpanded ? "Logout" : undefined}
              className={`w-full flex items-center font-medium transition-all text-xs text-white/90 hover:text-white cursor-pointer ${
                showExpanded ? 'gap-2.5 px-0.5' : 'justify-center px-0'
              }`}
            >
              <LogOut className="w-4.5 h-4.5 shrink-0" />
              {showExpanded && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MODAL KONFIRMASI LOGOUT
          Sengaja diletakkan DI LUAR <aside> supaya posisi "fixed"-nya tidak
          terpengaruh oleh transform (translate-x) milik sidebar di mobile. */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleCancelLogout}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-desc"
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>

            <h2 id="logout-title" className="text-lg font-bold text-gray-900">
              Yakin ingin keluar?
            </h2>
            <p id="logout-desc" className="text-sm text-gray-500 mt-1.5">
              Anda akan keluar dari Admin Panel Marlibu Travel dan harus login kembali untuk mengakses dashboard.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}