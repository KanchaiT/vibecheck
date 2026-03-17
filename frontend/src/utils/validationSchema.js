// frontend/src/utils/validationSchema.js
import { z } from 'zod';

// Schema สำหรับ Step 1
export const step1Schema = z.object({
  email: z.string().email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
  password: z.string().min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }),
  username: z.string().min(3, { message: 'Username ต้องมีอย่างน้อย 3 ตัวอักษร' }),
});

// Schema สำหรับ Step 2 พร้อมเงื่อนไข C2 (Conditional Validation) 
export const step2Schema = z.object({
  occupation: z.string().min(1, { message: 'กรุณาเลือกอาชีพ' }),
  company: z.string().optional(),
  githubUrl: z.string().optional(),
}).superRefine((data, ctx) => { // ใช้ superRefine เช็คข้ามฟิลด์ [cite: 137]
  if (data.occupation === 'Developer') {
    if (!data.githubUrl || data.githubUrl.trim() === '') {
      ctx.addIssue({
        path: ['githubUrl'],
        code: z.ZodIssueCode.custom,
        message: 'Developer จำเป็นต้องกรอก GitHub/Portfolio URL', // [cite: 127, 146]
      });
    } else {
      // เช็ค URL Format [cite: 127, 148]
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(data.githubUrl)) {
        ctx.addIssue({
          path: ['githubUrl'],
          code: z.ZodIssueCode.custom,
          message: 'รูปแบบ URL ไม่ถูกต้อง (เช่น https://github.com/...)',
        });
      }
    }
  }
});