import React from 'react';
import { Trash2 } from 'lucide-react';

export default function KnowledgeBlock({ postId, title, content, mediaUrl, mediaType, tags, author, postOwnerId, currentUser, onDelete }) {
  const isOwner = currentUser?._id === postOwnerId;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  return (
    <div className="mb-8 overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl relative">
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 bg-gray-50 gap-4">
        <h3 className="text-sm font-black text-gray-500 uppercase shrink-0">Knowledge Base</h3>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-sm font-bold text-gray-400 truncate">SHARED BY: {author || "UNKNOWN"}</span>
          {canDelete && (
            <button onClick={() => onDelete(postId)} className="p-2 text-white transition bg-red-500 border-2 border-black rounded-lg hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none shrink-0" title="ลบโพสต์นี้">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      
      {/* ========================================== */}
      {/* ส่วนที่แก้ใหม่: แยกโชว์รูปภาพ กับ โชว์วิดีโอ */}
      {/* ========================================== */}
      
      {/* 1. ถ้าเป็นวิดีโอ ให้โชว์ Video Player */}
      {mediaUrl && mediaType === 'video' && (
        <div className="w-full border-b-4 border-black bg-black">
          <video controls className="w-full max-h-96 object-contain">
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* 2. ถ้าเป็นรูปภาพ ให้โชว์ Image ตามปกติ */}
      {mediaUrl && mediaType === 'image' && (
        <div className="w-full h-64 border-b-4 border-black">
          <img src={mediaUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* ========================================== */}

      <div className="p-5">
        <h2 className="mb-3 text-2xl font-black uppercase text-black">{title}</h2>
        <p className="mb-6 font-bold text-gray-700 whitespace-pre-wrap">{content}</p>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 text-xs font-bold text-gray-700 uppercase bg-yellow-200 border-2 border-yellow-500 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}