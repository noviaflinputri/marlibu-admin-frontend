'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsForm() {
  const [adminProfile, setAdminProfile] = useState({
    id: 1, // ID baris pengaturan di database
    name: 'Admin Marlibu',
    email: 'admin@marlibu.com',
    phone: '081234567890',
    role: 'Administrator Utama',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/settings')
      .then((res) => res.json())
      .then((response) => {
        if (response.success && response.data) {
          setAdminProfile({
            id: response.data.id || 1,
            name: response.data.company_name || 'Admin Marlibu',
            email: response.data.email || 'admin@marlibu.com',
            phone: response.data.phone || '081234567890',
            role: 'Administrator Utama',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal memuat pengaturan:', err);
        setLoading(false);
      });
  }, []);

  const passwordRequirements = [
    { label: 'Minimal 8 karakter', valid: passwordForm.newPassword.length >= 8 },
    { label: 'Minimal 1 huruf kapital (A-Z)', valid: /[A-Z]/.test(passwordForm.newPassword) },
    { label: 'Minimal 1 huruf kecil (a-z)', valid: /[a-z]/.test(passwordForm.newPassword) },
    { label: 'Minimal 1 angka (0-9)', valid: /[0-9]/.test(passwordForm.newPassword) },
    { label: 'Minimal 1 karakter spesial (!@#$%^&* dll)', valid: /[^A-Za-z0-9]/.test(passwordForm.newPassword) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.valid);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/settings/${adminProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: adminProfile.name,
          email: adminProfile.email,
          phone: adminProfile.phone,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } else {
        alert('Gagal menyimpan profil: ' + result.message);
      }
    } catch (error) {
      console.error('Error saat menyimpan profil:', error);
      alert('Terjadi kesalahan koneksi ke server backend.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!isPasswordValid) {
      setPasswordError('Kata sandi baru belum memenuhi semua persyaratan!');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setPasswordError('Sesi habis atau token tidak ditemukan. Silakan login ulang.');
        return;
      }

      const response = await fetch('http://localhost:5001/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPasswordSaved(true);
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setPasswordSaved(false), 3000);
      } else {
        setPasswordError(result.message || 'Gagal mengubah kata sandi.');
      }
    } catch (error) {
      console.error('Error saat mengubah password:', error);
      setPasswordError('Terjadi kesalahan koneksi ke server backend.');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full font-sans bg-gray-50 min-h-screen">
      {/* Header Halaman */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC] tracking-tight">Pengaturan Akun & Sistem</h1>
        <p className="text-xs text-gray-500 mt-1">
          Kelola profil pengelola dan keamanan kata sandi admin Marlibu Tour & Travel. {loading && '(Memuat data...)'}
        </p>
      </div>

      {/* Grid seimbang dengan items-stretch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Kolom Kiri: Profil Admin */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-gray-800">Profil Admin</h2>
              {profileSaved && (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  ✓ Profil tersimpan di database
                </span>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} id="profile-form" className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nama Lengkap / Travel</label>
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
            </form>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              form="profile-form"
              className="px-4 py-2 bg-[#0A64BC] text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-xs cursor-pointer text-xs"
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Ubah Kata Sandi Manual */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-gray-800">Ubah Kata Sandi Manual</h2>
              {passwordSaved && (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  ✓ Sandi diperbarui di Database
                </span>
              )}
            </div>

            {passwordError && (
              <div className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 mb-3">
                ⚠️ {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} id="password-form" className="space-y-3.5 text-xs">
              {/* Kata Sandi Saat Ini */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Masukkan kata sandi lama"
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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
                    autoComplete="new-password"
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>

                {/* Pesan Instruksi / Indikator Syarat Tanpa Kotak */}
                <div className="mt-2 text-[11px]">
                  {passwordForm.newPassword.length === 0 ? (
                    <p className="text-gray-400 italic">
                      Kata sandi minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus.
                    </p>
                  ) : (
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
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
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              form="password-form"
              disabled={!isPasswordValid}
              className={`px-4 py-2 font-semibold rounded-xl transition shadow-xs cursor-pointer text-xs ${
                isPasswordValid
                  ? 'bg-[#0A64BC] text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Ubah Kata Sandi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}