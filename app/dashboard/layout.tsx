import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Cukup render children tanpa memanggil Sidebar lagi */}
      {children}
    </div>
  );
}