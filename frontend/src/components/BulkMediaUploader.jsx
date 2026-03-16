import React, { useState, useEffect } from 'react';

const MAX_PARALLEL = 2; // ควบคุมให้รันพร้อมกันได้แค่ 2 งาน
const TOTAL_TASKS = 10;

export default function BulkMediaUploader() {
  // สร้าง State จำลองไฟล์เพลง 10 ไฟล์
  const [tasks, setTasks] = useState(
    Array.from({ length: TOTAL_TASKS }, (_, i) => ({
      id: i + 1,
      name: `Demo_Track_${i + 1}.mp3`,
      progress: 0,
      status: 'pending' // สถานะ: pending, running, completed
    }))
  );
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [runningCount, setRunningCount] = useState(0);

  // ฟังก์ชันเริ่มทำงาน
  const startProcessing = () => {
    setIsProcessing(true);
  };

  // ==========================================
  // 🚨 ลอจิกจำลองการทำงานของแต่ละ Task (คืนค่าเป็น Promise)
  // ==========================================
  const processTask = async (taskId) => {
    // 1. เปลี่ยนสถานะเป็น running
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'running' } : t))
    );

    return new Promise((resolve) => {
      let currentProgress = 0;
      
      // 2. จำลองการอัปโหลดไฟล์ (เพิ่ม progress แบบสุ่ม)
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 20) + 5; 
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
        }

        // 🚨 อัปเดต Progress โดยใช้ Callback (...prev) เพื่อไม่ให้ข้อมูลทับกัน (Checklist C2)
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  progress: currentProgress,
                  status: currentProgress === 100 ? 'completed' : 'running'
                }
              : t
          )
        );

        if (currentProgress === 100) {
          resolve(); // 3. ส่งสัญญาณว่างานเสร็จแล้ว
        }
      }, 500); // อัปเดตทุกๆ ครึ่งวินาที
    });
  };

  // ==========================================
  // 🚨 หัวใจสำคัญ Checklist C1: The Orchestrator Logic
  // ==========================================
  useEffect(() => {
    if (!isProcessing) return;

    // คำนวณหาช่องว่างที่เหลือ (Max = 2)
    const availableSlots = MAX_PARALLEL - runningCount;
    
    if (availableSlots > 0) {
      // ดึงงานที่ยัง pending อยู่ มาตามจำนวนช่องว่างที่เหลือ
      const pendingTasks = tasks.filter((t) => t.status === 'pending');
      const tasksToStart = pendingTasks.slice(0, availableSlots);

      if (tasksToStart.length > 0) {
        // เพิ่มจำนวนงานที่กำลังรันอยู่
        setRunningCount((prev) => prev + tasksToStart.length);

        // สั่งรันงานที่ถูกดึงมา
        tasksToStart.forEach(async (task) => {
          await processTask(task.id);
          // เมื่องานเสร็จ (Promise resolve) ให้ลดจำนวนคิวที่รันอยู่ลง 1
          setRunningCount((prev) => prev - 1);
        });
      }
    }
  }, [tasks, runningCount, isProcessing]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
      <h2 className="text-2xl font-black uppercase mb-2">🎵 Bulk Track Uploader</h2>
      <p className="font-bold text-gray-600 mb-6">
        เซิร์ฟเวอร์สามารถอัปโหลดไฟล์พร้อมกันได้สูงสุด <span className="text-yellow-600">{MAX_PARALLEL}</span> ไฟล์
      </p>

      <button
        onClick={startProcessing}
        disabled={isProcessing}
        className="w-full mb-6 px-6 py-3 font-black text-lg bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 disabled:bg-gray-300 disabled:text-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition"
      >
        {isProcessing ? "UPLOADING IN PROGRESS..." : "START UPLOAD"}
      </button>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 border-2 border-gray-300 rounded-lg">
            <div className="flex justify-between font-bold text-sm mb-1 uppercase">
              <span>{task.name}</span>
              <span className={
                task.status === 'completed' ? 'text-green-600' :
                task.status === 'running' ? 'text-yellow-600 animate-pulse' : 'text-gray-400'
              }>
                {task.status} ({task.progress}%)
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden border border-black">
              <div
                className={`h-full transition-all duration-300 ${
                  task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-400'
                }`}
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}