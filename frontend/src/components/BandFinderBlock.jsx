import React, { useState } from 'react';
import { Trash2, Edit, CheckCircle } from 'lucide-react'; 
import api from '../services/api'; // 🚨 นำเข้าตัวยิง API

// 🚨 เพิ่ม bandId เข้ามาในวงเล็บรับค่า (Props)
export default function BandFinderBlock({ postId, bandId, role, bandName, tags, author, postOwnerId, currentUser, onDelete, onEdit}) {
  
  const isOwner = currentUser?._id === postOwnerId;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;
  
  // State สำหรับจัดการปุ่มกดขอเข้าร่วม
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันกด "I'm Interested"
  const handleApply = async () => {
    if (!bandId) {
      alert("❌ ระบบขัดข้อง: ไม่พบ ID ของวงดนตรีนี้ (อาจเป็นโพสต์เก่าก่อนอัปเดตระบบ)");
      return;
    }
    
    setIsLoading(true);
    try {
      // ยิง API ไปที่เส้นทางที่เราสร้างไว้ใน bandController
      await api.post(`/bands/${bandId}/apply`);
      setIsApplied(true); // เปลี่ยนสถานะปุ่มเป็นกดแล้ว
      alert("✅ ส่งคำขอเข้าร่วมวงเรียบร้อยแล้ว รอลุ้นให้หัวหน้าวงกดรับนะ!");
    } catch (err) {
      alert("❌ เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 bg-gray-50 gap-4">
        <h3 className="text-sm font-black text-gray-500 uppercase shrink-0">Bandfinder Block</h3>
        
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-sm font-bold text-gray-400 truncate">
            POSTED BY: {author || "UNKNOWN"}
          </span>
          
          {canDelete && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="p-2 text-white transition bg-blue-500 border-2 border-black rounded-lg hover:bg-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none shrink-0" title="แก้ไขโพสต์">
                <Edit size={18} />
              </button>
              <button onClick={() => onDelete(postId)} className="p-2 text-white transition bg-red-500 border-2 border-black rounded-lg hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none shrink-0" title="ลบโพสต์นี้">
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-center gap-2 p-3 mb-4 text-xl font-black text-white uppercase bg-black rounded-xl">
          🚨 WANTED: {role}
        </div>
        
        <p className="mb-3 text-lg font-bold uppercase">Band: {bandName}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 text-xs font-bold text-gray-700 uppercase bg-gray-200 border-2 border-gray-400 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
        
        {/* ========================================== */}
        {/* ซ่อนปุ่ม I'm Interested ถ้าเป็นโพสต์ของตัวเอง */}
        {/* ========================================== */}
        {!isOwner && (
          <button 
            onClick={handleApply}
            disabled={isApplied || isLoading}
            className={`w-full py-3 text-lg font-black uppercase transition border-4 rounded-xl flex items-center justify-center gap-2 ${
              isApplied 
                ? 'bg-green-400 border-green-700 text-green-900 cursor-not-allowed opacity-80' // ปุ่มหลังกดแล้ว
                : 'bg-yellow-400 border-black hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none' // ปุ่มปกติ
            }`}
          >
            {isLoading ? "SENDING..." : isApplied ? <><CheckCircle size={24}/> REQUEST SENT!</> : "I'M INTERESTED"}
          </button>
        )}
      </div>
    </div>
  );
}