const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require('morgan'); 
const fs = require('fs');
const path = require('path');

// โหลดค่าจากไฟล์ .env
dotenv.config();

// เรียกใช้ฟังก์ชันเชื่อมต่อ Database
connectDB();

const app = express();

// ================= MIDDLEWARES =================
app.use(cors()); 
app.use(express.json()); 
app.use(morgan('dev')); 

// ==========================================
// 🎯 Function 3.3 - Circuit Breaker Middleware
// ==========================================
const ipTracker = {}; // จำลอง Database ใน RAM (ห้ามใช้ DB นอก)
const WINDOW_TIME = 10000; // 10 วินาที (10,000 มิลลิวินาที)
const MAX_LIMIT = 5; // ลิมิต 5 ครั้ง

// 🚨 C4: Auto Reset (Memory Leak Prevention)
// ล้างข้อมูล IP ที่ไม่ได้ใช้งานแล้วทุกๆ 10 วินาที เพื่อไม่ให้ RAM เต็ม
setInterval(() => {
    const now = Date.now();
    for (const ip in ipTracker) {
        if (now - ipTracker[ip].startTime > WINDOW_TIME) {
            delete ipTracker[ip]; 
        }
    }
}, WINDOW_TIME);

// สร้างฟังก์ชันยามเฝ้าประตู
const circuitBreaker = (req, res, next) => {
    // 🚨 C1: ระบุตัวตนด้วย IP Address
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // ถ้า IP นี้เพิ่งเคยเข้ามาครั้งแรก
    if (!ipTracker[clientIp]) {
        ipTracker[clientIp] = { count: 1, startTime: now };
        return next();
    }

    const tracker = ipTracker[clientIp];
    const timePassed = now - tracker.startTime;

    // 🚨 C3: Window Reset (ถ้าผ่านไปเกิน 10 วินาทีแล้ว ให้นับ 1 ใหม่)
    if (timePassed > WINDOW_TIME) {
        tracker.count = 1;
        tracker.startTime = now;
        return next();
    }

    // ถ้ายังอยู่ใน 10 วินาที ให้นับจำนวนครั้งเพิ่มขึ้น
    tracker.count += 1;

    // 🚨 C2 & C5: ถ้ากดยิงเกิน 5 ครั้ง ให้ตัดวงจร (Block) และแจ้งเวลาที่ต้องรอ
    if (tracker.count > MAX_LIMIT) {
        const remainingTimeMs = WINDOW_TIME - timePassed;
        const retryAfter = Math.ceil(remainingTimeMs / 1000); // แปลงเป็นวินาที

        return res.status(429).json({
            error: "Too Many Requests",
            message: "Too many requests, try again later",
            retry_after: retryAfter // ส่งเวลาที่เหลือให้ Frontend
        });
    }

    next(); // ถ้ายังไม่เกิน 5 ครั้ง ก็ให้ผ่านไปใช้งาน API ได้
};

// 🚨 เปิดใช้งาน Circuit Breaker กับทุก API ที่อยู่ด้านล่างนี้
app.use(circuitBreaker);

// นำเข้า Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const bandRoutes = require('./routes/bandRoutes');

// ================= ROUTES =================
app.use('/api/auth', authRoutes); 
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bands', bandRoutes);

// ==========================================
// 🎯 Function 3.2 - VibeCheck Health Monitoring
// ==========================================
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const memoryUsageBytes = process.memoryUsage().rss;
    const memoryUsageMB = (memoryUsageBytes / 1048576).toFixed(2); 
    const timestamp = new Date().toISOString();

    return res.status(200).json({
        status: "active",
        uptime_seconds: parseFloat(uptime.toFixed(2)), 
        memory_usage_mb: parseFloat(memoryUsageMB),    
        timestamp: timestamp,                          
        message: "VibeCheck API is running smoothly! 🚀"
    });
});

