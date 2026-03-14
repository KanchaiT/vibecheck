import React, { useEffect } from 'react'; // 👈 นำเข้า useEffect
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import api from '../services/api';

// 👈 รับ Props editData เพิ่มเข้ามา
export default function CreatePostModal({ isOpen, onClose, onSuccess, editData }) {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { postType: 'BandFinder' }
  });

  const selectedPostType = watch('postType');

  // ==========================================
  // ใช้ useEffect เติมข้อมูลเก่าลงฟอร์ม ถ้าอยู่ใน "โหมดแก้ไข"
  // ==========================================
  useEffect(() => {
    if (editData) {
      // โหมดแก้ไข: เอาข้อมูลเก่ามาเซ็ตเป็นค่าเริ่มต้น
      reset({
        postType: editData.postType || 'BandFinder',
        bandName: editData.bandName || "",
        roleNeeded: editData.roleNeeded || "",
        title: editData.title || "",
        content: editData.content || "",
        tags: editData.tags ? editData.tags.join(', ') : ""
      });
    } else {
      // โหมดสร้างใหม่: ล้างค่าฟอร์มให้สะอาด
      reset({
        postType: 'BandFinder',
        bandName: '', roleNeeded: '', title: '', content: '', tags: ''
      });
    }
  }, [editData, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('postType', data.postType);
      formData.append('tags', data.tags || "");

      if (data.postType === 'BandFinder') {
        formData.append('bandName', data.bandName || "");
        formData.append('roleNeeded', data.roleNeeded || "");
      } else {
        formData.append('title', data.title || "");
        formData.append('content', data.content || "");
        
        // แนบไฟล์ใหม่ (ถ้ามีการเลือกไฟล์ใหม่)
        if (data.mediaFile && data.mediaFile.length > 0) {
          formData.append('mediaFile', data.mediaFile[0]); 
        }
      }

      // 👈 เช็คว่าเป็นการ "อัปเดต" หรือ "สร้างใหม่"
      if (editData) {
        // โหมดแก้ไข: ยิงแบบ PUT ไปที่ /posts/:id
        await api.put(`/posts/${editData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // โหมดสร้างใหม่: ยิงแบบ POST เหมือนเดิม
        await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      reset(); 
      onSuccess(); 
      onClose(); 
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
    }
  };

  // 👈 เปลี่ยนข้อความบนปุ่ม และหัวข้อ Modal ให้สอดคล้องกับโหมด
  const modalTitle = editData ? "Edit Post" : "Create Post";
  const buttonText = editData ? "Update Post" : "Post to VibeHub";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans overflow-y-auto pt-20 pb-10">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in duration-200 my-auto">
        
        <div className="flex justify-between items-center p-4 bg-black text-white border-b-4 border-black sticky top-0 z-10">
          <h2 className="text-xl font-black uppercase tracking-widest text-yellow-400">{modalTitle}</h2>
          <button onClick={onClose} className="hover:text-red-400 transition"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* ========================================== */}
          {/* ตรงนี้แหละครับคือจุดเลือกว่าจะเป็นโพสต์แบบไหน */}
          {/* ========================================== */}
          <div>
            <label className="block text-sm font-black uppercase mb-2">Post Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input type="radio" value="BandFinder" {...register('postType')} className="w-4 h-4 text-black focus:ring-black accent-black" />
                Band Finder 🎸
              </label>
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input type="radio" value="Knowledge" {...register('postType')} className="w-4 h-4 text-black focus:ring-black accent-black" />
                Knowledge 📚
              </label>
            </div>
          </div>

          <hr className="border-t-2 border-dashed border-gray-300 my-4" />

          {selectedPostType === 'BandFinder' ? (
            <>
              <div>
                <label className="block text-sm font-black uppercase mb-1">Band Name</label>
                <input {...register('bandName')} placeholder="e.g. THE STATIC NOISE" className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-black uppercase mb-1">Role Needed</label>
                <input {...register('roleNeeded')} placeholder="e.g. BASSIST" className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-black uppercase mb-1">Title</label>
                <input {...register('title')} placeholder="หัวข้อความรู้..." className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
              </div>
              <div>
                <label className="block text-sm font-black uppercase mb-1">Content</label>
                <textarea {...register('content')} rows="4" placeholder="เนื้อหาความรู้ของคุณ..." className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold resize-none" />
              </div>
              <div>
                {/* 👈 เปลี่ยนจาก Text Input เป็น File Input */}
                <label className="block text-sm font-black uppercase mb-1">Upload Media (Image or MP4)</label>
                <input 
                  type="file" 
                  accept="image/*,video/mp4" 
                  {...register('mediaFile')} 
                  className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-black file:text-sm file:font-bold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300 transition" 
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-black uppercase mb-1">Vibe Tags (Comma separated)</label>
            <input {...register('tags')} placeholder="e.g. ALT-ROCK, THEORY" className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
          </div>

          <div className="pt-4 pb-2 sticky bottom-0 bg-white">
            <button type="submit" disabled={isSubmitting} className="w-full py-3 text-lg font-black uppercase transition bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50">
              {isSubmitting ? 'Processing...' : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}