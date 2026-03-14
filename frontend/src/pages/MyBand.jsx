import React, { useState, useEffect } from 'react';
import { Users, Music, Phone, Instagram, LogOut, Plus, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function MyBand() {
  const [band, setBand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State สำหรับฟอร์มสร้างวงใหม่
  const [isCreating, setIsCreating] = useState(false);
  const [newBandName, setNewBandName] = useState("");
  const [newBandGenres, setNewBandGenres] = useState("");

  const currentUser = useAuthStore((state) => state.user);

  // ดึงข้อมูลวงของเรา
  const fetchMyBand = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/bands/myband');
      setBand(response.data); // ถ้าไม่มีวง จะได้ค่า null
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลวงได้");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBand();
  }, []);

  // ฟังก์ชันสร้างวงดนตรี
  const handleCreateBand = async (e) => {
    e.preventDefault();
    try {
      const genresArray = newBandGenres.split(',').map(g => g.trim()).filter(g => g !== "");
      await api.post('/bands', {
        name: newBandName,
        genres: genresArray,
        role: currentUser.majorInstrument || "Founder"
      });
      setIsCreating(false);
      fetchMyBand(); // โหลดข้อมูลใหม่หลังจากสร้างเสร็จ
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  };

  // ฟังก์ชันออกจากวง
  const handleLeaveBand = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากวงนี้? ความทรงจำดีๆ จะหายไปนะ! 😢")) return;
    try {
      await api.put('/bands/leave');
      setBand(null); // เคลียร์หน้าจอให้กลับไปเป็นสถานะไม่มีวง
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) {
    return <div className="text-center font-bold py-20 uppercase animate-pulse">Loading Band Data... 🥁</div>;
  }

  return (
    <div className="max-w-3xl mx-auto font-sans pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-8 border-b-4 border-black">
        <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
          <Users size={32} className="text-black" /> 
          My Band
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-4 border-red-500 rounded-xl font-bold flex items-center gap-2">
          <AlertCircle className="text-red-500" /> {error}
        </div>
      )}

      {/* ========================================== */}
      {/* กรณีที่ยังไม่มีวงดนตรี */}
      {/* ========================================== */}
      {!band && !error ? (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black uppercase mb-4">You don't have a band yet</h2>
          <p className="text-gray-600 font-bold mb-8">คุณยังไม่ได้สังกัดวงดนตรีใดๆ ลองไปหาเพื่อนร่วมวงที่ VibeHub หรือสร้างวงของคุณเองเลย!</p>
          
          {!isCreating ? (
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center gap-2 w-full md:w-auto mx-auto px-6 py-3 text-lg font-black uppercase transition bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              <Plus size={24} /> Create New Band
            </button>
          ) : (
            <form onSubmit={handleCreateBand} className="text-left bg-gray-50 border-4 border-black rounded-xl p-6 mt-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black uppercase mb-4 text-yellow-500">Create Your Band</h3>
              <div className="mb-4">
                <label className="block text-sm font-black uppercase mb-1">Band Name</label>
                <input required value={newBandName} onChange={(e) => setNewBandName(e.target.value)} placeholder="e.g. THE STATIC NOISE" className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-black uppercase mb-1">Genres (Comma separated)</label>
                <input value={newBandGenres} onChange={(e) => setNewBandGenres(e.target.value)} placeholder="e.g. J-Rock, Alt-Rock, Metal" className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg focus:ring-4 focus:ring-yellow-400 font-bold" />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 font-black uppercase border-2 border-black rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 font-black uppercase bg-black text-white border-2 border-black rounded-lg hover:bg-gray-800 transition">Establish Band</button>
              </div>
            </form>
          )}
        </div>
      ) : band ? (
        
/* ========================================== */
        /* กรณีที่มีวงดนตรีแล้ว โชว์ข้อมูลวงจัดเต็ม! */
        /* ========================================== */
        <div>
          {/* Card ข้อมูลวง */}
          <div className="bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-white opacity-10 rotate-12 pointer-events-none">
              <Music size={200} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4 text-yellow-400">
                {band.name}
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {band.genres?.map((genre, index) => (
                  <span key={index} className="px-3 py-1 text-xs font-bold text-black uppercase bg-white border-2 border-transparent rounded-md">
                    #{genre}
                  </span>
                ))}
              </div>

              <div className="flex gap-6 mt-6 pt-6 border-t-2 border-gray-800">
                <div className="flex items-center gap-2 font-bold"><Instagram size={20} className="text-pink-500" /> {band.contact?.ig || "N/A"}</div>
                <div className="flex items-center gap-2 font-bold"><Phone size={20} className="text-green-500" /> {band.contact?.phone || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* รายชื่อสมาชิก */}
          <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2 flex items-center justify-between">
            Band Members ({band.members.length})
            
            {/* ปุ่มออกจากวง */}
            <button 
              onClick={handleLeaveBand}
              className="flex items-center gap-2 text-sm font-bold bg-red-500 text-white border-2 border-black px-3 py-1 rounded-lg hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition uppercase active:translate-y-1 active:shadow-none"
            >
              <LogOut size={16} /> Leave Band
            </button>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {band.members.map((member, index) => (
              <div key={index} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 border-2 border-black rounded-full overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.username}`} alt="Member Avatar" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className="font-black uppercase text-lg">
                    {member.user?.displayName || member.user?.username || "Unknown User"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500 uppercase">{member.role}</span>
                    {member.isLeader && <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded font-black border border-black uppercase">Leader</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : null} 
      {/* 👆 สังเกตตรงบรรทัดนี้ครับ เติม : null เข้าไป */}
      
    </div>
  );
}