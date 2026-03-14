import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'

// กำหนด Schema สำหรับตรวจจับข้อผิดพลาดด้วย Zod ให้สอดคล้องกับ Mongoose Schema ฝั่ง Backend
const registerSchema = z.object({
  username: z.string().min(3, "Username ต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  majorInstrument: z.string().min(1, "กรุณาระบุเครื่องดนตรีหลัก (เช่น Electric Guitar, Bass, Vocal)"),
});

export default function Register() {
  const navigate = useNavigate();
  
  // เรียกใช้ React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  // ฟังก์ชันเมื่อกดปุ่ม Submit
  const onSubmit = async (data) => {
    try {
      // ยิง API ไปที่ http://localhost:5000/api/auth/register
      const response = await api.post('/auth/register', {
        username: data.username,
        password: data.password,
        majorInstrument: data.majorInstrument,
      });

      console.log("สมัครสมาชิกสำเร็จ:", response.data);
      alert("สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน");
      navigate('/login'); // เด้งไปหน้า Login
      
    } catch (error) {
      // จัดการ Error (เช่น Username ซ้ำ)
      const errorMsg = error.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
      alert(errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] font-sans py-8">
      
      {/* กล่อง Form สไตล์ Brutalism */}
      <div className="w-full max-w-md bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        <div className="mb-8 text-center border-b-4 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-widest text-black">Join VibeCheck</h1>
          <p className="font-bold text-gray-500 uppercase mt-2">Create your artist profile.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Input: Username */}
          <div>
            <label className="block text-sm font-black uppercase mb-2">Username</label>
            <input 
              {...register('username')} 
              type="text"
              placeholder="NIGHT_RIDER_99"
              className="w-full px-4 py-3 bg-gray-100 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition font-medium"
            />
            {errors.username && <p className="mt-2 text-xs font-bold text-red-500 uppercase">{errors.username.message}</p>}
          </div>

          {/* Input: Major Instrument */}
          <div>
            <label className="block text-sm font-black uppercase mb-2">Major Instrument</label>
            <input 
              {...register('majorInstrument')} 
              type="text"
              placeholder="e.g. Electric Guitar, Vocals"
              className="w-full px-4 py-3 bg-gray-100 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition font-medium"
            />
            {errors.majorInstrument && <p className="mt-2 text-xs font-bold text-red-500 uppercase">{errors.majorInstrument.message}</p>}
          </div>

          {/* Input: Password */}
          <div>
            <label className="block text-sm font-black uppercase mb-2">Password</label>
            <input 
              {...register('password')} 
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-100 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition font-medium"
            />
            {errors.password && <p className="mt-2 text-xs font-bold text-red-500 uppercase">{errors.password.message}</p>}
          </div>

          {/* ปุ่ม Register */}
          <button 
            type="submit" 
            className="w-full py-4 mt-2 text-xl font-black uppercase transition bg-black text-white border-4 border-black rounded-xl hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] active:translate-y-1 active:shadow-none"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm font-bold text-gray-600">
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link to="/login" className="text-black underline cursor-pointer hover:text-yellow-500">
              LOGIN
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}