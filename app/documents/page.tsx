'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { FiDownload, FiTrash2, FiEdit2, FiFile, FiSearch } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Document {
  id: string;
  complainantName: string;
  subject: string;
  source: string;
  receivedDate: Date;
  notes: string;
  fileName?: string;
  fileUrl?: string;
  filePath?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const q = query(collection(db, 'documents'), orderBy('receivedDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs: Document[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          complainantName: data.complainantName,
          subject: data.subject,
          source: data.source,
          receivedDate: data.receivedDate.toDate(),
          notes: data.notes,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          filePath: data.filePath
        });
      });
      
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, filePath?: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?')) return;

    try {
      if (filePath) {
        await supabase.storage.from('documents').remove([filePath]);
      }
      await deleteDoc(doc(db, 'documents', id));
      alert('ลบเอกสารสำเร็จ!');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  // Get unique sources
  const sources = ['all', ...Array.from(new Set(documents.map(doc => doc.source)))];

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = selectedSource === 'all' || doc.source === selectedSource;
    
    return matchesSearch && matchesSource;
  });

  if (loading) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📁 เอกสารทั้งหมด
          </h1>
          <p className="text-gray-600">
            จัดการและค้นหาเอกสารที่บันทึกไว้
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="🔍 ค้นหาเอกสาร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              />
            </div>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
            >
              {sources.map(source => (
                <option key={source} value={source}>
                  {source === 'all' ? '📋 แหล่งที่มาทั้งหมด' : `📌 ${source}`}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            แสดง {filteredDocuments.length} จาก {documents.length} เอกสาร
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiFile size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600">ไม่พบเอกสาร</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                        {doc.subject}
                      </h3>
                      <p className="text-indigo-100 text-sm">
                        {doc.complainantName}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <FiFile size={24} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">📌 มาจาก:</span>
                      <span className="font-semibold text-gray-700">{doc.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">📅 วันที่:</span>
                      <span className="text-gray-700">
                        {format(doc.receivedDate, 'd MMM yyyy HH:mm', { locale: th })}
                      </span>
                    </div>
                    {doc.notes && (
                      <div className="text-sm">
                        <span className="text-gray-500">📝 หมายเหตุ:</span>
                        <p className="text-gray-700 mt-1 line-clamp-2">{doc.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* File */}
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm mb-3"
                    >
                      <FiDownload size={16} className="text-gray-600" />
                      <span className="text-gray-700 truncate">{doc.fileName}</span>
                    </a>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(doc.id, doc.filePath)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 size={16} />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}