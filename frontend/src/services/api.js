import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ตั้งค่า Base URL ชี้ไปที่ Backend ของเรา
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Interceptor: ดักจับ Request ก่อนส่งออกไป เพื่อแนบ Token (เตรียมรับคะแนน Function 6.4)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;