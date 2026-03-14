import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  // ดึง Token ออกมาจาก Zustand (Local Storage)
  const token = useAuthStore((state) => state.token);

  // ถ้าไม่มี Token (ยังไม่ล็อกอิน หรือกด Logout ไปแล้ว) ให้เตะกลับไปหน้า /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ถ้ามี Token ก็ปล่อยผ่านให้ไปโหลด Component ลูกๆ ได้ตามปกติ
  return <Outlet />;
}