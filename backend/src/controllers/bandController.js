// backend/src/controllers/bandController.js
const Band = require('../models/Band');

// @desc    ดึงข้อมูลวงดนตรีที่ตัวเองเป็นสมาชิกอยู่
// @route   GET /api/bands/myband
// @access  Private
const getMyBand = async (req, res) => {
  try {
    // ค้นหาวงที่มี ID ของเราอยู่ใน Array ของ members
    // พร้อมกับ .populate() เพื่อดึง username และ displayName ของทุกคนในวงมาด้วย
    const band = await Band.findOne({ "members.user": req.user._id })
                           .populate('members.user', 'username displayName');
    
    // ถ้าไม่เจอวง (ยังไม่ได้เข้าวงไหนเลย) ส่งค่า null กลับไป
    if (!band) {
      return res.status(200).json(null);
    }

    res.status(200).json(band);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    กดออกจากวง
// @route   PUT /api/bands/leave
// @access  Private
const leaveBand = async (req, res) => {
  try {
    const band = await Band.findOne({ "members.user": req.user._id });
    
    if (!band) {
      return res.status(404).json({ message: 'คุณยังไม่มีวง' });
    }

    // Function 1.1: ใช้ .filter() กรองเอาตัวเราเองออกจาก Array สมาชิกวง
    band.members = band.members.filter(
      (member) => member.user.toString() !== req.user._id.toString()
    );

    // ถ้ายกวงออกไปหมดแล้ว (ไม่มีสมาชิกเหลือ) อาจจะเขียนโค้ดลบวงทิ้งเลยก็ได้
    // แต่เคสนี้เราแค่เซฟรายชื่อสมาชิกใหม่ที่ไม่มีเรา
    await band.save();

    res.status(200).json({ message: 'คุณได้ออกจากวงเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    สร้างวงใหม่ (ไว้สำหรับทดสอบ)
// @route   POST /api/bands
// @access  Private
const createBand = async (req, res) => {
  try {
    const { name, genres, contact, role } = req.body;
    
    // เช็คก่อนว่ามีวงอยู่แล้วหรือเปล่า (1 คน อยู่ได้ 1 วง)
    const existingBand = await Band.findOne({ "members.user": req.user._id });
    if (existingBand) {
      return res.status(400).json({ message: 'คุณมีวงอยู่แล้ว ต้องออกจากวงเดิมก่อน' });
    }

    const newBand = await Band.create({
      name,
      genres,
      contact,
      members: [{ user: req.user._id, role: role || "Founder", isLeader: true }]
    });

    res.status(201).json(newBand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyBand, leaveBand, createBand };