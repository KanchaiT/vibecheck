import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore'

// กำหนด Schema สำหรับตรวจจับข้อผิดพลาดด้วย Zod
const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอก Username ให้ครบถ้วน"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  // เรียกใช้ React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // ฟังก์ชันเมื่อกดปุ่ม Submit
  const onSubmit = async (data) => {
    try {
      // ยิง API ไปที่ http://localhost:5000/api/auth/login
      const response = await api.post('/auth/login', {
        username: data.username,
        password: data.password,
      });

      // ดึงข้อมูลที่ Backend ส่งกลับมา (user info + token)
      const { token, ...userData } = response.data;
      
      // บันทึกลง Zustand Store (และ Local Storage)
      setAuth(userData, token);

      console.log("Login สำเร็จ ยินดีต้อนรับ:", userData.username);
      navigate('/hub'); // เด้งไปหน้า VibeHub
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "รหัสผ่านไม่ถูกต้อง";
      alert(errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] font-sans">
      
      {/* กล่อง Form สไตล์ Brutalism */}
      <div className="w-full max-w-md bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        <div className="mb-8 text-center border-b-4 border-black pb-4">
          <h1 className="text-4xl font-black uppercase tracking-widest text-black">VibeCheck</h1>
          <p className="font-bold text-gray-500 uppercase mt-2">Find your bandmate.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Input: Username */}
          <div>
            <label className="block text-sm font-black uppercase mb-2">Username</label>
            <input 
              {...register('username')} 
              type="text"
              placeholder="NIGHT_RIDER_99"
              className="w-full px-4 py-3 bg-gray-100 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 transition font-medium"
            />
            {/* แสดงข้อความ Error ถ้ากรอกผิดเงื่อนไข Zod */}
            {errors.username && <p className="mt-2 text-xs font-bold text-red-500 uppercase">{errors.username.message}</p>}
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

          {/* ปุ่ม Login */}
          <button 
            type="submit" 
            className="w-full py-4 mt-4 text-xl font-black uppercase transition bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            Enter VibeHub
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm font-bold text-gray-600">
            DON'T HAVE AN ACCOUNT?{' '}
            <Link to="/register" className="text-black underline cursor-pointer hover:text-yellow-500">
              REGISTER
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}