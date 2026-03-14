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
const createPost = async (req, res) => {
  try {
    const { postType, roleNeeded, bandName, title, content, imageUrl, tags } = req.body;

    // ตรวจสอบความถูกต้องของข้อมูลตามประเภทโพสต์
    if (postType === 'BandFinder' && (!roleNeeded || !bandName)) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อวงและตำแหน่งที่ต้องการให้ครบถ้วน' });
    }
    if (postType === 'Knowledge' && (!title || !content)) {
      return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหาความรู้ให้ครบถ้วน' });
    }

    const post = await BandPost.create({ // ใช้ชื่อ Model ตามที่คุณ import ไว้ด้านบน
      user: req.user._id,
      postType: postType || 'BandFinder',
      roleNeeded,
      bandName,
      title,
      content,
      imageUrl,
      tags
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