const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// โหลดค่าจากไฟล์ .env
dotenv.config();

// เรียกใช้ฟังก์ชันเชื่อมต่อ Database
connectDB();

const app = express();

// ================= MIDDLEWARES =================
// อนุญาตให้ Frontend ที่รันอยู่คนละ Port (เช่น 5173) ยิง API เข้ามาได้
app.use(cors()); 

// ให้ Express สามารถอ่านข้อมูลที่ส่งมาเป็น JSON (เช่น ข้อมูลฟอร์มสมัครสมาชิก) ได้
app.use(express.json()); 

// นำเข้า Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

// ================= ROUTES =================
app.use('/api/auth', authRoutes); // กำหนดให้ API หมวด Auth เริ่มต้นด้วย /api/auth

app.use('/api/posts', postRoutes);

app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  // ตอบกลับด้วย HTTP Status Codes ให้ถูกต้อง
  res.status(200).json({ 
    status: 'success', 
    message: 'VibeCheck API is running smoothly! 🚀' 
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server is running on port ${PORT}`);
});