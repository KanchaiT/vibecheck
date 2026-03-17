// frontend/src/pages/BookDetail.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

export default function BookDetail() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🎯 C2: รับค่าข้อมูลหนังสือที่ส่งมาจากหน้า Home [cite: 390-393]
  const book = location.state?.book;

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(book?.isFavorite || false);

  // 🎯 C1 & C4: Lazy Loading Description [cite: 375, 385-389, 406-409]
  useEffect(() => {
    if (!book) return;

    // ยิง API เพิ่มเติมด้วย work_id เพื่อดึงรายละเอียด
    axios.get(`https://openlibrary.org${book.id}.json`)
      .then(res => {
        const desc = res.data.description;
        // จัดการ Format ที่ OpenLibrary ชอบส่งมาไม่เหมือนกัน
        if (typeof desc === 'string') {
          setDescription(desc);
        } else if (desc && desc.value) {
          setDescription(desc.value);
        } else {
          setDescription('ไม่มีคำอธิบายเพิ่มเติมสำหรับหนังสือเล่มนี้ (No description available)');
        }
      })
      .catch(() => setDescription('ไม่สามารถโหลดข้อมูลรายละเอียดได้ (API Error)'))
      .finally(() => setLoading(false)); // C4: ปิดตัวโหลด [cite: 409]
  }, [book]);

  // ดักกรณีเข้า URL นี้ตรงๆ โดยไม่ผ่านหน้า Home
  if (!book) return <Navigate to="/library" />;

  // 🎯 ฟังก์ชันทีเด็ด: กดย้อนกลับพร้อมแนบ State (Favorite) ไปบอกหน้า Home [cite: 415-418]
  const handleBack = () => {
    navigate('/library', { 
      state: { favId: book.id, isFavorite } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 font-sans text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">{book.title}</h1>
          <p className="text-lg text-blue-400 mb-6">เขียนโดย: {book.author}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors ${
                isFavorite ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isFavorite ? '❤️ ยกเลิกรายการโปรด' : '🤍 เพิ่มลงรายการโปรด'}
            </button>
            
            {/* 🚨 ปุ่มย้อนกลับที่แนบ Params [cite: 415-418] */}
            <button 
              onClick={handleBack}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
            >
              🔙 กลับไปคลังหนังสือ
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 min-h-[250px]">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-4">
            รายละเอียดหนังสือ (Lazy Loaded)
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {description}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}