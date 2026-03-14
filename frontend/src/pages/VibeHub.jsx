import React, { useState, useEffect } from 'react';
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
  const [editingPost, setEditingPost] = useState(null);

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
  // ใช้ Array.filter() เพื่อแยกประเภทโพสต์
  // ==========================================
  // 1. โพสต์หาเพื่อนร่วมวง (ถ้าไม่มี postType ให้ถือว่าเป็น BandFinder ไว้ก่อนเพื่อรองรับข้อมูลเก่า)
  const bandPosts = posts.filter(post => post.postType === 'BandFinder' || !post.postType);
  
  // 2. โพสต์แชร์ความรู้
  const knowledgePosts = posts.filter(post => post.postType === 'Knowledge');

  return (
    <div className="max-w-xl mx-auto font-sans pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-8 border-b-4 border-black">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest">VibeHub // Feed</h1>
        <div className="flex items-center gap-2 font-bold cursor-pointer">
          <div className="flex items-center p-1 bg-black rounded-full w-14 h-7">
            <div className="w-5 h-5 bg-white rounded-full shadow-sm transform translate-x-7"></div>
          </div>
          <span className="text-sm">ALL</span>
        </div>
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
          <div className="mb-10">
            <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Band Finder</h2>
            
            {bandPosts.length === 0 ? (
              <div className="text-center font-bold text-gray-500 py-8 border-4 border-dashed border-gray-400 rounded-xl">ยังไม่มีประกาศหาเพื่อนร่วมวงในตอนนี้</div>
            ) : (
              bandPosts.map((post) => (
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

          {/* ========================================== */}
          {/* ส่วน Knowledge Hub (ดึงข้อมูลจริงมาโชว์แล้ว!) */}
          {/* ========================================== */}
          <div className="mb-10">
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
                  mediaUrl={post.mediaUrl}   // ✅ เปลี่ยนเป็นสื่อแบบใหม่
                  mediaType={post.mediaType} // ✅ ส่งประเภทไปด้วย (image/video)
                  tags={post.tags}
                  author={post.user?.username}
                  postOwnerId={post.user?._id}
                  currentUser={currentUser}
                  onDelete={handleDeletePost}
                  onEdit={() => {
                    setEditingPost(post);
                    setIsModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
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