// ==========================================
// 🎯 Function 3.1 - The Identity Verification Server
// ==========================================
app.get('/scan', (req, res) => {
    const userToken = req.query.token; 
    console.log("Received token:", userToken);
    
    if (userToken === 'admin') {
        return res.status(200).json({
            status: "authorized",
            clearance: "high"
        });
    }

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

// ==========================================
// 🎯 Function 3.4 - Secure File Vault Streamer
// ==========================================
app.get('/stream/:filename', (req, res) => {
    // 🚨 C2: User-Agent Shield (การตรวจสอบหัวกระดาษ)
    // อ่านค่า User-Agent จาก Header ของคนที่เรียก API [cite: 1763]
    const userAgent = req.get('User-Agent') || '';
    
    // อนุญาตให้เฉพาะ Postman โหลดไฟล์ได้ ถ้าเป็นตัวอื่นให้เตะออกด้วย 403 Forbidden [cite: 1744]
    if (!userAgent.includes('PostmanRuntime')) {
        return res.status(403).json({
            error: "Forbidden",
            message: "Access denied. Please use the official VibeCheck client (Postman)."
        });
    }

    // กำหนด Path ไปหาไฟล์ในโฟลเดอร์ vault
    const filename = req.params.filename;
    // __dirname คือตำแหน่งไฟล์ server.js (src) เลยต้องถอยกลับไป 1 ชั้น (..) แล้วเข้า vault
    const filePath = path.join(__dirname, '../vault', filename);

    // 🚨 C3: Proper 404 Handling (การรับมือเมื่อไม่พบไฟล์)
    // เช็คว่าไฟล์มีอยู่จริงไหม ถ้าไม่มีให้ตอบ 404 แบบ JSON [cite: 1745, 1766]
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: "Not Found",
            message: "The requested file does not exist in the vault."
        });
    }

    // 🚨 C5: Content-Type Header (การระบุชนิดไฟล์ - Bonus)
    // ตรวจสอบนามสกุลไฟล์เพื่อส่ง Content-Type ให้ถูกต้อง [cite: 1775, 1776]
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // ค่า default
    if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.pdf') contentType = 'application/pdf';
    
    res.setHeader('Content-Type', contentType);

    // 🚨 C1 & C4: Streaming Protocol และ Memory Stability
    // สร้างท่ออ่านไฟล์ (ReadStream) ห้ามใช้ fs.readFile เด็ดขาด! [cite: 1742, 1757]
    const readStream = fs.createReadStream(filePath);

    // ดักจับ Error ระหว่างสตรีมไฟล์ ป้องกัน Server ล่ม [cite: 1767, 1784]
    readStream.on('error', (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error", message: "Error streaming file" });
        }
    });

    // ต่อท่อส่งข้อมูลตรงไปที่ Response ทีละส่วน (Chunks) [cite: 1756, 1758]
    readStream.pipe(res);
});

// ==========================================
// 🎯 Function 3.5 - API Gateway & Data Transformation
// ==========================================
app.get('/gateway/artist/:id', async (req, res) => {
    // 🚨 C5: Dynamic Path (รับค่า ID จาก URL ทำให้ยืดหยุ่น)
    const artistId = req.params.id;

    try {
        // 🚨 C1: Asynchronous Logic (ต้องมี await เสมอเวลารอข้อมูลข้าม Server)
        // จำลองดึงข้อมูลศิลปินจาก Public API ภายนอก
        const externalApiUrl = `https://jsonplaceholder.typicode.com/users/${artistId}`;
        const response = await fetch(externalApiUrl);

        // ดักจับกรณี API ภายนอกตอบกลับมาว่าไม่เจอข้อมูล (เช่น ใส่ ID 999)
        if (!response.ok) {
            throw new Error(`External API responded with status: ${response.status}`);
        }

        const rawData = await response.json();

        // 🚨 C2: Transformation Success (ยุบโครงสร้างข้อมูลให้แบนลง - Flatten)
        // ต้นฉบับมี address: { street, suite, city } ซ้อนกัน เราจับมารวมกันเป็นบรรทัดเดียว
        const transformedData = {
            artist_id: rawData.id,
            stage_name: rawData.username,
            full_name: rawData.name,
            contact_email: rawData.email,
            // แปลงข้อมูลที่ซ้อนกันให้อ่านง่ายขึ้น
            location: `${rawData.address.street}, ${rawData.address.suite}, ${rawData.address.city}`,
            label_company: rawData.company.name,
            website: rawData.website
        };

        // 🚨 C3: Header Injection (ประทับตรายืนยันว่าผ่าน Gateway ของเรา)
        // ⚠️ สำคัญมาก: เปลี่ยนเลขตรงนี้เป็นรหัสนิสิตของคุณจริงๆ นะครับ
        res.setHeader('X-Student-ID', '6633108621'); 

        return res.status(200).json({
            status: "success",
            message: "Data fetched and transformed successfully via VibeCheck Gateway",
            data: transformedData
        });

    } catch (error) {
        // 🚨 C4: Robust Error Handling (รับมือกรณี Server นอกล่ม หรือ URL พัง)
        console.error("Gateway Error:", error.message);
        
        // ประทับตรา Header ตอน Error ด้วย
        res.setHeader('X-Student-ID', '653XXXXX21'); 
        
        // ตอบกลับ 502 Bad Gateway พร้อม JSON สวยๆ (ห้ามขึ้น Error แดงในหน้าจอผู้ใช้)
        return res.status(502).json({
            error: "Bad Gateway",
            message: "ไม่สามารถดึงข้อมูลศิลปินจากเซิร์ฟเวอร์ภายนอกได้ในขณะนี้ กรุณาลองใหม่ภายหลัง"
        });
    }
});