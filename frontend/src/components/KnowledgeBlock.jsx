import React, { useState } from 'react';
import { Trash2, Edit, Heart, MessageCircle, Send } from 'lucide-react';
import api from '../services/api';

// 👈 รับ props initialLikes และ initialComments เพิ่มมา
export default function KnowledgeBlock({ postId, title, content, mediaUrl, mediaType, tags, author, postOwnerId, currentUser, onDelete, onEdit, initialLikes = [], initialComments = [] }) {
  
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isOwner = currentUser?._id === postOwnerId;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;
  
  // เช็คว่าเรากดไลก์โพสต์นี้ไปหรือยัง (เพื่อระบายสีหัวใจ)
  const isLiked = likes.includes(currentUser?._id);

  // ฟังก์ชันกด Like
  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${postId}/like`);
      setLikes(res.data); // อัปเดตยอดไลก์ใหม่จาก Backend
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // ฟังก์ชันส่งคอมเมนต์
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text: commentText });
      setComments(res.data); // อัปเดตลิสต์คอมเมนต์ใหม่
      setCommentText(""); // ล้างช่องพิมพ์
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  return (
    <div className="mb-8 overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl relative">
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 bg-gray-50 gap-4">
        <h3 className="text-sm font-black text-gray-500 uppercase shrink-0">Knowledge Base</h3>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-sm font-bold text-gray-400 truncate">SHARED BY: {author || "UNKNOWN"}</span>
          {canDelete && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="p-2 text-white transition bg-blue-500 border-2 border-black rounded-lg hover:bg-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none shrink-0"><Edit size={18} /></button>
              <button onClick={() => onDelete(postId)} className="p-2 text-white transition bg-red-500 border-2 border-black rounded-lg hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none shrink-0"><Trash2 size={18} /></button>
            </div>
          )}
        </div>
      </div>
      
      {mediaUrl && mediaType === 'video' && (
        <div className="w-full border-b-4 border-black bg-black">
          <video controls className="w-full max-h-96 object-contain">
            <source src={mediaUrl} type="video/mp4" />
          </video>
        </div>
      )}

      {mediaUrl && mediaType === 'image' && (
        <div className="w-full h-64 border-b-4 border-black">
          <img src={mediaUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5">
        <h2 className="mb-3 text-2xl font-black uppercase text-black">{title}</h2>
        <p className="mb-6 font-bold text-gray-700 whitespace-pre-wrap">{content}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 text-xs font-bold text-gray-700 uppercase bg-yellow-200 border-2 border-yellow-500 rounded-md">#{tag}</span>
          ))}
        </div>

        {/* ========================================== */}
        {/* แถบ Like & Comment */}
        {/* ========================================== */}
        <div className="flex items-center gap-6 pt-4 border-t-2 border-gray-200">
          <button onClick={handleLike} className="flex items-center gap-2 font-black transition hover:scale-105 active:scale-95">
            <Heart size={24} className={isLiked ? "fill-red-500 text-red-500" : "text-black"} />
            <span>{likes.length} LIKES</span>
          </button>
          
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 font-black transition hover:scale-105 active:scale-95">
            <MessageCircle size={24} className={showComments ? "fill-black text-black" : "text-black"} />
            <span>{comments.length} COMMENTS</span>
          </button>
        </div>

        {/* ========================================== */}
        {/* พื้นที่แสดงคอมเมนต์ (โชว์เมื่อกดปุ่ม) */}
        {/* ========================================== */}
        {showComments && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300 animate-in slide-in-from-top-2">
            
            {/* รายการคอมเมนต์ */}
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-sm font-bold text-gray-400 text-center">ยังไม่มีคอมเมนต์ เป็นคนแรกเลยสิ!</p>
              ) : (
                comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-100 p-3 rounded-xl border-2 border-black relative">
                    <span className="font-black text-sm uppercase text-yellow-600 block mb-1">
                      {comment.user?.displayName || comment.user?.username || "Unknown"}
                    </span>
                    <p className="font-bold text-gray-800 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* ช่องพิมพ์คอมเมนต์ */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 relative">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="เขียนความเห็น..." 
                className="flex-1 px-4 py-2 border-2 border-black rounded-xl font-bold focus:ring-4 focus:ring-yellow-400 outline-none"
              />
              <button type="submit" disabled={!commentText.trim()} className="bg-black text-white px-4 py-2 rounded-xl border-2 border-black font-black uppercase hover:bg-gray-800 active:translate-y-1 disabled:opacity-50 transition">
                <Send size={18} />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}