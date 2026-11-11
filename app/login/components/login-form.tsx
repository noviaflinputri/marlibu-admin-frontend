
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(
          data.message || 'Login gagal. Periksa email dan password.'
        );
        return;
      }

      if (!data.token || data.user?.role !== 'admin') {
        setErrorMsg(
          'Akses ditolak. Hanya administrator yang dapat masuk.'
        );
        return;
      }

      localStorage.setItem('admin_token', data.token);

      localStorage.setItem(
        'admin_user',
        JSON.stringify(data.user)
      );

      router.replace('/dashboard');

    } catch (error) {
      console.error('Login error:', error);

      setErrorMsg(
        'Tidak dapat terhubung ke server. Pastikan backend berjalan.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setGoogleLoading(true);

    try {
      await signIn('google', {
        redirectTo: '/dashboard',
      });
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMsg('Login Google gagal. Silakan coba kembali.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden flex items-center justify-center font-sans">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/loginpage.jpeg"
          alt="Marlibu Travel Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white p-8 sm:p-10 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#FF6B00] tracking-tight">
            Login Admin
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Masuk untuk mengakses dashboard admin Marlibu Travel.
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg text-center border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          autoComplete="off"
        >

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value.toLowerCase())
              }
              placeholder="Masukkan email"
              required
              autoComplete="username"
              disabled={loading || googleLoading}
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white text-gray-800 transition-all placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">
              Kata Sandi
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
                disabled={loading || googleLoading}
                className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white text-gray-800 pr-12 transition-all placeholder:text-gray-400 disabled:opacity-60"
              />

              {/* Toggle Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || googleLoading}
                aria-label={
                  showPassword
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                    <path d="M16.68 16.68A10.94 10.94 0 0 1 12 18c-7 0-11-6-11-6a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.88 5.09A10.93 10.93 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Memeriksa akun...' : 'Masuk'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">ATAU</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.08 13.22l7.98 6.19C12.96 13.72 18.03 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.45 5.78c4.35-4.02 7.31-9.95 7.31-17.43z" />
            <path fill="#FBBC05" d="M10.06 28.59A14.4 14.4 0 0 1 9.3 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.58 10.78l7.48-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.78l-7.45-5.78c-2.07 1.39-4.72 2.21-8.46 2.21-5.97 0-11.04-4.22-12.94-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48z" />
          </svg>

          {googleLoading ? 'Menghubungkan ke Google...' : 'Login dengan Google'}
        </button>

        {/* Login Notice */}
        <div className="mt-5 text-center">
          <p className="text-xs text-gray-400">
            Login hanya tersedia untuk akun administrator terdaftar.
          </p>
        </div>

      </div>
    </div>
  );
}
