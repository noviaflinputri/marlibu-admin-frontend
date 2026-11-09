'use client';

import React, { useState } from 'react';

export default function SettingsForm() {
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin Marlibu',
    email: 'admin@marlibu.com',
    phone: '081234567890',
    role: 'Administrator Utama',
  });

  // Nilai awal kata sandi saat ini
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: 'Sitorusfamz123!',
    newPassword: '',
    confirmPassword: '',
  });

  // State toggle visibilitas mata
  const [showOldPassword, setShowOldPassword] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 5 Aturan Kelayakan Kata Sandi
  const passwordRequirements = [
    { label: 'Minimal 8 karakter', valid: passwordForm.newPassword.length >= 8 },
    { label: 'Minimal 1 huruf kapital (A-Z)', valid: /[A-Z]/.test(passwordForm.newPassword) },
    { label: 'Minimal 1 huruf kecil (a-z)', valid: /[a-z]/.test(passwordForm.newPassword) },
    { label: 'Minimal 1 angka (0-9)', valid: /[0-9]/.test(passwordForm.newPassword) },
    { label: 'Minimal 1 karakter spesial (!@#$%^&* dll)', valid: /[^A-Za-z0-9]/.test(passwordForm.newPassword) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.valid);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validasi 5 Syarat
    if (!isPasswordValid) {
      setPasswordError('Kata sandi baru belum memenuhi semua persyaratan!');
      return;
    }

    // Validasi Konfirmasi Sandi
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    // Otomatis perbarui kata sandi saat ini dengan kata sandi baru
    setPasswordForm({
      oldPassword: passwordForm.newPassword,
      newPassword: '',
      confirmPassword: '',
    });

    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-gray-50 min-h-screen">
      {/* Header Halaman */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Pengaturan Akun & Sistem</h1>
        <p className="text-xs text-gray-500 mt-1">
          Kelola profil pengelola dan keamanan kata sandi admin Marlibu Tour & Travel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Profil Admin */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-800">Profil Admin</h2>
            {profileSaved && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                ✓ Profil tersimpan
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={adminProfile.name}
                onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0A64BC] text-gray-700 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Alamat Email</label>
              <input
                type="email"
                required
                value={adminProfile.email}
                onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0A64BC] text-gray-700 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">No. WhatsApp / Telepon</label>
              <input
                type="text"
                required
                value={adminProfile.phone}
                onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0A64BC] text-gray-700 transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Peran Akses</label>
              <input
                type="text"
                disabled
                value={adminProfile.role}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#0A64BC] text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-xs cursor-pointer"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Ubah Kata Sandi Manual */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-800">Ubah Kata Sandi Manual</h2>
            {passwordSaved && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                ✓ Sandi diperbarui
              </span>
            )}
          </div>

          {passwordError && (
            <div className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              ⚠️ {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
            {/* Kata Sandi Saat Ini */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Kata Sandi Saat Ini</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full px-3.5 py-2 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0A64BC] text-gray-700 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showOldPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Kata Sandi Baru */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi baru"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0A64BC] text-gray-700 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showNewPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Indikator Real-Time 5 Syarat Password */}
              {passwordForm.newPassword.length > 0 && (
                <div className="mt-2.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1 text-[11px]">
                  <p className="font-semibold text-gray-600 mb-1">Syarat Kata Sandi Baru:</p>
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className={`flex items-center gap-1.5 ${req.valid ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                      <span>{req.valid ? '✓' : '○'}</span>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-[#0A64BC] text-gray-700 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isPasswordValid}
                className={`px-4 py-2 font-semibold rounded-xl transition shadow-xs cursor-pointer ${
                  isPasswordValid
                    ? 'bg-[#0A64BC] text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Ubah Kata Sandi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}