'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiUpload, FiBarChart2, FiFolder, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ถ้าอยู่หน้า login หรือ register ไม่แสดง navbar
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">ระบบจัดเก็บเอกสาร</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              <FiHome size={20} />
              <span className="hidden sm:inline">หน้าแรก</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/upload"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive('/upload')
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  <FiUpload size={20} />
                  <span className="hidden sm:inline">อัปโหลด</span>
                </Link>

                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive('/dashboard')
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  <FiBarChart2 size={20} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <Link
                  href="/documents"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive('/documents')
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  <FiFolder size={20} />
                  <span className="hidden sm:inline">เอกสาร</span>
                </Link>
              </>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 rounded-lg">
                  <FiUser size={16} />
                  <span className="text-sm">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  <FiLogOut size={20} />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors ml-2"
              >
                <FiLogIn size={20} />
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}