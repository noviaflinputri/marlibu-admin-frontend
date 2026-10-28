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
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mengarahkan ke /dashboard
    router.push('/dashboard');
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      // Memaksa Google menampilkan layar pilih akun (prompt: 'select_account')
      await signIn('google', { 
        callbackUrl: '/dashboard',
        prompt: 'select_account'
      });
    } catch (error) {
      console.error('Login Google Gagal:', error);
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-1 md:grid-cols-2 font-sans overflow-hidden">
      
      {/* Sisi Kiri: Hero Image */}
      <div className="relative hidden md:block w-full h-full bg-gray-100 overflow-hidden">
        <Image
          src="/login-bg.jpg"
          alt="Marlibu Travel Background"
          fill
          className="object-cover z-0"
          priority
        />
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="w-full h-full flex flex-col justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-white">
        
        {/* Area Tengah: Form Input */}
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Header Judul */}
          <div>
            <h1 className="text-3xl font-bold text-[#FF6B00] tracking-tight">
              Login Admin
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Masuk untuk mengakses dashboard admin.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="Masukkan email"
                required
                autoComplete="off"
                className="w-full text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white text-gray-800 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Input Kata Sandi */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  autoComplete="new-password"
                  className="w-full text-sm px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:bg-white text-gray-800 pr-12 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#0A64BC] hover:bg-[#08529B] text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer mt-4"
            >
              Masuk
            </button>
          </form>

          {/* Pembatas / Pemisah */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">atau</span>
            </div>
          </div>

          {/* Tombol Login Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loadingGoogle ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
          </button>
        </div>

      </div>

    </div>
  );
}