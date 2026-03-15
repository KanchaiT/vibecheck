import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 🚨 นำเข้าตัวดึง ID จาก URL
import { useAuthStore } from '../store/authStore'; 
import { Edit2, Music, Star, Activity, Youtube, Headphones } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import api from '../services/api'; // 🚨 นำเข้าตัวยิง API

export default function ArtistProfile() {
  const { id } = useParams(); // 👈 ดึง ID จาก URL (ถ้ามี)
  const currentUser = useAuthStore((state) => state.user); // ข้อมูลตัวเราเอง
  
  const [profileUser, setProfileUser] = useState(null); // ข้อมูลคนที่เรากำลังส่อง
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 

  // ฟังก์ชันดึงข้อมูลโปรไฟล์
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        if (id && id !== currentUser?._id) {
          // ถ้ามี ID และไม่ใช่ตัวเรา ให้ยิงไปดึงข้อมูลคนอื่นมา
          const response = await api.get(`/auth/users/${id}`); // 🚨 ยิงไป API ที่เราเพิ่งสร้าง
          setProfileUser(response.data);
        } else {
          // ถ้าไม่มี ID หรือเป็น ID เราเอง ก็โชว์ข้อมูลตัวเองไปเลย
          setProfileUser(currentUser);
        }
      } catch (error) {
        console.error("ดึงข้อมูลโปรไฟล์ไม่สำเร็จ", error);
        setProfileUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser]);

  if (isLoading) {
    return <div className="text-center font-bold py-20 uppercase animate-pulse">Loading Profile...</div>;
  }

  if (!profileUser) {
    return <div className="text-center text-red-500 font-bold py-20 uppercase">❌ USER NOT FOUND ❌</div>;
  }

  // ตัวแปรเช็คว่า "นี่คือหน้าเราเองใช่ไหม?" จะได้โชว์/ซ่อนปุ่ม Edit ได้ถูก
  const isMyProfile = currentUser && profileUser._id === currentUser._id;
  const displayTitle = profileUser.displayName || profileUser.username;

  return (
    <div className="max-w-3xl mx-auto font-sans pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-8 border-b-4 border-black">
        <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
          <Star size={32} className="text-yellow-500 fill-yellow-500" /> 
          Artist Profile
        </h1>
        {/* 🚨 ซ่อนปุ่ม Edit ถ้าเป็นโปรไฟล์คนอื่น */}
        {isMyProfile && (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold bg-white border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition uppercase active:translate-y-1 active:shadow-none"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card ด้านบน */}
      <div className="bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-black opacity-10 rotate-12 pointer-events-none"><Music size={200} /></div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white border-4 border-black rounded-full overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`} alt="Avatar" className="w-full h-full object-cover"/>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-2 text-black">
              {displayTitle}
            </h2>
            
            {profileUser.displayName && profileUser.displayName !== profileUser.username && (
              <p className="font-bold text-gray-800 mb-2">@{profileUser.username}</p>
            )}

            <div className="inline-block px-4 py-2 bg-black text-white text-lg font-black uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              {profileUser.majorInstrument || "NO INSTRUMENT SET"}
            </div>
            
            {profileUser.vibeTags && profileUser.vibeTags.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {profileUser.vibeTags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white border-2 border-black text-black text-xs font-bold uppercase rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* กล่อง About Me / Bio */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 flex flex-col h-full">
          <h3 className="text-xl font-black uppercase border-b-4 border-black pb-2 mb-4 flex items-center gap-2">
            <Activity size={24} /> Vibe / Bio
          </h3>
          <p className="text-gray-700 font-bold leading-relaxed whitespace-pre-wrap flex-grow">
            {profileUser.bio || "คนนี้ยังไม่ได้เขียนแนะนำตัว แต่อินเนอร์มาเต็มแน่นอน!"}
          </p>
          
          {(profileUser.youtubeUrl || profileUser.spotifyUrl) && (
            <div className="flex gap-4 mt-6 pt-4 border-t-2 border-dashed border-gray-300">
              {profileUser.youtubeUrl && (
                <a href={profileUser.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold bg-red-100 text-red-600 border-2 border-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition">
                  <Youtube size={18} /> YouTube
                </a>
              )}
              {profileUser.spotifyUrl && (
                <a href={profileUser.spotifyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold bg-green-100 text-green-700 border-2 border-green-600 px-3 py-2 rounded-lg hover:bg-green-200 transition">
                  <Headphones size={18} /> Spotify
                </a>
              )}
            </div>
          )}
        </div>

        {/* กล่อง Stats */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 h-full">
          <h3 className="text-xl font-black uppercase border-b-4 border-black pb-2 mb-4">
            Stats
          </h3>
          <ul className="space-y-4 font-bold uppercase text-sm">
            <li className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2">
              <span className="text-gray-500">Account Type</span>
              <span className="text-black bg-gray-200 px-2 py-1 rounded">{profileUser.role || 'USER'}</span>
            </li>
            <li className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2">
              <span className="text-gray-500">Joined Bands</span>
              <span className="text-black text-lg">0</span> {/* ของเดิมที่คุณใส่ไว้ */}
            </li>
          </ul>
        </div>

      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );
}