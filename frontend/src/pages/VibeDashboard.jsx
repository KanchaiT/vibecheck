// frontend/src/pages/VibeDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VibeDashboard() {
  const [gearData, setGearData] = useState({ data: null, isError: false });
  const [weatherData, setWeatherData] = useState({ data: null, isError: false });
  const [loading, setLoading] = useState(true);
  
  // 🎯 ดักจับสถานะ Online/Offline อัตโนมัติ (เทียบเท่า NetInfo ของแอปมือถือ)
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // สร้าง URL ไว้ใน State เพื่อให้กดปุ่มแกล้งพังได้ (สำหรับโชว์ C2)
  const [weatherUrl, setWeatherUrl] = useState('https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.51&current_weather=true');

  const fetchDashboardData = async () => {
    setLoading(true);

    // ==========================================
    // 🎯 C3: Offline Mode (ถ้าเน็ตหลุด ให้ดึง Cache มาโชว์) [cite: 431-432, 453-458]
    // ==========================================
    if (!navigator.onLine) {
      const cachedGear = localStorage.getItem('vibe_gear_cache');
      const cachedWeather = localStorage.getItem('vibe_weather_cache');
      
      if (cachedGear) setGearData({ data: JSON.parse(cachedGear), isError: false });
      if (cachedWeather) setWeatherData({ data: JSON.parse(cachedWeather), isError: false });
      
      setLoading(false);
      return; // จบการทำงาน ไม่ต้องไปยิง API
    }

    // ==========================================
    // 🎯 C1: Parallel Fetching ด้วย Promise.allSettled [cite: 430, 437-438, 444-448]
    // ==========================================
    try {
      const results = await Promise.allSettled([
        axios.get('https://dummyjson.com/products/category/smartphones?limit=3', { timeout: 5000 }), // API 1: จำลองเป็น Gear
        axios.get(weatherUrl, { timeout: 5000 }) // API 2: Weather (กทม.)
      ]);

      // 🎯 C2: จัดการ Partial Failure แยกส่วนกัน (ไม่ล่มทั้งหน้าจอ) [cite: 433, 449-452]
      
      // ส่วนที่ 1: ตรวจสอบ Gear Data
      if (results[0].status === 'fulfilled') {
        const gears = results[0].value.data.products;
        setGearData({ data: gears, isError: false });
        localStorage.setItem('vibe_gear_cache', JSON.stringify(gears)); // เซฟ Cache 
      } else {
        setGearData({ data: null, isError: true });
      }

      // ส่วนที่ 2: ตรวจสอบ Weather Data
      if (results[1].status === 'fulfilled') {
        const weather = results[1].value.data.current_weather;
        setWeatherData({ data: weather, isError: false });
        localStorage.setItem('vibe_weather_cache', JSON.stringify(weather)); // เซฟ Cache 
      } else {
        setWeatherData({ data: null, isError: true });
      }

    } catch (error) {
      console.error("Dashboard Fetch Error", error);
    } finally {
      setLoading(false); // C1: ตัวโหลดตัวเดียว คุมทั้งหน้า [cite: 430, 446]
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isOffline, weatherUrl]);

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 font-sans text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white">
            VibeCheck <span className="text-blue-500">Live Dashboard</span>
          </h1>
          
          {/* 🚨 ปุ่มจำลอง API สภาพอากาศล่ม (ไว้โชว์อาจารย์ข้อ C2) */}
          <button 
            onClick={() => setWeatherUrl('https://api.open-meteo.com/v1/error')}
            className="text-xs bg-red-900/50 text-red-400 px-3 py-1 rounded hover:bg-red-800 transition-colors"
          >
            จำลอง API สภาพอากาศล่ม
          </button>
        </div>

        {/* 🎯 C3: แถบแจ้งเตือนสีส้มเมื่อ Offline [cite: 431-432, 457] */}
        {isOffline && (
          <div className="bg-orange-600 text-white p-3 rounded-lg mb-6 font-bold text-center animate-pulse shadow-lg">
            ⚠️ Offline Mode: Showing Cached Data (ใช้งานโหมดออฟไลน์)
          </div>
        )}

        {/* 🎯 C1: ตัวโหลดตัวเดียวครอบคลุมทั้งหน้าจอ [cite: 430, 446] */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-gray-800 rounded-2xl border border-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">กำลังซิงค์ข้อมูลแบบ Parallel (Promise.allSettled)...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ---------------- การ์ดที่ 1: Music Gear ---------------- */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-blue-400">🎸 Trending Gear Deals</h2>
              
              {/* C2: ตรวจจับ Error แยกส่วน [cite: 433, 449-452] */}
              {gearData.isError ? (
                <div className="bg-red-900/30 text-red-400 p-4 rounded-lg text-center border border-red-800/50">
                  Service Unavailable (ไม่สามารถดึงข้อมูลอุปกรณ์ได้)
                </div>
              ) : gearData.data ? (
                <div className="space-y-4">
                  {gearData.data.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b border-gray-700 pb-3">
                      <span className="font-semibold text-gray-200">{item.title}</span>
                      <span className="text-green-400 font-bold">${item.price}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* ---------------- การ์ดที่ 2: Concert Weather ---------------- */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">⛅️ Concert Weather (BKK)</h2>
              
              {/* C2: ตรวจจับ Error แยกส่วน [cite: 433, 449-452] */}
              {weatherData.isError ? (
                <div className="bg-red-900/30 text-red-400 p-4 rounded-lg text-center border border-red-800/50">
                  Service Unavailable (ไม่สามารถดึงข้อมูลสภาพอากาศได้)
                </div>
              ) : weatherData.data ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <span className="text-6xl font-black text-white mb-2">
                    {weatherData.data.temperature}°C
                  </span>
                  <span className="text-gray-400 text-lg">
                    Wind: {weatherData.data.windspeed} km/h
                  </span>
                </div>
              ) : null}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}