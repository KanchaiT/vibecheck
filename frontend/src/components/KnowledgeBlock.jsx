import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Heart, MessageCircle, Send } from 'lucide-react';
import api from '../services/api';
import CommentItem from './CommentItem'; // 🚨 1. นำเข้า CommentItem (Recursive Component)

export default function KnowledgeBlock({ postId, title, content, mediaUrl, mediaType, tags, author, postOwnerId, currentUser, onDelete, onEdit, initialLikes = [], initialComments = [] }) {
  
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (initialLikes) setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    // แปลงโครงสร้างคอมเมนต์ที่ได้จากหลังบ้านให้แน่ใจว่ามีฟิลด์ replies (เผื่อไว้)
    const formattedComments = initialComments.map(c => ({ ...c, replies: c.replies || [] }));
    setComments(formattedComments);
  }, [initialComments]);

  const isOwner = currentUser?._id === postOwnerId;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;
  
  const isLiked = likes.includes(currentUser?._id);

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${postId}/like`);
      setLikes(res.data); 
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // ฟังก์ชันส่งคอมเมนต์ (ตัวแม่สุด)
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text: commentText });
      // รับค่าคอมเมนต์ใหม่มา แล้วเติมฟิลด์ replies เข้าไปเผื่อมีการตอบกลับ
      const updatedComments = res.data.map(c => ({ ...c, replies: c.replies || [] }));
      setComments(updatedComments);
      setCommentText(""); 
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // ==========================================
  // 🚨 2. ลอจิก Deep Update สำหรับการตอบกลับคอมเมนต์ (Checklist C2)
  // ==========================================
  const handleAddReply = (parentId, newReply) => {
    const updateComments = (currentComments) => {
      return currentComments.map((comment) => {
        const currentId = comment._id || comment.id;

        // 🚨 3. แก้ตรงนี้! ใส่ String() ครอบไว้ เพื่อบังคับให้มันเทียบตัวอักษรกันชัวร์ๆ
        if (String(currentId) === String(parentId)) {
          return { 
            ...comment, 
            replies: [...(comment.replies || []), newReply] 
          };
        } 
        
        if (comment.replies && comment.replies.length > 0) {
          return { 
            ...comment, 
            replies: updateComments(comment.replies) 
          };
        }
        return comment;
      });
    };
    setComments(updateComments(comments));
  };

  return (
    <div className="relative mb-8 overflow-hidden bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 border-b-2 border-gray-200">
        <h3 className="shrink-0 text-sm font-black text-gray-500 uppercase">Knowledge Base</h3>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="truncate text-sm font-bold text-gray-400">SHARED BY: {author || "UNKNOWN"}</span>
          {canDelete && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="shrink-0 p-2 text-white transition bg-blue-500 border-2 border-black rounded-lg hover:bg-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"><Edit size={18} /></button>
              <button onClick={() => onDelete(postId)} className="shrink-0 p-2 text-white transition bg-red-500 border-2 border-black rounded-lg hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"><Trash2 size={18} /></button>
            </div>
          )}
        </div>
      </div>
      
      {mediaUrl && mediaType === 'video' && (
        <div className="w-full bg-black border-b-4 border-black">
          <video controls className="object-contain w-full max-h-96">
            <source src={mediaUrl} type="video/mp4" />
          </video>
        </div>
      )}

      {mediaUrl && mediaType === 'image' && (
        <div className="w-full h-64 border-b-4 border-black">
          <img src={mediaUrl} alt={title} className="object-cover w-full h-full" />
        </div>
      )}

      <div className="p-5">
        <h2 className="mb-3 text-2xl font-black text-black uppercase">{title}</h2>
        <p className="mb-6 font-bold text-gray-700 whitespace-pre-wrap">{content}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 text-xs font-bold text-gray-700 uppercase bg-yellow-200 border-2 border-yellow-500 rounded-md">#{tag}</span>
          ))}
        </div>

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
        {/* พื้นที่แสดงคอมเมนต์ */}
        {/* ========================================== */}
        {showComments && (
          <div className="pt-4 mt-4 border-t-2 border-gray-300 border-dashed animate-in slide-in-from-top-2">
            
            {/* 🚨 3. ส่งข้อมูลคอมเมนต์ให้ Component ลูกที่เรียกตัวเองซ้ำได้ (Checklist C1) */}
            <div className="pr-2 mb-4 overflow-y-auto space-y-4 max-h-96">
              {comments.length === 0 ? (
                <p className="text-sm font-bold text-center text-gray-400">ยังไม่มีคอมเมนต์ เป็นคนแรกเลยสิ!</p>
              ) : (
                comments.map((comment) => (
                  <CommentItem 
                    key={comment._id || comment.id} // ดักจับทั้ง id จาก DB และ id ชั่วคราว
                    comment={comment}
                    onAddReply={handleAddReply} // ส่งฟังก์ชัน Deep Update ไปให้ตัวลูก
                  />
                ))
              )}
            </div>

            {/* ช่องพิมพ์คอมเมนต์ระดับบนสุด (Root) */}
            <form onSubmit={handleCommentSubmit} className="relative flex gap-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="เขียนความเห็น..." 
                className="flex-1 px-4 py-2 font-bold border-2 border-black outline-none rounded-xl focus:ring-4 focus:ring-yellow-400"
              />
              <button type="submit" disabled={!commentText.trim()} className="px-4 py-2 font-black text-white uppercase transition bg-black border-2 border-black rounded-xl hover:bg-gray-800 active:translate-y-1 disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}