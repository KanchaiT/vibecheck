import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react'; // 👈 นำเข้าไอคอนเพิ่ม
import BandFinderBlock from '../components/BandFinderBlock';
import KnowledgeBlock from '../components/KnowledgeBlock';
import CreatePostModal from '../components/CreatePostModal';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function VibeHub() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ==========================================
  // State สำหรับระบบ Search & Filter
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL"); // ค่าเริ่มต้นคือแสดงทั้งหมด

  const currentUser = useAuthStore((state) => state.user);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
      setError(null);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบ: " + (err.response?.data?.message || err.message));
    }
  };

  // ==========================================
  // Function 1.1: ใช้ Array.filter() เพื่อกรองข้อมูล
  // ==========================================
  const filteredPosts = posts.filter((post) => {
    // 1. กรองด้วยคำค้นหา (หาจากชื่อวง หรือ ตำแหน่งที่ต้องการ)
    const matchSearch = 
      post.bandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.roleNeeded.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. กรองด้วยปุ่ม Filter (ALL, VOCALIST, GUITARIST, BASSIST, DRUMMER)
    const matchRole = filterRole === "ALL" || post.roleNeeded.toUpperCase().includes(filterRole);

    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-xl mx-auto font-sans pb-10">
      
      <div className="flex items-center justify-between pb-4 mb-8 border-b-4 border-black">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">VibeHub // Feed</h1>
        <div className="flex items-center gap-2 font-bold">
          <span className="text-sm bg-black text-white px-3 py-1 rounded-full border-2 border-black">LIVE</span>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-black uppercase">Band Finder</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-bold bg-yellow-400 border-2 border-black px-3 py-1 rounded-lg hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-none"
          >
            + CREATE POST
          </button>
        </div>

        {/* ========================================== */}
        {/* แถบเครื่องมือ Search & Filter */}
        {/* ========================================== */}
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 mb-6">
          {/* ช่องค้นหา */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อวง หรือตำแหน่งที่เปิดรับ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
            />
          </div>

          {/* ปุ่ม Filter หมวดหมู่ */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={18} className="text-black shrink-0" />
            {["ALL", "VOCAL", "GUITAR", "BASS", "DRUM"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black rounded-lg shrink-0 transition ${
                  filterRole === role 
                    ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(250,204,21,1)]" 
                    : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* แสดงผลข้อมูลที่ผ่านการกรอง (filteredPosts) */}
        {isLoading ? (
          <div className="text-center font-bold py-10 animate-pulse uppercase">Loading vibes... 🎸</div>
        ) : error ? (
          <div className="text-center font-bold text-red-500 py-10 border-4 border-red-500 rounded-xl bg-red-50">{error}</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center font-bold text-gray-500 py-10 border-4 border-dashed border-gray-400 rounded-xl">
            ไม่พบประกาศที่คุณค้นหา ลองเปลี่ยนคำค้นหาดูนะ!
          </div>
        ) : (
          filteredPosts.map((post) => (
            <BandFinderBlock 
              key={post._id}
              postId={post._id}
              role={post.roleNeeded} 
              bandName={post.bandName} 
              tags={post.tags} 
              author={post.user?.username}
              postOwnerId={post.user?._id}
              currentUser={currentUser}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      <div>
        <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Knowledge Hub</h2>
        <KnowledgeBlock 
          title="Guitar Tone Hacks: Pedal Chain Basics"
          views="1.5K"
          likes="320"
          comments="45"
          imageUrl="https://images.unsplash.com/photo-1512686151446-0697968afc7e?w=600&q=80"
        />
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPosts} 
      />

    </div>
  );
}