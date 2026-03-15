import React, { createContext, useState, useContext } from 'react';

// 1. สร้าง Context
const ThemeContext = createContext();

// 2. สร้าง Provider เพื่อครอบแอป
export const ThemeProvider = ({ children }) => {
  // 🚨 จุดสำคัญทำคะแนน: ต้องเก็บ State เป็น Object เพื่อรองรับฟีเจอร์ Color Picker ในอนาคต
  const [config, setConfig] = useState({
    theme: 'light', // ค่าเริ่มต้นเป็นโหมดสว่าง
    // primaryColor: 'yellow', <-- เดี๋ยวเราค่อยไปเติมอันนี้ในอีก Branch นึง
  });

  // ฟังก์ชันสลับโหมด
  const toggleTheme = () => {
    // 🚨 จุดชี้ขาด C3: ต้องใช้ prev => ({ ...prev }) เพื่อไม่ให้ทับค่าอื่นหาย
    setConfig((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  return (
    <ThemeContext.Provider value={{ config, toggleTheme }}>
      {/* วางคลาสพื้นฐานของ Dark Mode ที่นี่เลย จะได้ครอบคลุมทั้งแอป */}
      <div className={config.theme === 'dark' ? 'bg-gray-900 text-white min-h-screen transition-colors duration-300' : 'bg-gray-50 text-black min-h-screen transition-colors duration-300'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// 3. สร้าง Custom Hook ให้เรียกใช้ง่ายๆ
export const useTheme = () => useContext(ThemeContext);