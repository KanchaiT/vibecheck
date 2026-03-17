// frontend/src/pages/MusicLibrary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function MusicLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    // 1. ลองดึงข้อมูลจาก Cache (Session Storage) ก่อน จะได้ไม่ต้องโหลด API ใหม่เวลาย้อนกลับมา
    const cachedBooks = sessionStorage.getItem('vibecheck_library');

    if (cachedBooks) {
      let parsedBooks = JSON.parse(cachedBooks);
      
      // ==========================================
      // 🎯 C3: ถ้ามีการกด Favorite ส่งกลับมาจากหน้า Detail
      // ==========================================
      if (location.state?.favId) {
        parsedBooks = parsedBooks.map(book => 
          book.id === location.state.favId 
            ? { ...book, isFavorite: location.state.isFavorite } 
            : book
        );
        
        // เซฟข้อมูลที่อัปเดต Favorite แล้วกลับลงไปใน Cache
        sessionStorage.setItem('vibecheck_library', JSON.stringify(parsedBooks));
        
        // เคลียร์ state จาก URL ทิ้ง ป้องกันการอัปเดตซ้ำเวลากด F5
        window.history.replaceState({}, document.title);
      }
      
      setBooks(parsedBooks);
      setLoading(false);
      
    } else {
      // 2. ถ้าไม่มี Cache (เปิดหน้าเว็บครั้งแรก) ถึงจะยอมให้ยิง API 
      axios.get('https://openlibrary.org/search.json?q=music+theory&limit=10')
        .then(res => {
          const formatted = res.data.docs.map(doc => ({
            id: doc.key, 
            title: doc.title,
            author: doc.author_name ? doc.author_name[0] : 'Unknown',
            isFavorite: false
          }));
          
          setBooks(formatted);
          // โหลดเสร็จปุ๊บ เซฟเก็บไว้ใน Session Storage ทันที
          sessionStorage.setItem('vibecheck_library', JSON.stringify(formatted));
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false)); 
    }
  }, [location.state]); // ทำงานใหม่ทุกครั้งที่มี state ส่งมาจากหน้า Detail

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-2">VibeCheck <span className="text-blue-500">Library</span> 📚</h1>
        <p className="text-gray-400 mb-8">คลังความรู้ทฤษฎีดนตรี (Open Library API)</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">กำลังค้นหาคลังความรู้...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map(book => (
              <div 
                key={book.id} 
                onClick={() => navigate('/library/detail', { state: { book } })} 
                className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-100 mb-2">
                  {book.title} {book.isFavorite && <span className="text-red-500 ml-2 animate-pulse">❤️ (Favorite)</span>}
                </h3>
                <p className="text-sm text-gray-400">ผู้แต่ง: {book.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}