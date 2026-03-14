import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, token, setAuth } = useAuthStore();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  // ดึงข้อมูลเดิมมาใส่ในช่องกรอก
  useEffect(() => {
    if (user && isOpen) {
      reset({ 
        majorInstrument: user.majorInstrument || "",
        displayName: user.displayName || "",
        bio: user.bio || "",
        // แปลง Array เป็น String เช่น ["Rock", "Pop"] -> "Rock, Pop"
        vibeTags: user.vibeTags ? user.vibeTags.join(', ') : "",
        youtubeUrl: user.youtubeUrl || "",
        spotifyUrl: user.spotifyUrl || ""
      });
    }
  }, [user, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      // แปลง String กลับเป็น Array
      const tagsArray = data.vibeTags
        ? data.vibeTags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
        : [];

      const response = await api.put('/users/profile', {
        majorInstrument: data.majorInstrument,
        displayName: data.displayName,
        bio: data.bio,
        vibeTags: tagsArray,
        youtubeUrl: data.youtubeUrl,
        spotifyUrl: data.spotifyUrl
      });

      setAuth(response.data, token); 
      onClose();
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans overflow-y-auto pt-20 pb-10">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 my-auto">
        
        <div className="flex justify-between items-center p-4 bg-black text-white border-b-4 border-black sticky top-0 z-10">
          <h2 className="text-xl font-black uppercase tracking-widest text-yellow-400">Edit Profile</h2>
          <button onClick={onClose} className="hover:text-red-400 transition"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          <div>
            <label className="block text-sm font-black uppercase mb-1">Display Name</label>
            <input {...register('displayName')} placeholder="ชื่อเท่ๆ ของคุณ (เว้นว่างจะใช้ Username)" className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Major Instrument</label>
            <input {...register('majorInstrument', { required: true })} placeholder="e.g. Electric Guitar" className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Bio</label>
            <textarea {...register('bio')} rows="3" placeholder="เล่าเรื่องราวของคุณสักหน่อย..." className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold resize-none" />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1">Vibe Tags (Comma separated)</label>
            <input {...register('vibeTags')} placeholder="e.g. J-Rock, Metal, Indie" className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
          </div>

          <div className="pt-2 border-t-2 border-dashed border-gray-300">
            <label className="block text-sm font-black uppercase mb-1 text-red-500">YouTube Link</label>
            <input {...register('youtubeUrl')} placeholder="https://youtube.com/..." className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-1 text-green-500">Spotify Link</label>
            <input {...register('spotifyUrl')} placeholder="https://open.spotify.com/..." className="w-full px-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
          </div>

          <div className="pt-4 pb-2 sticky bottom-0 bg-white">
            <button type="submit" disabled={isSubmitting} className="w-full py-3 text-lg font-black uppercase transition bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}