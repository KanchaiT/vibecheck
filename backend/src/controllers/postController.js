// backend/src/controllers/postController.js
const BandPost = require('../models/BandPost');

// @desc    ดึงข้อมูลโพสต์หาเพื่อนร่วมวงทั้งหมด (ที่ไม่ถูก Soft Delete)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    // หาโพสต์ที่ isDeleted เป็น false และดึงข้อมูล username ของคนโพสต์มาด้วย
    const posts = await BandPost.find({ isDeleted: false })
                                .populate('user', 'username profilePicture')
                                .sort({ createdAt: -1 }); // เรียงจากใหม่ไปเก่า
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    สร้างโพสต์
// @route   POST /api/posts
// @access  Private
// ในฟังก์ชัน createPost...
const createPost = async (req, res) => {
  try {

    console.log("🔥 ข้อมูลตัวหนังสือ:", req.body);
    console.log("📸 ไฟล์รูป/วิดีโอ:", req.file);
      
    const { postType, roleNeeded, bandName, title, content, tags } = req.body;
    
    // 👈 ตรวจสอบว่ามีการอัปโหลดไฟล์มาหรือไม่
    let mediaUrl = "";
    let mediaType = "";
    
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image'; 
    }

    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // 2. สั่งเซฟลง Database
    const post = await BandPost.create({
      user: req.user._id,
      postType: postType || 'BandFinder',
      roleNeeded,
      bandName,
      title,
      content,
      mediaUrl: mediaUrl,   // 👈 เช็คตรงนี้! ลืมใส่ 2 บรรทัดนี้หรือเปล่าครับ?
      mediaType: mediaType, // 👈 เช็คตรงนี้!
      tags: parsedTags
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    ลบโพสต์ (Soft Delete)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await BandPost.findById(req.params.id);

    // เช็คว่ามีโพสต์นี้ไหม
    if (!post) {
      return res.status(404).json({ message: 'ไม่พบโพสต์นี้' });
    }

    // ==========================================
    // ตรวจสอบสิทธิ์: ต้องเป็น "เจ้าของโพสต์" หรือ "Admin" เท่านั้น
    // ==========================================
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบโพสต์นี้' });
    }

    // Function 4.2: ทำ Soft Delete (เปลี่ยนสถานะ ไม่ได้ลบจริง)
    post.isDeleted = true;
    await post.save();

    res.status(200).json({ message: 'ลบประกาศสำเร็จ (Soft Delete)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPosts, createPost, deletePost };