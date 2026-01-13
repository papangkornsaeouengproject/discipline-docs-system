'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { FiFile, FiUpload, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Document {
  id: string;
  receivedDate: Date;
  source: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    withFiles: 0,
    sources: {} as Record<string, number>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const q = query(collection(db, 'documents'));
      const querySnapshot = await getDocs(q);
      const docs: Document[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          receivedDate: data.receivedDate.toDate(),
          source: data.source
        });
      });

      setDocuments(docs);
      calculateStats(docs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs: Document[]) => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonth = docs.filter(doc =>
      isWithinInterval(doc.receivedDate, { start: monthStart, end: monthEnd })
    ).length;

    // Count by source
    const sources: Record<string, number> = {};
    docs.forEach(doc => {
      sources[doc.source] = (sources[doc.source] || 0) + 1;
    });

    setStats({
      total: docs.length,
      thisMonth,
      withFiles: docs.length,
      sources
    });
  };

  const topSources = Object.entries(stats.sources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            📊 Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            ภาพรวมและสถิติการจัดเก็บเอกสาร
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Documents */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 sm:p-6 text-white transform hover:scale-105 transition-transform active:scale-95">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
                <FiFile size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <FiTrendingUp size={18} className="opacity-75 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stats.total}</h3>
            <p className="text-xs sm:text-sm text-blue-100">เอกสารทั้งหมด</p>
          </div>

          {/* This Month */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 sm:p-6 text-white transform hover:scale-105 transition-transform active:scale-95">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
                <FiCalendar size={20} className="sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <FiTrendingUp size={18} className="opacity-75 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stats.thisMonth}</h3>
            <p className="text-xs sm:text-sm text-purple-100">เดือนนี้</p>
          </div>

          {/* With Files */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 sm:p-6 text-white transform hover:scale-105 transition-transform active:scale-95">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
                <FiUpload size={20} className="sm:w-6 sm:h-6 text-green-600" />
              </div>
              <FiTrendingUp size={18} className="opacity-75 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stats.withFiles}</h3>
            <p className="text-xs sm:text-sm text-green-100">มีไฟล์แนบ</p>
          </div>

          {/* Sources */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 sm:p-6 text-white transform hover:scale-105 transition-transform active:scale-95">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
                <FiFile size={20} className="sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <FiTrendingUp size={18} className="opacity-75 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">{Object.keys(stats.sources).length}</h3>
            <p className="text-xs sm:text-sm text-orange-100">แหล่งที่มา</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Top Sources */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              🏆 Top 5 แหล่งที่มา
            </h2>
            <div className="space-y-3">
              {topSources.length > 0 ? (
                topSources.map(([source, count], index) => (
                  <div key={source} className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-indigo-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">{source}</span>
                        <span className="text-gray-600 text-xs sm:text-sm whitespace-nowrap">{count} เอกสาร</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">ยังไม่มีข้อมูล</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              📅 เอกสารล่าสุด
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {documents.length > 0 ? (
                documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-98">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiFile size={16} className="text-indigo-600 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{doc.source}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {format(doc.receivedDate, 'd MMM yyyy HH:mm', { locale: th })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">ยังไม่มีเอกสาร</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 sm:p-8 text-white text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            🎉 ระบบทำงานได้อย่างยอดเยี่ยม!
          </h2>
          <p className="text-sm sm:text-base text-indigo-100">
            คุณมีเอกสารทั้งหมด {stats.total} รายการ จาก {Object.keys(stats.sources).length} แหล่งที่มา
          </p>
        </div>
      </div>
    </div>
  );
}