import { create } from 'zustand';

// สร้าง Store เก็บสถานะการค้นหา
export const useSearchStore = create((set) => ({
  searchTerm: '',            // เก็บคำค้นหา
  activeFilter: 'ALL',       // เก็บหมวดหมู่ (All, Band, Knowledge)
  
  // ฟังก์ชันสำหรับอัปเดตค่า
  setSearchTerm: (term) => set({ searchTerm: term }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  
  // ฟังก์ชันรีเซ็ต (เผื่ออยากเคลียร์ค่า)
  clearSearch: () => set({ searchTerm: '', activeFilter: 'ALL' })
}));