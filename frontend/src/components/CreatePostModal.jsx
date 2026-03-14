import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import api from '../services/api';

// กำหนด Schema ป้องกันคนกรอกข้อมูลว่างเปล่า
const postSchema = z.object({
  bandName: z.string().min(1, "กรุณากรอกชื่อวง"),
  roleNeeded: z.string().min(1, "กรุณาระบุตำแหน่งที่ต้องการ (เช่น Drummer)"),
  tags: z.string().min(1, "กรุณาระบุแนวเพลง (คั่นด้วยลูกน้ำ เช่น Rock, Pop)"),
});

export default function CreatePostModal({ isOpen, onClose, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(postSchema)
  });

  // ถ้า Modal ไม่ได้ถูกเปิดอยู่ ให้คืนค่า null (ไม่แสดงผลอะไรเลย)
  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      // แปลงข้อความ tags เช่น "Rock, Pop, Jazz" ให้กลายเป็น Array ["Rock", "Pop", "Jazz"]
      const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

      // ยิง API สร้างโพสต์
      await api.post('/posts', {
        bandName: data.bandName,
        roleNeeded: data.roleNeeded,
        tags: tagsArray
      });

      reset(); // ล้างข้อมูลในฟอร์ม
      onSuccess(); // เรียกฟังก์ชันโหลดหน้า Feed ใหม่ (ที่ส่งมาจาก VibeHub)
      onClose(); // ปิด Modal
      
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างโพสต์: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    // พื้นหลังสีดำเบลอๆ (Glassmorphism Effect) [cite: 85, 86]
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      
      {/* กล่อง Modal สไตล์ Brutalism */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-4 bg-black text-white border-b-4 border-black">
          <h2 className="text-xl font-black uppercase tracking-widest text-yellow-400">Create Band Post</h2>
          <button onClick={onClose} className="hover:text-red-400 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-black uppercase mb-1">Band Name</label>
            <input 
              {...register('bandName')} 
              placeholder="e.g. THE STATIC NOISE"
              className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition font-bold"
            />
            {errors.bandName && <p className="text-xs text-red-500 font-bold mt-1 uppercase">{errors.bandName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Role Needed</label>
            <input 
              {...register('roleNeeded')} 
              placeholder="e.g. BASSIST"
              className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition font-bold"
            />
            {errors.roleNeeded && <p className="text-xs text-red-500 font-bold mt-1 uppercase">{errors.roleNeeded.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Vibe Tags (Comma separated)</label>
            <input 
              {...register('tags')} 
              placeholder="e.g. ALT-ROCK, GRUNGE"
              className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 transition font-bold"
            />
            {errors.tags && <p className="text-xs text-red-500 font-bold mt-1 uppercase">{errors.tags.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 mt-4 text-lg font-black uppercase transition bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post to VibeHub'}
          </button>
        </form>

      </div>
    </div>
  );
}