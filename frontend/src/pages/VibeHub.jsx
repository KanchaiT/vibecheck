import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // 👈 นำเข้าตัวจัดการ URL
import { useTheme } from '../context/ThemeContext';
import BandFinderBlock from '../components/BandFinderBlock';
import KnowledgeBlock from '../components/KnowledgeBlock';
import CreatePostModal from '../components/CreatePostModal';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useSearchStore } from '../store/searchStore'; // 👈 นำเข้า Zustand Store สำหรับ Search
import BulkMediaUploader from '../components/BulkMediaUploader'; // 👈 นำเข้าไฟล์ที่เราเพิ่งสร้าง

export default function VibeHub() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  // ✅ แบบใหม่: ดึงแค่ Search มาจาก Zustand
  const { searchQuery, setSearchQuery } = useSearchStore();

// 🚨 เพิ่มชุดโค้ดสำหรับ URL Search Params
  const [searchParams, setSearchParams] = useSearchParams();
// อ่านค่าจาก URL (ถ้าไม่มีให้เป็น 'ALL')
  const activeFilter = searchParams.get('filter') || 'ALL';

// ฟังก์ชันสำหรับเปลี่ยน Filter บน URL
  const handleFilterChange = (e) => {
    const newValue = e.target.value;
    if (newValue === 'ALL') {
      searchParams.delete('filter'); // ถ้าเลือก ALL ให้ลบ param ออกให้ URL สะอาด
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filter: newValue }); // ถ้าเลือกอันอื่น ให้ใส่ ?filter=...
    }
  };

  const currentUser = useAuthStore((state) => state.user);
  console.log("ข้อมูลตัวฉันตอนนี้:", currentUser);
  const { config } = useTheme();

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
  // 🚨 1. ระบบกรองข้อมูล (Search & Filter) ต้องทำก่อน!
  // ==========================================
  const filteredPosts = posts.filter(post => {
    // กรองด้วยคำค้นหา (ถ้า searchQuery เป็น undefined ให้มองเป็น String ว่างๆ แทน)
    const searchLower = (searchQuery || '').toLowerCase();
    const matchSearch = 
      (post.title && post.title.toLowerCase().includes(searchLower)) ||
      (post.bandName && post.bandName.toLowerCase().includes(searchLower)) ||
      (post.roleNeeded && post.roleNeeded.toLowerCase().includes(searchLower)) ||
      (post.content && post.content.toLowerCase().includes(searchLower)) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      
    // กรองด้วยประเภท (Tab Dropdown)
    const matchType = 
      activeFilter === "ALL" ? true :
      activeFilter === "BAND" ? (post.postType === 'BandFinder' || !post.postType) :
      activeFilter === "KNOWLEDGE" ? post.postType === 'Knowledge' : true;

    return matchSearch && matchType;
  });

  // ==========================================
  // 🚨 2. ค่อยเอาของที่กรองแล้ว (filteredPosts) มาแยกกอง!
  // ==========================================
  const bandPosts = filteredPosts.filter(post => post.postType === 'BandFinder' || !post.postType);
  const knowledgePosts = filteredPosts.filter(post => post.postType === 'Knowledge');
 
  return (
    <div className="max-w-xl mx-auto font-sans pb-10">
      
      {/* Header ของหน้า VibeHub */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b-4 border-black">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">VibeHub // Feed</h1>
      </div>

    {/* ========================================== */}
    {/* 🚨 เอา BulkMediaUploader มาวางตรงนี้เลยครับ! */}
    {/* ========================================== */}
    <BulkMediaUploader />

      {/* ========================================== */}
      {/* 🚨 3. แถบ Search & Filter */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="ค้นหาชื่อวง, หัวข้อ, หรือ #Tags..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 border-4 border-black rounded-xl font-bold focus:ring-4 focus:ring-yellow-400 outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition"
        />
        
        <select 
          value={activeFilter}
          onChange={handleFilterChange} // 👈 เปลี่ยนมาเรียกใช้ฟังก์ชันนี้แทน
          className={`px-4 py-3 border-4 border-black rounded-xl font-black uppercase focus:ring-4 focus:ring-yellow-400 outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition ${
            config.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
          }`}
        >
          <option value="ALL">All Vibes</option>
          <option value="BAND">Band Finder 🎸</option>
          <option value="KNOWLEDGE">Knowledge 📚</option>
        </select>
      </div>

      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-sm font-bold bg-yellow-400 border-2 border-black px-4 py-2 rounded-lg hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-y-1 active:shadow-none"
        >
          + CREATE POST
        </button>
      </div>

      {isLoading ? (
        <div className="text-center font-bold py-10 animate-pulse uppercase">Loading vibes... 🎸</div>
      ) : error ? (
        <div className="text-center font-bold text-red-500 py-10 border-4 border-red-500 rounded-xl bg-red-50">{error}</div>
      ) : (
        <>
          {/* ========================================== */}
          {/* ส่วนแสดงประกาศหาเพื่อนร่วมวง (BandFinder) */}
          {/* ========================================== */}
          {(activeFilter === "ALL" || activeFilter === "BAND") && (
            <div className="mb-10 animate-in fade-in duration-300">
              <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Band Finder</h2>
              
              {bandPosts.length === 0 ? (
                <div className="text-center font-bold text-gray-500 py-8 border-4 border-dashed border-gray-400 rounded-xl">ยังไม่มีประกาศหาเพื่อนร่วมวงในตอนนี้</div>
              ) : (
                bandPosts.map((post) => (
                <BandFinderBlock 
                  key={post._id}
                  postId={post._id} 
                  bandId={post.bandId || post.band}
                  role={post.roleNeeded} 
                  bandName={post.bandName} 
                  tags={post.tags} 
                  author={post.user?.username}
                  postOwnerId={post.user?._id} 
                  currentUser={currentUser} 
                  onDelete={handleDeletePost}
                  initialLikes={post.likes || []}
                  initialComments={post.comments || []}
                  onEdit={() => {        
                    setEditingPost(post);
                    setIsModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        )} {/* 👈 ตรงนี้สำคัญมาก! วงเล็บปิดของเงื่อนไข BAND */}
          {/* ========================================== */}
          {/* ส่วน Knowledge Hub (ดึงข้อมูลจริงมาโชว์แล้ว!) */}
          {/* ========================================== */}
          {(activeFilter === "ALL" || activeFilter === "KNOWLEDGE") && (
            <div className="mb-10 animate-in fade-in duration-300">
              <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Knowledge Hub</h2>
              
              {knowledgePosts.length === 0 ? (
                <div className="text-center font-bold text-gray-500 py-8 border-4 border-dashed border-gray-400 rounded-xl">ยังไม่มีโพสต์แชร์ความรู้ มาแชร์เทคนิคของคุณคนแรกสิ!</div>
              ) : (
                knowledgePosts.map((post) => (
                <KnowledgeBlock 
                  key={post._id}
                  postId={post._id}
                  title={post.title}
                  content={post.content}
                  mediaUrl={post.mediaUrl}
                  mediaType={post.mediaType}
                  tags={post.tags}
                  author={post.user?.username}
                  postOwnerId={post.user?._id}
                  currentUser={currentUser}
                  onDelete={handleDeletePost}
                  onEdit={() => {
                    setEditingPost(post);
                    setIsModalOpen(true);
                  }}
                  // 🚨 เช็ค 2 บรรทัดนี้! ต้องมีคำว่า || [] เพื่อกันเหนียวด้วยครับ
                  initialLikes={post.likes || []}       
                  initialComments={post.comments || []} 
                />
              ))
            )}
          </div>
          )} {/* 👈 และตรงนี้ วงเล็บปิดของเงื่อนไข KNOWLEDGE */}
        </>
      )}

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => { 
          setIsModalOpen(false); 
          setEditingPost(null); // ปิดแล้วต้องเคลียร์ค่าด้วย
        }} 
        onSuccess={fetchPosts} 
        editData={editingPost} // 👈 ส่งข้อมูลไปให้ Modal
      />

    </div>
  );
}