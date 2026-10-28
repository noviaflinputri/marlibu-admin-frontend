'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/sidebar';
import { Menu } from 'lucide-react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <html lang="id">
      <body className="bg-gray-50 flex h-screen w-screen overflow-hidden font-sans">
        {isLoginPage ? (
          <main className="w-full h-full overflow-y-auto">{children}</main>
        ) : (
          <div className="flex w-full h-full overflow-hidden">
            <Sidebar 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
              isMobileOpen={isMobileOpen}
              onMobileClose={() => setIsMobileOpen(false)}
            />

            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
              <header className="bg-white border-b border-gray-100 py-3 px-4 md:px-6 flex justify-between lg:justify-end items-center shrink-0 z-10">
                {/* Tombol Hamburger (Muncul di HP & Tablet / < 1024px) */}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(true)}
                  className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer focus:outline-none"
                  title="Buka Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <span className="text-xs font-semibold text-white bg-[#0A64BC] px-3.5 py-1.5 rounded-full shadow-2xs">
                  Admin Marlibu
                </span>
              </header>

              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}