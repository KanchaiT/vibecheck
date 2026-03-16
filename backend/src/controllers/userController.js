// backend/src/controllers/userController.js
const User = require('../models/User');

// ลบคำว่า export ออก ใช้แค่ const ปกติ
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // รับค่าใหม่มาอัปเดต (ถ้าไม่ได้ส่งค่ามา ให้ใช้ค่าเดิม)
      user.majorInstrument = req.body.majorInstrument || user.majorInstrument;
      user.displayName = req.body.displayName !== undefined ? req.body.displayName : user.displayName;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.vibeTags = req.body.vibeTags || user.vibeTags;
      user.youtubeUrl = req.body.youtubeUrl !== undefined ? req.body.youtubeUrl : user.youtubeUrl;
      user.spotifyUrl = req.body.spotifyUrl !== undefined ? req.body.spotifyUrl : user.spotifyUrl;
      
      const updatedUser = await user.save();

      // ส่งข้อมูลทั้งหมดกลับไปให้ Frontend
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        majorInstrument: updatedUser.majorInstrument,
        role: updatedUser.role,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        vibeTags: updatedUser.vibeTags,
        youtubeUrl: updatedUser.youtubeUrl,
        spotifyUrl: updatedUser.spotifyUrl
      });
    } else {
      res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ดึงรายชื่อสมาชิก (เฉพาะคนที่ยังไม่ถูกลบ)
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    // 🚨 C4: กรองเอาเฉพาะคนที่ isDeleted เป็น false เท่านั้น
    const users = await User.find({ isDeleted: false }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ลบผู้ใช้งานแบบ Soft Delete
// @route   DELETE /api/users/:id
const softDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    // 🚨 C5: จัดการ Error กรณีหา User ไม่เจอ (ป้องกัน 500)
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
    }

    // 🚨 C2: เปลี่ยนสถานะแทนการใช้คำสั่ง findByIdAndDelete
    user.isDeleted = true;
    
    // 🚨 C3: บันทึกเวลาที่กดลบ (ISO Date)
    user.deletedAt = new Date(); 

    await user.save();

    // 🚨 C5: Response สวยงาม มีข้อความแจ้งเตือนชัดเจน
    res.status(200).json({ 
      message: 'ลบข้อมูลสำเร็จ (Soft Delete)', 
      user: {
        _id: user._id,
        username: user.username,
        isDeleted: user.isDeleted,
        deletedAt: user.deletedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    สร้างผู้ใช้งานใหม่
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    const { username, email, password, majorInstrument } = req.body;
    
    // สร้าง User ใหม่ (Mongoose จะแอบเติม isDeleted: false ให้อัตโนมัติ)
    const user = await User.create({
      username,
      email,
      password,
      majorInstrument
    });

    // 🚨 ส่งข้อมูลกลับไปโชว์อาจารย์ให้เห็นชัดๆ ว่าฟิลด์นี้เป็น false จริงๆ
    res.status(201).json({
      message: "สร้างผู้ใช้งานสำเร็จ",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isDeleted: user.isDeleted, // 👈 โชว์จุดนี้ตอนพรีเซนต์
        deletedAt: user.deletedAt
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ส่งออกแบบ CommonJS รวดเดียวจบ
module.exports = { updateUserProfile, getUsers, softDeleteUser, createUser };