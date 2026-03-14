import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // เก็บข้อมูล user (username, majorInstrument)
      token: null, // เก็บ JWT Token
      
      // ฟังก์ชันตอน Login/Register สำเร็จ
      setAuth: (user, token) => set({ user, token }),
      
      // ฟังก์ชันตอน Logout
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'vibecheck-auth-storage', // ชื่อ Key ที่จะเซฟลง Local Storage
    }
  )
);