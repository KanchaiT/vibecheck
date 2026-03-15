import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'; // เพิ่ม useNavigate
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; // 👈 นำเข้า Zustand มาเพื่อลบ Token
import ThemeToggle from '../components/ThemeToggle';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 👈 เรียกใช้ useNavigate และฟังก์ชัน logout จาก Zustand
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // 👈 สร้างฟังก์ชันเมื่อกดปุ่ม Logout
  const handleLogout = () => {
    logout(); // 1. ลบข้อมูล User และ Token ทิ้ง
    closeMenu(); // 2. ปิดเมนูมือถือ (ถ้าเปิดอยู่)
    navigate('/login'); // 3. เด้งกลับไปหน้า Login
  };

  const navLinkStyle = ({ isActive }) => 
    isActive 
      ? "text-yellow-400 border-b-2 border-yellow-400 pb-1 transition" 
      : "hover:text-yellow-400 border-b-2 border-transparent pb-1 transition";

  const mobileNavLinkStyle = ({ isActive }) =>
    isActive
      ? "block w-full text-center text-xl font-black text-black bg-yellow-400 border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase"
      : "block w-full text-center text-xl font-black text-black bg-white border-4 border-black p-3 rounded-xl hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase transition";

  return (
    <div className="min-h-screen font-sans">
      
      {/* NAVBAR */}
      <nav className="bg-black text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          <Link to="/hub" className="text-2xl md:text-xl font-black uppercase tracking-widest text-yellow-400">
            VibeCheck
          </Link>
          
          <div className="hidden md:flex gap-6 font-bold text-sm">
            <NavLink to="/hub" className={navLinkStyle}>VIBEHUB</NavLink>
            <NavLink to="/myband" className={navLinkStyle}>MY BAND</NavLink>
            <NavLink to="/profile" className={navLinkStyle}>PROFILE</NavLink>
            <button 
              onClick={handleLogout} 
              className="hover:text-red-400 border-b-2 border-transparent pb-1 transition uppercase"
            >
              LOGOUT
            </button>
            <ThemeToggle />
          </div>

          <button 
            className="md:hidden text-white hover:text-yellow-400 transition"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={32} />
          </button>
        </div>
      </nav>

      {/* SIDEBAR จากขวา */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        ></div>
      )}

      {/* เปลี่ยน left-0 เป็น right-0, เปลี่ยน translate เป็นบวก, และเปลี่ยน border/shadow */}
      <div 
        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white border-l-4 border-black z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)]
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b-4 border-black bg-black text-white">
          <span className="text-2xl font-black uppercase tracking-widest text-yellow-400">MENU</span>
          <button onClick={closeMenu} className="hover:text-red-400 transition">
            <X size={32} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6 overflow-y-auto">
          <NavLink to="/hub" onClick={closeMenu} className={mobileNavLinkStyle}>VIBEHUB</NavLink>
          <NavLink to="/myband" onClick={closeMenu} className={mobileNavLinkStyle}>MY BAND</NavLink>
          <NavLink to="/profile" onClick={closeMenu} className={mobileNavLinkStyle}>PROFILE</NavLink>
           
          {/* 👈 เปลี่ยนจาก Link เป็น button เช่นกัน */}
          <button 
            onClick={handleLogout} 
            className="block w-full text-center text-xl font-black text-white bg-red-500 border-4 border-black p-3 rounded-xl mt-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase active:translate-y-1 active:shadow-none transition"
          >
            LOGOUT
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 w-full">
        <Outlet />
      </main>

    </div>
  );
}