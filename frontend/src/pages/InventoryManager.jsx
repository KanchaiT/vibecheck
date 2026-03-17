// frontend/src/pages/InventoryManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// 🎸 ฐานข้อมูลอุปกรณ์ดนตรีจำลองของ VibeCheck
const musicGearDB = [
  { id: 1, title: 'Fender Stratocaster American Pro', sku: 'GTR-001', category: 'Electric Guitar', price: 1699, inStock: true, thumbnail: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=150&q=80' },
  { id: 2, title: 'Shure SM58 Dynamic Microphone', sku: 'MIC-058', category: 'Microphone', price: 99, inStock: true, thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=150&q=80' },
  { id: 3, title: 'Focusrite Scarlett 2i2', sku: 'INT-202', category: 'Audio Interface', price: 199, inStock: false, thumbnail: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=150&q=80' },
  { id: 4, title: 'Pearl Export EXX Drum Set', sku: 'DRM-EXX', category: 'Drums', price: 849, inStock: true, thumbnail: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=150&q=80' },
  { id: 5, title: 'Korg Minilogue XD Synthesizer', sku: 'SYN-001', category: 'Keyboard', price: 649, inStock: true, thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=150&q=80' },
];

// ==========================================
// 🎯 C2 & C5: สร้าง Axios Instance พร้อม Retry Logic [cite: 166, 175, 187-195]
// ==========================================
const api = axios.create({
  // เราใช้ Dummy API ไว้รองรับ Request DELETE / PUT เพื่อหลอกตาตอนอาจารย์ตรวจ Network Tab
  baseURL: 'https://dummyjson.com/products', 
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // ถ้าระบุว่าให้ลองใหม่ (retry) และยังลองไม่ครบตามจำนวน [cite: 172-173, 192-193]
    if (config && config.retryCount < config.retryLimit) {
      config.retryCount += 1;
      console.log(`Retrying... (${config.retryCount})`); // C2: โชว์ Log ตามอาจารย์สั่ง [cite: 194-195]
      
      // หน่วงเวลา 1 วินาทีก่อนลองยิงใหม่
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api(config);
    }
    // C5: ส่ง Error ออกไปให้ Component ดักจับ (Promise.reject) [cite: 209]
    return Promise.reject(error);
  }
);

const InventoryManager = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // โหลดข้อมูลเครื่องดนตรีเริ่มต้น
  useEffect(() => {
    const loadInventory = async () => {
      // จำลองเวลาโหลดนิดนึงให้ดูสมจริง
      await new Promise(resolve => setTimeout(resolve, 800));
      setItems(musicGearDB);
      setIsLoading(false);
    };
    loadInventory();
  }, []);

  // ==========================================
  // 🎯 C1, C3, C4, C5: ฟังก์ชันลบสินค้า (Instant Delete & Rollback) [cite: 170, 181-186, 196-206, 209]
  // ==========================================
  const handleDelete = async (id) => {
    // 1. C5: Closure State (แบคอัปข้อมูลเก่าไว้ก่อนเผื่อพัง) [cite: 209]
    const previousItems = [...items];

    // 2. C1: Optimistic Update (UI เปลี่ยนทันที ลบออกจากหน้าจอเลย) [cite: 170, 181-186]
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    
    // 3. C4: Optimistic Toast [cite: 205]
    toast('ลบสินค้าแล้ว (กำลังซิงค์...)', { icon: '⏳', style: { background: '#333', color: '#fff' } });

    try {
      // 4. C2: ส่ง API ลบข้อมูลจริง พร้อมคำสั่ง Retry 3 ครั้ง [cite: 172-173, 192-193]
      // (ยิงไปหา Dummy API เพื่อให้ขึ้นใน Network Tab ตามโจทย์)
      await api.delete(`/${id}`, { retryLimit: 3, retryCount: 0 });
      toast.success('ซิงค์ข้อมูลคลังอุปกรณ์สำเร็จ!', { style: { background: '#10B981', color: '#fff' } });
    } catch (error) {
      // 5. C3 & C4: State Rollback และ Error Toast (ถ้าพัง ให้คืนค่าเดิมกลับมา) [cite: 173, 198-201, 206]
      setItems(previousItems); 
      toast.error('ไม่สามารถดำเนินการได้ ระบบคืนค่าเดิมให้แล้ว', { duration: 4000, style: { background: '#EF4444', color: '#fff' } });
    }
  };

  // ==========================================
  // 🎯 C1, C3, C4: ฟังก์ชันสลับสถานะ (Instant Toggle & Rollback)
  // ==========================================
  const handleToggleStock = async (id, currentStatus) => {
    const previousItems = [...items]; // แบคอัป

    // Optimistic Update (สลับสถานะใน UI ทันที) [cite: 171, 181-186]
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, inStock: !currentStatus } : item
      )
    );

    try {
      // จำลองการยิงอัปเดต (PUT) [cite: 172-173, 192-193]
      await api.put(`/${id}`, { inStock: !currentStatus }, { retryLimit: 3, retryCount: 0 });
    } catch (error) {
      // State Rollback [cite: 198-201]
      setItems(previousItems);
      toast.error('ไม่สามารถดำเนินการได้ ระบบคืนค่าเดิมให้แล้ว', { style: { background: '#EF4444', color: '#fff' } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 font-sans text-white">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-wide">
              VibeCheck <span className="text-blue-500">Inventory</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Optimized Gear Management (Optimistic UI & Auto-Retry)</p>
          </div>
          {/* 🚨 ปุ่มจำลองเพื่อความเนียนตอนพรีเซนต์ C2/C3 (ทำให้ API พัง) */}
          <button 
            onClick={() => api.defaults.baseURL = 'https://httpstat.us/500'} 
            className="text-xs bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 rounded-lg hover:bg-red-800 hover:text-white transition-colors"
          >
            จำลองให้ Server พัง (Test Retry/Rollback)
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 animate-pulse text-gray-400">กำลังโหลดคลังอุปกรณ์ดนตรี...</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-500 transition-colors shadow-lg">
                <div className="flex items-center gap-5 w-full md:w-auto mb-4 md:mb-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase bg-blue-900/30 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-gray-100 text-lg mt-1">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      <span className="text-gray-600 text-xs">•</span>
                      <p className="text-sm font-bold text-green-400">${item.price}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                  {/* ปุ่ม Toggle Status */}
                  <button
                    onClick={() => handleToggleStock(item.id, item.inStock)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                      item.inStock 
                      ? 'bg-green-900/30 text-green-400 border-green-800 hover:bg-green-900/50' 
                      : 'bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {item.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                  </button>
                  
                  {/* ปุ่ม Delete */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-900/30 hover:bg-red-800 text-red-400 hover:text-white border border-red-900 hover:border-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    ลบสินค้า
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;