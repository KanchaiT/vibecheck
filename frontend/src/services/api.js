import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // เปลี่ยน baseURL ให้ดึงจาก .env (ถ้ามี) แต่ถ้าไม่มีให้ใช้ localhost สำรองไว้
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;