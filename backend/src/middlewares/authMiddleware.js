// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🚨 1. ต้อง Import ตัว Blacklist array เข้ามาด้วยนะครับ
const tokenBlacklist = require('../utils/blacklist'); 

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. รับ Token จาก Header (Bearer) หรือจาก Cookie (jwt)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) { // 👈 รองรับ Cookie จาก Function 5.2
      token = req.cookies.jwt;
    }

    // ถ้าไม่มี Token เลย
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // ==========================================
    // 🚨 2. Function 5.5 (C5): เช็ค Blacklist "ก่อน" ทำอย่างอื่น
    // ==========================================
    if (tokenBlacklist.includes(token)) {
      return res.status(401).json({ message: 'Token is invalidated (Logged out)' });
    }

    // 3. ถอดรหัสและยืนยัน Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. 🚨 C1: ตรวจสอบว่า User ยังมีตัวตนไหม (The Ghost Check)
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ 
        message: 'User belonging to this token no longer exist' 
      });
    }

    // 5. 🚨 C2 & C3: ตรวจสอบว่า User เพิ่งเปลี่ยนรหัสผ่านหลังจากออก Token หรือไม่ 
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ 
        message: 'User recently changed password! Please log in again.' 
      });
    }

    // 6. 🚨 C4: ฉีดข้อมูลผู้ใช้ (Decoded Payload Injection) 
    req.user = currentUser;
    next(); // ผ่านด่านได้! ไปทำงานที่ Controller ต่อ

  } catch (error) {
    // 🚨 C5: การดักจับ Error (Error Handling Check) ป้องกันเซิร์ฟเวอร์ค้าง 
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your token has expired! Please log in again.' });
    }
    // ถ้าเป็น Error อื่นๆ
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🎯 Function 5.4 - Dynamic Role-Based Access Control
// ==========================================
const restrictTo = (...allowedRoles) => { 
  // 🚨 ต้องห่อด้วย return (req, res, next) => { ... } ตรงนี้ครับ!
  return (req, res, next) => {
    
    // 1. 🚨 C2: The Hierarchy Logic (Hard Mode)
    // ถ้าเป็น admin ให้ผ่านได้เสมอโดยไม่ต้องสนว่าใน allowedRoles จะมีชื่อ admin หรือไม่ 
    if (req.user.role === 'admin') {
      return next(); 
    }

    // 2. 🚨 C1 & C3: ตรวจสอบว่า Role ของ User อยู่ในรายชื่อที่อนุญาตหรือไม่ 
    if (!allowedRoles.includes(req.user.role)) {
      // 🚨 C4: ถ้าไม่มีสิทธิ์ ต้องตอบ 403 Forbidden (ห้ามตอบ 401 เด็ดขาด!) 
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }

    // ถ้าสิทธิ์ถึง ก็ให้ไปทำงานที่ Controller ต่อ
    next();
  };
};

// 🚨 อย่าลืม Export restrictTo ออกไปด้วยนะครับ
module.exports = { protect, restrictTo };