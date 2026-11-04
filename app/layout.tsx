import type { Metadata } from 'next';
import './globals.css';
import ClientLayoutWrapper from '@/components/client-layout-wrapper';

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
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}