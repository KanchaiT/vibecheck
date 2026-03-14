// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // เช็คว่ามี Header Authorization และขึ้นต้นด้วย Bearer ไหม
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // ดึง Token ออกมา (ตัดคำว่า Bearer ออก)
      token = req.headers.authorization.split(' ')[1];

      // ถอดรหัส Token ด้วย Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // หา User จาก ID ที่อยู่ใน Token (และไม่เอาฟิลด์ password มาด้วย)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // ผ่านด่านได้! ไปทำงานที่ Controller ต่อ
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };