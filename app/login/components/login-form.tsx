
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
              disabled={loading}
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
                disabled={loading}
                className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white text-gray-800 pr-12 transition-all placeholder:text-gray-400 disabled:opacity-60"
              />

              {/* Toggle Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={
                  showPassword
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >

                {showPassword ? (

                  /* Eye Off Icon */
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

                  /* Eye Icon */
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
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Memeriksa akun...' : 'Masuk'}
          </button>

        </form>

        {/* Google Login Notice */}
        <div className="mt-5 text-center">
          <p className="text-xs text-gray-400">
            Login hanya tersedia untuk akun administrator terdaftar.
          </p>
        </div>

      </div>
    </div>
  );
}
