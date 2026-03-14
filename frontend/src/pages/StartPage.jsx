import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

export default function StartPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
      
      {/* Container หลัก */}
      <div className="w-full max-w-2xl bg-white border-4 border-black rounded-[2rem] p-10 md:p-16 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {/* ไอคอนและโลโก้ */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-yellow-400 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Music size={48} className="text-black" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-black mb-4">
          VibeCheck
        </h1>
        
        <p className="text-lg md:text-xl font-bold text-gray-600 uppercase mb-10">
          Find your sound. Find your band.
        </p>

        {/* ปุ่มเข้าสู่หน้า Login */}
        <Link 
          to="/login"
          className="inline-block w-full md:w-auto px-12 py-4 text-xl font-black uppercase transition bg-black text-white border-4 border-black rounded-xl hover:bg-gray-800 shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] active:translate-y-1 active:shadow-none"
        >
          Let's Jam
        </Link>

      </div>
      
    </div>
  );
}