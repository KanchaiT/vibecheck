// frontend/src/pages/GearBudgetScreen.jsx
import React, { useState } from 'react';

// อัตราแลกเปลี่ยนจำลอง
const RATES = {
  USD: 0.029,
  JPY: 4.30, // เรทสำหรับคำนวณซื้อ Telecaster จากญี่ปุ่น!
  EUR: 0.026,
};

// ==========================================
// 🎯 C3: การใช้ Reusable Component (DRY) [cite: 346-348]
// ==========================================
const BudgetCard = ({ label, value, gearHint }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4 shadow-lg border border-white/20 transition-transform hover:scale-105 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
    <div>
      <p className="text-sm text-blue-200 mb-1 uppercase tracking-widest font-semibold">{label}</p>
      <p className="text-xs text-gray-400">{gearHint}</p>
    </div>
    <p className="text-4xl font-bold text-white">${value}</p>
  </div>
);

export default function GearBudgetScreen() {
  const [thb, setThb] = useState('');

  // ==========================================
  // 🎯 C1: ตรรกะการคำนวณและการจัดการ Error 
  // ==========================================
  const calculateCurrency = (rate) => {
    // ดักจับกรณีช่องว่าง เพื่อให้ผ่าน The Crash Test
    if (!thb || isNaN(thb)) return '0.00';
    const parsedThb = parseFloat(thb);
    return (parsedThb * rate).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-8 bg-[url('https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-fixed">
      {/* Overlay สีเข้มทับรูปพื้นหลัง */}
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm"></div>
      
      <div className="max-w-2xl w-full relative z-10">
        
        {/* Header สไตล์ VibeCheck */}
        <h1 className="text-4xl sm:text-5xl font-black text-white text-center mb-2 tracking-wide drop-shadow-lg">
          Global <span className="text-blue-500">Gear Budget</span> 🎸
        </h1>
        <p className="text-slate-400 text-center mb-10 text-sm sm:text-base">
          คำนวณงบประมาณอุปกรณ์ดนตรีนำเข้า (Glassmorphism UI)
        </p>

        {/* Input Card (กระจกฝ้าสว่าง) */}
        <div className="bg-blue-600/15 backdrop-blur-xl rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl border border-blue-400/30">
          <p className="text-blue-200 text-sm sm:text-base font-semibold mb-2 uppercase tracking-wide">
            ตั้งงบประมาณ (Thai Baht - THB)
          </p>
          <input
            type="number" // 🎯 C4: บังคับแป้นตัวเลขบนมือถือ [cite: 351-354]
            className="w-full bg-transparent text-5xl sm:text-6xl font-bold text-white border-b-2 border-slate-500/50 focus:border-blue-400 outline-none py-3 placeholder-slate-600 transition-colors"
            placeholder="0.00"
            value={thb}
            onChange={(e) => setThb(e.target.value)}
          />
        </div>

        {/* 🎯 C3: เรียกใช้ Component แบบไม่ซ้ำ [cite: 346-348] */}
        <BudgetCard 
          label="🇺🇸 USD (US Dollar)" 
          value={calculateCurrency(RATES.USD)} 
          gearHint="เรทสำหรับเช็คราคา Fender / Shure / Universal Audio"
        />
        <BudgetCard 
          label="🇯🇵 JPY (Japanese Yen)" 
          value={calculateCurrency(RATES.JPY)} 
          gearHint="เรทสำหรับเช็คราคา Roland / Korg / Yamaha"
        />
        <BudgetCard 
          label="🇪🇺 EUR (Euro)" 
          value={calculateCurrency(RATES.EUR)} 
          gearHint="เรทสำหรับเช็คราคา Arturia / อุปกรณ์ฝั่งยุโรป"
        />
      </div>
    </div>
  );
}