import type { Metadata } from 'next';
import Sidebar from '@/components/sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Marlibu Tour & Travel',
  description: 'Panel Kontrol Admin Marlibu Tour & Travel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-white flex h-screen w-screen overflow-hidden font-sans text-gray-900 antialiased">
        <div className="flex w-full h-full overflow-hidden bg-white">
          {/* Sidebar Navigation */}
          <Sidebar />

          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white">
            {/* Header Atas */}
            <header className="bg-white border-b border-gray-100 py-3 px-4 md:px-6 flex justify-end items-center shrink-0 z-10">
              {/* Informasional Profil Admin Pojok Kanan */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-gray-200 bg-transparent text-[#0A64BC] font-bold text-xs flex items-center justify-center shrink-0 select-none">
                  AD
                </div>
                <div className="flex flex-col text-left select-none">
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
      </body>
    </html>
  );
}