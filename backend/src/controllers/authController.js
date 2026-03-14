// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ฟังก์ชันสร้าง JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    ลงทะเบียนผู้ใช้ใหม่ (Register)
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { username, password, majorInstrument } = req.body;

    // เช็คว่ามี Username นี้หรือยัง
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username นี้ถูกใช้งานแล้ว' });
    }

    // สร้าง User ใหม่ (Mongoose จะ Hash รหัสผ่านให้อัตโนมัติจาก pre-save hook)
    const user = await User.create({
      username,
      password,
      majorInstrument
    });

    if (user) {
      // Function 5.1: ส่งข้อมูลกลับไปโดยไม่มี Password หลุดไป
      res.status(201).json({
        _id: user._id,
        username: user.username,
        majorInstrument: user.majorInstrument,
        token: generateToken(user._id)
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

    // หา User จาก Username
    const user = await User.findOne({ username });

    // ตรวจสอบว่ามี User และรหัสผ่านตรงกันไหม
    if (user && (await user.matchPassword(password))) {
      // Function 5.2: ส่งมอบ JWT กลับไปให้ Frontend
      res.json({
        _id: user._id,
        username: user.username,
        majorInstrument: user.majorInstrument,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Username หรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};