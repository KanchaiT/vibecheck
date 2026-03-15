// backend/src/controllers/bandController.js
const Band = require('../models/Band');
const Message = require('../models/Message');

// @desc    ดึงรายชื่อวงทั้งหมดที่ผู้ใช้ล็อกอินอยู่เป็นสมาชิก
// @route   GET /api/bands/my-bands
// @access  Private
const getMyBands = async (req, res) => {
  try {
    // 🚨 เปลี่ยนเงื่อนไขการหา ให้หาทั้งใน members และ pendingMembers
    const bands = await Band.find({ 
      $or: [{ members: req.user._id }, { pendingMembers: req.user._id }] 
    })
      .populate('leader', 'username displayName') 
      .populate('members', 'username displayName majorInstrument')
      // 🚨 อย่าลืม populate ข้อมูลของคนรอเข้าวงด้วย
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
    // หาข้อความทั้งหมดที่ตรงกับ ID วง และเรียงจากเก่าไปใหม่
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
    
    // เช็คสิทธิ์: ต้องเป็นหัวหน้าวงเท่านั้น
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
    
    // สร้างข้อความใหม่
    const newMessage = await Message.create({
      band: req.params.bandId,
      sender: req.user._id, // เอา ID คนที่กำลังล็อกอินมาเป็นคนส่ง
      text: text
    });

    // ดึงข้อมูลคนส่งกลับมาด้วย หน้าบ้านจะได้เอาไปโชว์รูปโปรไฟล์ได้
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

    // เอา ID ของเรา (req.user._id) ออกจากอาร์เรย์ members
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

    // เช็คว่าอยู่ในวงอยู่แล้ว หรือกดสมัครไปแล้วหรือเปล่า
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

    // ย้ายจาก pending -> members
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

    // ลบออกจาก pending เฉยๆ
    band.pendingMembers = band.pendingMembers.filter(id => id.toString() !== req.params.userId);
    
    await band.save();
    res.json({ message: 'ปฏิเสธคำขอเรียบร้อย' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyBands, getBandMessages, sendBandMessage, leaveBand, updateBand, removeMember, deleteBand, applyToBand, acceptMember, rejectMember };