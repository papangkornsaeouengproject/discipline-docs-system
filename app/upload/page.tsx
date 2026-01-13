'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { collection, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { FiUpload, FiFile, FiCheckCircle } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    complainantName: '',
    subject: '',
    source: '',
    receivedDate: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (docId: string) => {
    if (!file) return null;

    // แยกนามสกุลไฟล์
    const fileExtension = file.name.split('.').pop();
    // สร้างชื่อไฟล์ใหม่ (ปลอดภัย ไม่มีอักขระพิเศษ)
    const safeFileName = `${Date.now()}.${fileExtension}`;
    const filePath = `documents/${docId}/${safeFileName}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return { 
      fileName: file.name, // เก็บชื่อเดิมไว้แสดง
      fileUrl: urlData.publicUrl,
      filePath 
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setSuccess(false);

    try {
      const docData = {
        complainantName: formData.complainantName,
        subject: formData.subject,
        source: formData.source,
        receivedDate: Timestamp.fromDate(new Date(formData.receivedDate)),
        notes: formData.notes
      };

      const docRef = await addDoc(collection(db, 'documents'), docData);

      if (file) {
        const fileData = await handleFileUpload(docRef.id);
        if (fileData) {
          await updateDoc(docRef, {
            fileName: fileData.fileName,
            fileUrl: fileData.fileUrl,
            filePath: fileData.filePath
          });
        }
      }

      setSuccess(true);
      
      // Reset form
      setFormData({
        complainantName: '',
        subject: '',
        source: '',
        receivedDate: new Date().toISOString().slice(0, 16),
        notes: ''
      });
      setFile(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/documents');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาด: ' + error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
            <FiUpload size={32} className="text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 px-2">
            อัปโหลดเอกสารใหม่
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            กรอกข้อมูลและอัปโหลดไฟล์เอกสารของคุณ
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-pulse">
            <div className="flex items-center gap-2 sm:gap-3">
              <FiCheckCircle size={24} className="text-green-500 flex-shrink-0 sm:w-8 sm:h-8" />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-green-800">บันทึกสำเร็จ!</h3>
                <p className="text-sm sm:text-base text-green-600">กำลังนำคุณไปยังหน้าเอกสาร...</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-5 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  ชื่อผู้ร้อง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.complainantName}
                  onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  placeholder="กรอกชื่อผู้ร้อง"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  มาจาก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  placeholder="แผนก/หน่วยงาน"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  เรื่อง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                  placeholder="หัวข้อเอกสาร"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  วันที่รับเรื่อง <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.receivedDate}
                  onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 resize-none"
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                อัปโหลดไฟล์
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 sm:p-6 text-center hover:border-indigo-500 transition-all active:border-indigo-600">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <FiFile size={40} className="mx-auto text-gray-400 mb-2 sm:w-12 sm:h-12" />
                  <p className="text-sm sm:text-base text-gray-600 mb-1 break-words px-2">
                    {file ? (
                      <span className="text-indigo-600 font-semibold">📎 {file.name}</span>
                    ) : (
                      'คลิกเพื่อเลือกไฟล์'
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    รองรับ PDF, Word, Excel, รูปภาพ
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm sm:text-base">กำลังบันทึก...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiUpload size={18} className="sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">บันทึกเอกสาร</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}