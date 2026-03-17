// frontend/src/pages/FeedbackPage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form'; // 
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast'; // ]

const FeedbackPage = () => {
  // C2: การเรียกใช้ React Hook Form แบบครบสูตร ]
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [serverResponse, setServerResponse] = useState(null);

  const onSubmit = async (data) => {
    // C5: ใช้ Try-Catch ดักจับ Error ]
    try {
      // C3: ใช้ Axios ยิงไปหา Server (ใช้ jsonplaceholder เพื่อให้ทดสอบผ่านง่ายๆ ตอนอัดคลิป) ]
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', data);

      if (response.status === 201) {
        toast.success('ส่ง Feedback สำเร็จ! ขอบคุณที่ร่วมพัฒนา VibeCheck ครับ', { position: 'bottom-center' }); // ]
        setServerResponse(response.data); // C3: โชว์ JSON ]
        reset(); // C4: เคลียร์ฟอร์ม ]
      }
    } catch (error) {
      toast.error('เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง', { position: 'bottom-center' }); // ]
    }
  };

  // แกล้งทำฟังก์ชันให้ปุ่มพัง (เพื่อเทสข้อ C5) ]
  const triggerError = async () => {
    try {
      await axios.post('https://httpstat.us/500', {}); // ยิงไปเว็บที่จำลอง 500 Error
    } catch (error) {
      toast.error('จำลองการเกิด Error 500 จาก Server!', { position: 'bottom-center' }); // ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster /> {/* ตัวแสดง Pop-up */}
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">VibeCheck Feedback</h2>
        
        {/* C2: ใช้ handleSubmit ป้องกัน Page Refresh , 41] */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* 1. Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล</label>
            <input
              type="text"
              // C4: ขอบแดงเมื่อมี Error , 52]
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="ไม่ต้องมีคำนำหน้า"
              {...register('fullName', { // C2: ผูกด้วย register ]
                required: 'กรุณากรอกชื่อ-นามสกุล', // , 37]
                pattern: {
                value: /^[a-zA-Zก-๙\s]+$/, // C1: ห้ามตัวเลข , 35]
                message: 'กรุณากรอกเฉพาะตัวอักษรภาษาอังกฤษหรือไทย ห้ามใส่ตัวเลข',
                },
              })}
            />
            {/* C2: ดึง error ออกมาโชว์ ] */}
            {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* 2. Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลติดต่อกลับ</label>
            <input
              type="text" // จงใจใช้ text เพื่อให้ RHF เช็คด้วย Regex เอง (ตามโจทย์ C1) , 35]
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="example@vibecheck.com"
              {...register('email', {
                required: 'กรุณากรอกอีเมล', // , 37]
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // C1: Regex เช็คอีเมล , 35]
                  message: 'รูปแบบอีเมลไม่ถูกต้อง (เช่น ขาด @ หรือ .com)',
                },
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* 3. Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทการแจ้งเรื่อง</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
              {...register('category')} // ]
            >
              <option value="Bug">เจอเจอบั๊ก / ระบบพัง (Bug)</option> // ]
              <option value="Suggestion">เสนอแนะฟีเจอร์ใหม่ (Suggestion)</option> // ]
              <option value="Inquiry">สอบถามการใช้งาน (Inquiry)</option> // ]
            </select>
          </div>

          {/* 4. Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด (20 - 500 ตัวอักษร)</label>
            <textarea
              rows="4"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.message ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="อธิบายสิ่งที่คุณต้องการแจ้งให้เราทราบ..."
              {...register('message', {
                required: 'กรุณากรอกรายละเอียด', // , 37]
                minLength: { value: 20, message: 'ข้อความต้องมีความยาวอย่างน้อย 20 ตัวอักษร' }, // C1: เช็คความยาว , 36]
                maxLength: { value: 500, message: 'ข้อความต้องไม่เกิน 500 ตัวอักษร' }, // ]
              })}
            ></textarea>
            {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
          </div>

          {/* ปุ่ม Submit */}
          {/* C4: Button State ตอนโหลด ให้ Disabled และเป็นสีเทา , 52] */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            }`}
          >
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลให้ทีมงาน VibeCheck'}
          </button>
        </form>

        {/* ปุ่มเอาไว้กดโชว์ Error 500 (สำหรับอัดคลิปโชว์ข้อ C5 Graceful Failure) ] */}
        <div className="mt-4 text-center">
            <button type="button" onClick={triggerError} className="text-xs text-red-400 underline">
                ทดสอบจำลอง Server ล่ม (C5 Test)
            </button>
        </div>

        {/* C3: โชว์ข้อมูลที่ Server ตอบกลับ , 49] */}
        {serverResponse && (
          <div className="mt-8 bg-gray-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
            <h3 className="font-bold text-green-700 mb-2">ข้อมูลถูกส่งเข้า Server เรียบร้อยแล้ว:</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(serverResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;