import React from 'react';
import { Eye, Heart, MessageSquare, PlayCircle } from 'lucide-react';

export default function KnowledgeBlock({ title, views, likes, comments, imageUrl }) {
  return (
    <div className="mb-8 overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
      <div className="p-4 border-b-2 border-gray-200 bg-gray-50">
        <h3 className="text-sm font-black text-gray-500 uppercase">Knowledge Block</h3>
      </div>
      
      <div className="p-5">
        {/* ภาพปกวิดีโอ */}
        <div className="relative flex items-center justify-center overflow-hidden bg-gray-200 border-4 border-black cursor-pointer aspect-video rounded-xl group mb-5">
          <img 
            src={imageUrl} 
            alt={title} 
            className="block w-full h-full object-cover grayscale group-hover:scale-105 transition duration-300" 
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <PlayCircle size={64} className="text-white drop-shadow-lg opacity-90 group-hover:opacity-100 transition" />
          </div>
        </div>
        
        {/* หัวข้อ */}
        <h4 className="mb-5 text-xl font-black leading-tight uppercase">{title}</h4>
        
        {/* สถิติ (ยอดวิว, ไลค์, คอมเมนต์) */}
        <div className="flex items-center justify-between pt-4 border-t-4 border-black">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 font-black text-lg"><Eye size={20}/> {views}</div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Views</span>
          </div>
          <div className="w-1 h-8 bg-black rounded-full"></div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 font-black text-lg"><Heart size={20}/> {likes}</div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Likes</span>
          </div>
          <div className="w-1 h-8 bg-black rounded-full"></div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 font-black text-lg"><MessageSquare size={20}/> {comments}</div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}