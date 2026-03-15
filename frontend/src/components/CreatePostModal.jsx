import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import api from '../services/api';

export default function CreatePostModal({ isOpen, onClose, onSuccess, editData }) {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { postType: 'BandFinder' }
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  
  // 🚨 1. เพิ่ม State สำหรับเก็บว่าตอนนี้อยู่ Step 1 (กรอก) หรือ Step 2 (สรุป)
  const [step, setStep] = useState(1);

  const selectedPostType = watch('postType');
  // 🚨 ดึงข้อมูลทั้งหมดในฟอร์มออกมาเตรียมโชว์ในหน้าสรุป
  const formValues = watch(); 

  useEffect(() => {
    if (editData) {
      reset({
        postType: editData.postType || 'BandFinder',
        bandName: editData.bandName || "",
        roleNeeded: editData.roleNeeded || "",
        title: editData.title || "",
        content: editData.content || "",
        tags: editData.tags ? editData.tags.join(', ') : ""
      });
    } else {
      reset({
        postType: 'BandFinder',
        bandName: '', roleNeeded: '', title: '', content: '', tags: ''
      });
    }
    // เปิด Modal มาใหม่ ให้เริ่มที่ Step 1 เสมอ
    setStep(1); 
  }, [editData, isOpen, reset]);

  if (!isOpen) return null;

  // ฟังก์ชันปิด Modal พร้อมเคลียร์ค่า
  const handleClose = () => {
    onClose();
    setErrorMessage('');
    setStep(1);
  };

  const onSubmit = async (data) => {
    setErrorMessage('');

    // Validation ดักจับข้อมูลว่าง (Checklist C4)
    if (data.postType === 'BandFinder' && (!data.bandName || data.bandName.trim() === '')) {
      setErrorMessage('กรุณาระบุ "ชื่อวง" หรือชื่อโปรเจกต์ด้วยครับ 🎸');
      return; 
    }

    if (data.postType === 'Knowledge') {
      if (!data.title || data.title.trim() === '') {
        setErrorMessage('กรุณาระบุ "หัวข้อความรู้" ด้วยครับ 📚');
        return;
      }
      if (!data.content || data.content.trim() === '') {
        setErrorMessage('กรุณาพิมพ์รายละเอียดเนื้อหาโพสต์ด้วยครับ 📝');
        return;
      }
    }

    // ==========================================
    // 🚨 2. ลอจิกสลับ Step (Checklist C5)
    // ==========================================
    if (step === 1) {
      // ถ้าข้อมูลครบถ้วน ให้เปลี่ยนไปหน้า Step 2 (สรุป)
      setStep(2);
      return;
    }

    // ถ้ากดปุ่ม Submit จาก Step 2 (Confirm) ให้ยิง API ได้เลย!
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
        
        if (data.mediaFile && data.mediaFile.length > 0) {
          formData.append('mediaFile', data.mediaFile[0]); 
        }
      }

      if (editData) {
        await api.put(`/posts/${editData._id}`, formData);
      } else {
        await api.post('/posts', formData);
      }

      reset(); 
      handleClose(); 
      onSuccess(); 
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
    }
  };

  const modalTitle = editData ? "Edit Post" : "Create Post";
  const buttonText = editData ? "Update Post" : "Confirm & Post";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans bg-black/60 backdrop-blur-sm pt-20 pb-10">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in duration-200 my-auto">
        
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 text-white bg-black border-b-4 border-black">
          <h2 className="text-xl font-black tracking-widest text-yellow-400 uppercase">
            {step === 1 ? modalTitle : "Review Post"}
          </h2>
          <button onClick={handleClose} className="transition hover:text-red-400"><X size={24} /></button>
        </div>

        {/* ========================================== */}
        {/* 🚨 Progress Bar (Checklist C3) */}
        {/* ========================================== */}
        <div className="bg-gray-100 border-b-4 border-black">
          {/* ข้อความบอก Step */}
          <div className="flex justify-between px-6 py-2 text-xs font-black uppercase tracking-wider">
            <span className={step >= 1 ? "text-black" : "text-gray-400"}>
              1. Fill Details
            </span>
            <span className={step >= 2 ? "text-black" : "text-gray-400"}>
              2. Review & Post
            </span>
          </div>
          {/* หลอดพลัง Progress Bar */}
          <div className="w-full h-3 bg-white border-t-2 border-black relative">
            <div 
              className="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-500 ease-out border-r-2 border-black"
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* ========================================== */}
          {/* 🚨 UI Step 1: ฟอร์มกรอกข้อมูล */}
          {/* ========================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <div>
                <label className="block mb-2 text-sm font-black uppercase">Post Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input type="radio" value="BandFinder" {...register('postType')} className="w-4 h-4 text-black accent-black focus:ring-black" />
                    Band Finder 🎸
                  </label>
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input type="radio" value="Knowledge" {...register('postType')} className="w-4 h-4 text-black accent-black focus:ring-black" />
                    Knowledge 📚
                  </label>
                </div>
              </div>

              <hr className="my-4 border-t-2 border-gray-300 border-dashed" />

              {selectedPostType === 'BandFinder' ? (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-black uppercase">Band Name</label>
                    <input {...register('bandName')} placeholder="e.g. THE STATIC NOISE" className="w-full px-3 py-2 font-bold bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-black uppercase">Role Needed</label>
                    <input {...register('roleNeeded')} placeholder="e.g. BASSIST" className="w-full px-3 py-2 font-bold bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-black uppercase">Title</label>
                    <input {...register('title')} placeholder="หัวข้อความรู้..." className="w-full px-3 py-2 font-bold bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-black uppercase">Content</label>
                    <textarea {...register('content')} rows="4" placeholder="เนื้อหาความรู้ของคุณ..." className="w-full px-3 py-2 font-bold bg-gray-100 border-2 border-black rounded-lg resize-none focus:ring-4 focus:ring-yellow-400" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-black uppercase">Upload Media</label>
                    <input type="file" accept="image/*,video/mp4" {...register('mediaFile')} className="w-full px-3 py-2 text-sm font-bold transition bg-gray-100 border-2 border-black rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-black file:bg-yellow-400 file:text-black hover:file:bg-yellow-300" />
                  </div>
                </>
              )}

              <div>
                <label className="block mb-1 text-sm font-black uppercase">Vibe Tags (Comma separated)</label>
                <input {...register('tags')} placeholder="e.g. ALT-ROCK, THEORY" className="w-full px-3 py-2 font-bold bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400" />
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 🚨 UI Step 2: หน้า Data Review สรุปข้อมูล (Checklist C5) */}
          {/* ========================================== */}
          {step === 2 && (
            <div className="p-5 space-y-4 bg-gray-100 border-4 border-black border-dashed rounded-xl animate-in fade-in slide-in-from-right-4">
              <h3 className="pb-2 text-lg font-black text-center uppercase border-b-2 border-gray-300">Data Review</h3>
              
              <div className="font-medium text-gray-800">
                <p className="mb-2"><strong className="text-black uppercase">Type:</strong> {formValues.postType}</p>
                
                {formValues.postType === 'BandFinder' ? (
                  <>
                    <p className="mb-2"><strong className="text-black uppercase">Band:</strong> {formValues.bandName}</p>
                    <p className="mb-2"><strong className="text-black uppercase">Role:</strong> {formValues.roleNeeded}</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2"><strong className="text-black uppercase">Title:</strong> {formValues.title}</p>
                    <p className="mb-2"><strong className="text-black uppercase">Content:</strong> {formValues.content}</p>
                  </>
                )}
                
                <p className="mb-2"><strong className="text-black uppercase">Tags:</strong> {formValues.tags || '-'}</p>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 🚨 ปุ่มกด (เปลี่ยนตาม Step) */}
          {/* ========================================== */}
          <div className="sticky bottom-0 pt-4 pb-2 bg-white">
            {errorMessage && (
              <div className="p-3 mb-4 text-sm font-bold text-red-700 bg-red-100 border-2 border-red-500 rounded-xl animate-pulse">
                🚨 {errorMessage}
              </div>
            )}

            <div className="flex gap-3">
              {/* โชว์ปุ่ม Back เฉพาะตอนอยู่ Step 2 */}
              {step === 2 && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-1/3 py-3 font-black text-black uppercase transition bg-white border-4 border-black rounded-xl hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  BACK
                </button>
              )}

              {/* ปุ่ม Submit (ขยายเต็ม 100% ถ้าอยู่ Step 1) */}
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`py-3 text-lg font-black uppercase transition bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50 ${step === 2 ? 'w-2/3' : 'w-full'}`}
              >
                {isSubmitting ? 'Processing...' : (step === 1 ? 'Review Post' : buttonText)}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}