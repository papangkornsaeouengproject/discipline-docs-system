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
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { FiDownload, FiTrash2, FiEdit2, FiFile, FiSearch, FiX, FiSave } from 'react-icons/fi';
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
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editForm, setEditForm] = useState({
    complainantName: '',
    subject: '',
    source: '',
    receivedDate: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

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

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setEditForm({
      complainantName: doc.complainantName,
      subject: doc.subject,
      source: doc.source,
      receivedDate: format(doc.receivedDate, "yyyy-MM-dd'T'HH:mm"),
      notes: doc.notes
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDoc) return;
    setSaving(true);

    try {
      const docRef = doc(db, 'documents', editingDoc.id);
      await updateDoc(docRef, {
        complainantName: editForm.complainantName,
        subject: editForm.subject,
        source: editForm.source,
        receivedDate: Timestamp.fromDate(new Date(editForm.receivedDate)),
        notes: editForm.notes
      });

      alert('แก้ไขเอกสารสำเร็จ!');
      setEditingDoc(null);
      loadDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขเอกสาร');
    } finally {
      setSaving(false);
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

  const sources = ['all', ...Array.from(new Set(documents.map(doc => doc.source)))];

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
      <div className="py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              📁 เอกสารทั้งหมด
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              จัดการและค้นหาเอกสารที่บันทึกไว้
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="🔍 ค้นหาเอกสาร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                />
              </div>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source === 'all' ? '📋 แหล่งที่มาทั้งหมด' : `📌 ${source}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              แสดง {filteredDocuments.length} จาก {documents.length} เอกสาร
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
              <FiFile size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-16 sm:h-16" />
              <p className="text-lg sm:text-xl text-gray-600">ไม่พบเอกสาร</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base sm:text-lg mb-1 line-clamp-2">
                          {doc.subject}
                        </h3>
                        <p className="text-indigo-100 text-xs sm:text-sm truncate">
                          {doc.complainantName}
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                        <FiFile size={20} className="text-white sm:w-6 sm:h-6" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-500 whitespace-nowrap">📌 มาจาก:</span>
                        <span className="font-semibold text-gray-700 truncate">{doc.source}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-500 whitespace-nowrap">📅 วันที่:</span>
                        <span className="text-gray-700 truncate">
                          {format(doc.receivedDate, 'd MMM yyyy HH:mm', { locale: th })}
                        </span>
                      </div>
                      {doc.notes && (
                        <div className="text-xs sm:text-sm">
                          <span className="text-gray-500">📝 หมายเหตุ:</span>
                          <p className="text-gray-700 mt-1 line-clamp-2 break-words">{doc.notes}</p>
                        </div>
                      )}
                    </div>

                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm mb-2 sm:mb-3 min-w-0"
                      >
                        <FiDownload size={14} className="text-gray-600 flex-shrink-0 sm:w-4 sm:h-4" />
                        <span className="text-gray-700 truncate">{doc.fileName}</span>
                      </a>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
                      >
                        <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.filePath)}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                      >
                        <FiTrash2 size={14} className="sm:w-4 sm:h-4" />
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

      {editingDoc && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
            onClick={() => setEditingDoc(null)} 
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiEdit2 size={24} />
                  แก้ไขเอกสาร
                </h2>
                <button
                  onClick={() => setEditingDoc(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX size={24} className="text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ชื่อผู้ร้อง <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.complainantName}
                        onChange={(e) => setEditForm({ ...editForm, complainantName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                        placeholder="กรอกชื่อผู้ร้อง"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        มาจาก <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.source}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                        placeholder="แผนก/หน่วยงาน"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        เรื่อง <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.subject}
                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                        placeholder="หัวข้อเอกสาร"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        วันที่รับเรื่อง <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={editForm.receivedDate}
                        onChange={(e) => setEditForm({ ...editForm, receivedDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      หมายเหตุ
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 resize-none"
                      placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                    />
                  </div>

                  {editingDoc.fileName && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiFile className="text-indigo-600" size={18} />
                        ไฟล์ที่แนบมา:
                      </p>
                      <div className="bg-white px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-700">{editingDoc.fileName}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 flex items-start gap-2">
                        <span>⚠️</span>
                        <span>ไม่สามารถแก้ไขไฟล์ได้ หากต้องการเปลี่ยนไฟล์ กรุณาลบและอัปโหลดใหม่</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t flex gap-3 rounded-b-2xl">
                <button
                  onClick={() => setEditingDoc(null)}
                  className="flex-1 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={20} />
                      <span>บันทึกการแก้ไข</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}