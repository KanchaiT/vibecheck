import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

export default function StartPage() {
  return (
    // 🚨 เพิ่ม padding ด้านนอก (p-6) ให้จอมือถือมีพื้นที่หายใจ
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans p-6 md:p-8">
      
      {/* Container หลัก */}
      {/* 🚨 ลด padding ด้านในเหลือ p-8 (มือถือ) และย่อขนาดเงาในมือถือลงเพื่อไม่ให้เบียดขอบจอ */}
      <div className="w-full max-w-[90%] md:max-w-2xl bg-white border-4 border-black rounded-3xl md:rounded-[2rem] p-8 md:p-16 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-2 md:mb-0">
        
        {/* ไอคอนและโลโก้ */}
        <div className="flex justify-center mb-6">
          <div className="p-3 md:p-4 bg-yellow-400 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Music className="text-black w-10 h-10 md:w-12 md:h-12" />
          </div>
        </div>
        
        {/* 🚨 ลดขนาดตัวอักษรหัวข้อเหลือ 4xl สำหรับมือถือ */}
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-widest text-black mb-3 md:mb-4">
          VibeCheck
        </h1>
        
        {/* 🚨 ลดขนาดตัวอักษรรองเหลือ text-base สำหรับมือถือ */}
        <p className="text-base md:text-xl font-bold text-gray-600 uppercase mb-8 md:mb-10">
          Find your sound. Find your band.
        </p>

        {/* ปุ่มเข้าสู่หน้า Login */}
        <Link 
          to="/login"
          // 🚨 ลด padding ของปุ่มในมือถือลงนิดหน่อย
          className="inline-block w-full md:w-auto px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl font-black uppercase transition bg-black text-white border-4 border-black rounded-xl hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] md:shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] active:translate-y-1 active:shadow-none"
        >
          Let's Jam
        </Link>

      </div>
      
    </div>
  );
}