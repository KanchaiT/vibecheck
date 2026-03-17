// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🚨 นำเข้าไลบรารีสำหรับ Function 5.5
const rateLimit = require('express-rate-limit');
const tokenBlacklist = require('../utils/blacklist');

// ==========================================
// 🎯 Function 5.5 - Rate Limiting (จำกัดการ Login 5 ครั้ง/15 นาที)
// ==========================================
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // 🚨 C1: จำกัด IP ละ 5 ครั้ง
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' }, 
  standardHeaders: true,
  legacyHeaders: false,
});

// ฟังก์ชันสร้าง JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m', 
  });
};

// @desc    ลงทะเบียนผู้ใช้ใหม่ (Register)
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { username, password, majorInstrument, email } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username นี้ถูกใช้งานแล้ว' });
    }

    const user = await User.create({
      username,
      password,
      majorInstrument,
      email
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        majorInstrument: user.majorInstrument,
        email: user.email,
        // (เอา token ออกจาก Body ตามหลัก Security)
      });
    } else {
      res.status(400).json({ message: 'ข้อมูลผู้ใช้ไม่ถูกต้อง' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    เข้าสู่ระบบ (Login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🚨 C1: ต้องใช้ .select('+password') เพื่อดึงรหัสผ่านมาเช็คแบบ Explicit
    const user = await User.findOne({ username }).select('+password');

    // ตรวจสอบว่ามี User และรหัสผ่านตรงกันไหม
    if (user && (await user.matchPassword(password))) {
      
      const token = generateToken(user._id);

      // 🚨 C3: ส่ง Token กลับไปผ่าน HttpOnly Cookie เท่านั้น ห้ามส่งใน JSON Body
      const cookieOptions = {
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 นาที
        httpOnly: true, // ป้องกัน XSS (JavaScript ขโมยไม่ได้)
        secure: process.env.NODE_ENV === 'production' 
      };

      res.cookie('jwt', token, cookieOptions);

      // 🚨 ส่งแค่ข้อมูล User กลับไปให้ Frontend (ไม่มี token ในนี้แล้ว)
      return res.json({
        _id: user._id,
        username: user.username,
        majorInstrument: user.majorInstrument,
        role: user.role
      });
    } else {
      // 🚨 Function 5.5 (C2): Login Delay (Artificial Latency)
      // หน่วงเวลา 2 วินาที "เฉพาะตอนรหัสผิด" เพื่อสกัดแฮกเกอร์
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 🚨 C2 (5.2): ข้อความ Error ต้อง Generic (ห้ามบอกแยกกัน)
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🎯 Function 5.5 - Logout & Invalidation (The Blacklist)
// ==========================================
// @desc    ออกจากระบบ (Logout)
// @route   POST /api/auth/logout
exports.logoutUser = (req, res) => {
  let token;
  // 1. ดึง Token ออกมาจาก Cookie หรือ Header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. 🚨 C3: นำ Token นี้ใส่ใน Blacklist ทันที (Invalidate)
  if (token) {
    tokenBlacklist.push(token);
  }

  // 3. ลบ Cookie ออกจากฝั่งเบราว์เซอร์
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    ดูข้อมูลโปรไฟล์คนอื่น
// @route   GET /api/auth/users/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    เปลี่ยนรหัสผ่าน (Change Password)
// @route   PUT /api/auth/updateMyPassword
exports.updatePassword = async (req, res) => {
  try {
    // 1. ดึง User จาก DB พร้อมรหัสผ่าน (req.user มาจาก middleware protect)
    const user = await User.findById(req.user.id).select('+password');

    // 2. เช็คว่ารหัสผ่านเดิมถูกไหม
    if (!(await user.matchPassword(req.body.passwordCurrent))) {
      return res.status(401).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }

    // 3. อัปเดตรหัสผ่านใหม่
    user.password = req.body.password;
    user.passwordChangedAt = Date.now() - 1000; 
    
    await user.save();

    // 4. ส่ง Token ใหม่กลับไป (ล็อกอินให้อัตโนมัติหลังเปลี่ยนรหัส)
    const token = generateToken(user._id);
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 15 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({ status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};