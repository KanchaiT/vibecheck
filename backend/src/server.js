const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db')
const morgan = require('morgan'); // เพิ่ม morgan สำหรับ logging

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

app.use(morgan('dev')); // ใช้ morgan ในโหมด 'dev' เพื่อดูรายละเอียดของแต่ละคำขอในคอนโซล

// นำเข้า Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const bandRoutes = require('./routes/bandRoutes');

// ================= ROUTES =================
app.use('/api/auth', authRoutes); // กำหนดให้ API หมวด Auth เริ่มต้นด้วย /api/auth
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bands', bandRoutes);

app.get('/health', (req, res) => {
    // 🚨 C2: ดึงค่า Uptime (ระยะเวลาที่เซิร์ฟเวอร์รันอยู่ หน่วยเป็นวินาที)
    const uptime = process.uptime();

    // 🚨 C3: ดึงค่า Memory (Resident Set Size) และแปลงจาก Bytes เป็น Megabytes (MB)
    // 1 MB = 1024 * 1024 Bytes = 1,048,576 Bytes
    const memoryUsageBytes = process.memoryUsage().rss;
    const memoryUsageMB = (memoryUsageBytes / 1048576).toFixed(2); // ปัดทศนิยม 2 ตำแหน่ง

    // 🚨 C4: ดึงเวลาปัจจุบันในรูปแบบ ISO มาตรฐานสากล
    const timestamp = new Date().toISOString();

    // 🚨 C1 & C5: ส่งข้อมูลกลับเป็น JSON Format ที่ถูกต้องพร้อมปีกกาและ Key
    return res.status(200).json({
        status: "active",
        uptime_seconds: parseFloat(uptime.toFixed(2)), 
        memory_usage_mb: parseFloat(memoryUsageMB),    
        timestamp: timestamp,                          
        message: "VibeCheck API is running smoothly! 🚀"
    });
});

app.get('/scan', (req, res) => {
    // 🚨 C3: ดึงค่าจาก req.query.token มาใช้ (ต้องพิมพ์ตัวเล็กทั้งหมด)
    const userToken = req.query.token; 
    console.log("Received token:", userToken);
    // 🚨 C4: เมื่อส่ง token=admin ระบบตอบกลับเป็น JSON พร้อม Status 200
    if (userToken === 'admin') {
        return res.status(200).json({
            status: "authorized",
            clearance: "high"
        });
    }

    // 🚨 C5: เมื่อส่งค่าอื่น หรือไม่ส่งมา ระบบตอบกลับเป็น Status 401
    return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing token"
    });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server is running on port ${PORT}`);
});