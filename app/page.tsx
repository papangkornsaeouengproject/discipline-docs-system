'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();

  // ถ้า login แล้ว redirect ไป dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (error.code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else if (error.code === 'auth/too-many-requests') {
        setError('ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่');
      } else if (error.code === 'auth/invalid-credential') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  // ถ้ายัง loading หรือ login แล้ว แสดง loading
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 p-3 sm:p-4 rounded-full mb-3 sm:mb-4 animate-bounce">
            <span className="text-4xl sm:text-5xl">📋</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 px-2">
            ระบบจัดเก็บเอกสารคดีวินัย
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
            เข้าสู่ระบบเพื่อจัดการเอกสารของคุณ
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 animate-pulse">
            <p className="text-red-800 text-xs sm:text-sm text-center break-words">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm sm:text-base">กำลังเข้าสู่ระบบ...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiLogIn size={18} />
                  <span className="text-sm sm:text-base">เข้าสู่ระบบ</span>
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 underline">
                สมัครสมาชิกที่นี่
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 text-center">
            ✨ ระบบของเรา
          </h3>
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <span className="text-green-600 text-lg sm:text-xl">✓</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-700">จัดเก็บเอกสารอย่างเป็นระบบ</span>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <span className="text-green-600 text-lg sm:text-xl">✓</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-700">ค้นหาเอกสารได้รวดเร็ว</span>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <span className="text-green-600 text-lg sm:text-xl">✓</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-700">ปลอดภัย ใช้งานง่าย</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}