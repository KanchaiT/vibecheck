import React, { useState } from 'react';

// รับ props 2 ตัว: 
// 1. comment (ข้อมูลคอมเมนต์ 1 ก้อน รวมถึง replies ของมัน)
// 2. onAddReply (ฟังก์ชันที่ส่งมาจากตัวแม่ เพื่อใช้จัดการ State แบบ Deep Update)
export default function CommentItem({ comment, onAddReply }) {
  // State สำหรับเปิด/ปิดช่องกรอกข้อความ Reply
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  // ฟังก์ชันกดยืนยันการ Reply
  const handleReplySubmit = () => {
    if (!replyText.trim()) return;

    // สร้างก้อนคอมเมนต์ตอบกลับอันใหม่
    const newReply = {
      id: Date.now().toString(), // สร้าง ID ชั่วคราว (สำคัญมาก อาจารย์ถามในข้อ 7.5 ด้วย)
      text: replyText,
      author: 'Me', // หรือใช้ currentUser.username ถ้ามี
      replies: []   // เตรียม Array ว่างไว้เผื่อมีคนมาตอบกลับ Reply นี้อีกที
    };

    // ส่ง id ของตัวแม่ และก้อนข้อความใหม่ ไปให้ฟังก์ชันหลัก (ลอจิก C2) ทำงาน
    const parentId = comment._id || comment.id; 
    onAddReply(parentId, newReply);

    // เคลียร์ฟอร์มและปิดกล่อง
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="mt-3">
      {/* 1. กล่องโชว์เนื้อหาคอมเมนต์ปัจจุบัน */}
      <div className="p-3 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-sm font-black text-yellow-600 uppercase">
          {comment.user?.displayName || comment.user?.username || comment.author || "Unknown"}
        </p>
        <p className="font-bold text-gray-700">{comment.text}</p>

        {/* ปุ่มกดเปิดช่อง Reply */}
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="mt-2 text-xs font-black text-yellow-600 hover:text-black uppercase transition active:translate-y-1"
        >
          {isReplying ? 'Cancel' : 'Reply'}
        </button>
      </div>

      {/* 2. ช่องพิมพ์ตอบกลับ (จะโชว์ก็ต่อเมื่อกดปุ่ม Reply) */}
      {isReplying && (
        <div className="mt-2 flex gap-2 pl-4 ml-2 border-l-4 border-black">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 px-3 py-2 text-sm font-bold bg-gray-100 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleReplySubmit}
            className="px-4 py-2 text-sm font-black bg-yellow-400 border-2 border-black rounded-md hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            SEND
          </button>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚨 3. หัวใจสำคัญ: RECURSIVE RENDERING (Checklist C1) */}
      {/* ========================================== */}
      {comment.replies && comment.replies.length > 0 && (
        // ใส่ ml-8 และ border-l-2 เพื่อให้มัน "เยื้องขวา" เข้าไปเรื่อยๆ (Depth Test)
        <div className="ml-8 pl-4 border-l-2 border-gray-300 border-dashed mt-2">
          {comment.replies.map((reply) => (
            // 🚨 การเรียกตัวเองซ้ำ (Recursive)
            // 🚨 ต้องใส่ key={reply.id} เสมอ (อาจารย์จะถามในคำถามท้าย Checklist!)
            <CommentItem
              key={reply.id} 
              comment={reply}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}