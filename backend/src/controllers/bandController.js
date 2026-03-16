// backend/src/controllers/bandController.js
const Band = require('../models/Band');
const Message = require('../models/Message');

// ==========================================
// 🎯 Function 4.1 - Create & Filter Bands
// ==========================================

// @desc    สร้างวงดนตรีใหม่
// @route   POST /api/bands
const createBand = async (req, res) => {
  try {
    // นำข้อมูลจาก body มาสร้างวง
    const bandData = {
      ...req.body,
      // ตั้งให้คนสร้างเป็น Leader และเป็นสมาชิกคนแรก (เผื่อรองรับทั้งตอนใช้ Token และเทส Postman เพียวๆ)
      leader: req.user ? req.user._id : req.body.leader,
      members: req.user ? [req.user._id] : [req.body.leader]
    };

    const newBand = await Band.create(bandData);
    
    // ส่ง Status 201 Created เมื่อสำเร็จ
    res.status(201).json(newBand);
  } catch (error) {
    // 🚨 ส่ง Error 400 กลับไปถ้า Validation ไม่ผ่าน (ดักจับราคาติดลบ, ชื่อซ้ำ, แนวเพลงผิด)
    res.status(400).json({ message: error.message });
  }
};

// @desc    ดึงข้อมูลวงดนตรีทั้งหมด พร้อมกรองราคา
// @route   GET /api/bands
const getBands = async (req, res) => {
  try {
    let query = {};
    
    // 🚨 ดักจับ Query Parameter (?minPrice=xxx) เพื่อกรองข้อมูล
    if (req.query.minPrice) {
      query.hourlyRate = { $gte: Number(req.query.minPrice) }; 
    }

    const bands = await Band.find(query)
      .populate('leader', 'username displayName')
      .populate('members', 'username displayName');
      
    res.status(200).json(bands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🎸 VibeCheck Business Logic
// ==========================================

// @desc    ดึงรายชื่อวงทั้งหมดที่ผู้ใช้ล็อกอินอยู่เป็นสมาชิก
// @route   GET /api/bands/my-bands
// @access  Private
const getMyBands = async (req, res) => {
  try {
    const bands = await Band.find({ 
      $or: [{ members: req.user._id }, { pendingMembers: req.user._id }] 
    })
      .populate('leader', 'username displayName') 
      .populate('members', 'username displayName majorInstrument')
      .populate('pendingMembers', 'username displayName majorInstrument'); 

    res.json(bands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ดึงข้อความแชทในวง
// @route   GET /api/bands/:bandId/messages
const getBandMessages = async (req, res) => {
  try {
    const messages = await Message.find({ band: req.params.bandId })
      .populate('sender', 'username displayName majorInstrument')
      .sort({ createdAt: 1 });
      
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    อัปเดตข้อมูลวง (ชื่อ, แนวเพลง, ช่องทางติดต่อ)
// @route   PUT /api/bands/:bandId
const updateBand = async (req, res) => {
  try {
    const band = await Band.findById(req.params.bandId);
    if (!band) return res.status(404).json({ message: 'ไม่พบวงดนตรี' });
    
    if (band.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'เฉพาะหัวหน้าวงเท่านั้นที่แก้ไขได้' });
    }

    band.name = req.body.name || band.name;
    band.genres = req.body.genres || band.genres;
    band.socialLinks = { ...band.socialLinks, ...req.body.socialLinks };

    await band.save();
    res.json(band);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    เตะสมาชิกออกจากวง
// @route   DELETE /api/bands/:bandId/members/:memberId
const removeMember = async (req, res) => {
  try {
    const band = await Band.findById(req.params.bandId);
    if (band.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'เฉพาะหัวหน้าวงเท่านั้นที่เตะสมาชิกได้' });
    }
    if (req.params.memberId === band.leader.toString()) {
      return res.status(400).json({ message: 'หัวหน้าวงเตะตัวเองไม่ได้ ต้องกด Leave Band หรือยุบวง' });
    }

    band.members = band.members.filter(m => m.toString() !== req.params.memberId);
    await band.save();
    res.json({ message: 'เตะสมาชิกออกเรียบร้อย' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ยุบวง (ลบวงทิ้ง)
// @route   DELETE /api/bands/:bandId
const deleteBand = async (req, res) => {
  try {
    const band = await Band.findById(req.params.bandId);
    if (band.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'เฉพาะหัวหน้าวงเท่านั้นที่ยุบวงได้' });
    }

    await band.deleteOne();
    res.json({ message: 'ยุบวงเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ส่งข้อความเข้าแชทวง
// @route   POST /api/bands/:bandId/messages
const sendBandMessage = async (req, res) => {
  try {
    const { text } = req.body;
    
    const newMessage = await Message.create({
      band: req.params.bandId,
      sender: req.user._id, 
      text: text
    });

    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username displayName majorInstrument');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ออกจากวงดนตรี
// @route   PUT /api/bands/:bandId/leave
const leaveBand = async (req, res) => {
  try {
    const band = await Band.findById(req.params.bandId);
    
    if (!band) {
      return res.status(404).json({ message: 'ไม่พบวงดนตรีนี้' });
    }

    band.members = band.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );

    await band.save();
    
    res.json({ message: 'ออกจากวงเรียบร้อยแล้ว หวังว่าจะได้ร่วมงานกันใหม่นะ!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    กดปุ่ม "I'm interested" ขอเข้าวง
// @route   POST /api/bands/:bandId/apply
const applyToBand = async (req, res) => {
  try {
    const band = await Band.findById(req.params.bandId);
    if (!band) return res.status(404).json({ message: 'ไม่พบวงดนตรี' });

    if (band.members.includes(req.user._id)) return res.status(400).json({ message: 'คุณอยู่ในวงนี้อยู่แล้ว' });
    if (band.pendingMembers.includes(req.user._id)) return res.status(400).json({ message: 'คุณกดขอเข้าร่วมไปแล้ว รอหัวหน้าวงอนุมัตินะ' });

    band.pendingMembers.push(req.user._id);
    await band.save();
    res.json({ message: 'ส่งคำขอเข้าร่วมวงเรียบร้อย!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    หัวหน้าวงกด "รับเข้าวง" (ติ๊กถูก)
// @route   PUT /api/bands/:bandId/accept/:userId
const acceptMember = async (req, res) => {
  try {
    const band = await Band.findById(req.params.bandId);
    if (band.leader.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'เฉพาะหัวหน้าวงเท่านั้นที่รับคนได้' });

    band.pendingMembers = band.pendingMembers.filter(id => id.toString() !== req.params.userId);
    if (!band.members.includes(req.params.userId)) {
      band.members.push(req.params.userId);
    }
    
    await band.save();
    res.json({ message: 'รับสมาชิกใหม่เข้าวงแล้ว!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    หัวหน้าวงกด "ปฏิเสธ" (กากบาท)
// @route   PUT /api/bands/:bandId/reject/:userId
const rejectMember = async (req, res) => {
  try {
    const band = await Band.findById(req.params.bandId);
    if (band.leader.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'เฉพาะหัวหน้าวงเท่านั้น' });

    band.pendingMembers = band.pendingMembers.filter(id => id.toString() !== req.params.userId);
    
    await band.save();
    res.json({ message: 'ปฏิเสธคำขอเรียบร้อย' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚨 อย่าลืม Export 2 ฟังก์ชันใหม่ไปด้วย!
module.exports = { 
  createBand, 
  getBands, 
  getMyBands, 
  getBandMessages, 
  sendBandMessage, 
  leaveBand, 
  updateBand, 
  removeMember, 
  deleteBand, 
  applyToBand, 
  acceptMember, 
  rejectMember 
};