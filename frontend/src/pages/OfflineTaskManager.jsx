// frontend/src/pages/OfflineTaskManager.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function OfflineTaskManager() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // 🎯 C2: Network Status Awareness (ดักฟังสถานะเน็ต) 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // ใช้ useRef เพื่อป้องกันไม่ให้ฟังก์ชัน Sync ทำงานซ้อนกัน
  const syncLock = useRef(false);

  // ==========================================
  // 🎯 C2: ดักจับการเปิด/ปิดเน็ตแบบ Real-time [cite: 248-249]
  // ==========================================
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==========================================
  // 🎯 C1: Load Data & ID Generation [cite: 240, 245]
  // ==========================================
  useEffect(() => {
    // ดึงข้อมูล Task เก่าจาก LocalStorage ขึ้นมาแสดงเมื่อเปิดเว็บ
    const storedTasks = localStorage.getItem('vibe_band_tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // ฟังก์ชันตัวช่วยในการ Save ข้อมูลลง LocalStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  const saveTasksToLocal = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('vibe_band_tasks', JSON.stringify(newTasks));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 🎯 C1: สร้าง ID ชั่วคราวด้วย Date.now() เพราะอาจจะ Offline อยู่ [cite: 233-234, 245]
    const newTask = {
      id: Date.now().toString(),
      text: inputText,
      status: 'Pending', // เริ่มต้นต้องเป็น Pending เสมอ [cite: 226, 243]
    };

    const updatedTasks = [...tasks, newTask];
    saveTasksToLocal(updatedTasks);
    setInputText('');

    // ถ้าเน็ตมีอยู่ ก็ให้พยายาม Sync ทันที
    if (isOnline) {
      syncQueue(updatedTasks);
    }
  };

  // ==========================================
  // 🎯 C3 & C4: Automatic Background Sync & Duplicate Prevention [cite: 250-257]
  // ==========================================
  const syncQueue = async (currentTasks = tasks) => {
    // ถ้าไม่มีเน็ต, กำลัง Sync อยู่, หรือมี Lock ไว้ จะไม่ทำงานซ้ำซ้อน
    if (!navigator.onLine || syncLock.current) return;

    // หาเฉพาะ Task ที่ยังไม่ได้ Sync (สถานะ Pending)
    const pendingTasks = currentTasks.filter(t => t.status === 'Pending');
    if (pendingTasks.length === 0) return;

    syncLock.current = true;
    setIsSyncing(true);
    
    let latestTasks = [...currentTasks];

    // 🎯 จำลองการส่งข้อมูลทีละตัวแบบ FIFO (First-In-First-Out) [cite: 220, 227, 236]
    for (const task of pendingTasks) {
      try {
        // จำลองเวลา API Server ทำงาน (ตัวละ 1.5 วินาที)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 🎯 C4: เมื่อสำเร็จ เปลี่ยนสถานะเป็น Synced และอัปเดต LocalStorage ป้องกันข้อมูลส่งซ้ำ [cite: 228, 254-257]
        latestTasks = latestTasks.map(t => 
          t.id === task.id ? { ...t, status: 'Synced' } : t
        );
        
        saveTasksToLocal(latestTasks);
        
      } catch (error) {
        console.error("Sync failed for task:", task.id);
        break; // 🎯 ถ้าพังกลางทาง ให้หยุดการ Sync ไว้ก่อน (C4 ป้องกันการข้ามคิว) [cite: 236]
      }
    }

    setIsSyncing(false);
    syncLock.current = false;
  };

  // 🎯 C3: The Magic Moment - เมื่อเน็ตกลับมา (isOnline เปลี่ยนจาก false เป็น true) ให้สั่ง Sync อัตโนมัติ [cite: 227, 237-238, 251-253]
  useEffect(() => {
    if (isOnline) {
      syncQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 font-sans text-white">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-black text-white mb-2">
          VibeCheck <span className="text-blue-500">Band Tasks</span> 📝
        </h1>
        <p className="text-gray-400 mb-6">ระบบจัดการไอเดียแบบ Offline-First Sync</p>

        {/* 🎯 C2: Status Banner (แสดงสถานะเน็ตแบบ Real-time) [cite: 247-248] */}
        <div className={`p-3 rounded-lg font-bold text-center mb-6 transition-colors duration-500 shadow-md ${
          isOnline 
            ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' 
            : 'bg-red-900/50 text-red-400 border border-red-800 animate-pulse'
        }`}>
          {isOnline 
            ? (isSyncing ? '🔄 กำลังซิงค์ข้อมูลไปที่ Server...' : '🟢 Online: เชื่อมต่ออินเทอร์เน็ตแล้ว') 
            : '🔴 Offline: ระบบจะบันทึกข้อมูลไว้ในเครื่องชั่วคราว'}
        </div>

        {/* Form Add Task */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-8">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="เพิ่มไอเดียเพลง หรือตารางซ้อม..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Add Task
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-10 border border-dashed border-gray-700 rounded-xl">ยังไม่มีไอเดียใหม่ ลองพิมพ์อะไรสักอย่างสิ!</p>
          ) : (
            tasks.slice().reverse().map(task => ( // reverse เพื่อให้ของใหม่ขึ้นบนสุด
              <div 
                key={task.id} 
                className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-200 text-lg">{task.text}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {task.id}</p>
                </div>
                
                {/* 🎯 C1 & C4: Status Badge [cite: 226, 228, 243, 252, 256] */}
                <div>
                  {task.status === 'Pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-900/30 text-orange-400 border border-orange-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
                      Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                      ✅ Synced
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}