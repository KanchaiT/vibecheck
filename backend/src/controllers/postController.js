// backend/src/controllers/postController.js
const BandPost = require('../models/BandPost');

// @desc    ดึงข้อมูลโพสต์หาเพื่อนร่วมวงทั้งหมด (ที่ไม่ถูก Soft Delete)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const posts = await BandPost.find({ isDeleted: false })
      .populate('user', 'username displayName')
      .populate('comments.user', 'username displayName') // 👈 เพิ่มบรรทัดนี้!
      .sort({ createdAt: -1 });
    res.json(posts);
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

// @desc    แก้ไขโพสต์
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await BandPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'ไม่พบโพสต์นี้' });

    // เช็คสิทธิ์: ต้องเป็นเจ้าของโพสต์ หรือ Admin ถึงจะแก้ได้
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'คุณไม่มีสิทธิ์แก้ไขโพสต์นี้' });
    }

    const { postType, roleNeeded, bandName, title, content, tags } = req.body;

    // อัปเดตข้อมูลตัวหนังสือ
    post.postType = postType || post.postType;
    if (postType === 'BandFinder') {
      post.roleNeeded = roleNeeded;
      post.bandName = bandName;
    } else {
      post.title = title;
      post.content = content;
    }

    // อัปเดต Tags
    if (tags) {
      post.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    } else {
      post.tags = [];
    }

    // ถ้ามีการอัปโหลดไฟล์ "ใหม่" เข้ามา ให้เปลี่ยนลิงก์ (ถ้าไม่มี ก็ใช้รูปเดิม)
    if (req.file) {
      post.mediaUrl = req.file.path;
      post.mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
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

// @desc    กด Like / ยกเลิก Like
// @route   PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await BandPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'ไม่พบโพสต์' });

    // เช็คว่าเคยไลก์หรือยัง
    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id); // ยังไม่เคยไลก์ -> กดไลก์
    } else {
      post.likes.splice(index, 1); // เคยไลก์แล้ว -> ยกเลิกไลก์ (Unlike)
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    เพิ่มคอมเมนต์
// @route   POST /api/posts/:id/comment
const addComment = async (req, res) => {
  try {
    const post = await BandPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'ไม่พบโพสต์' });

    const newComment = { user: req.user._id, text: req.body.text };
    post.comments.push(newComment);
    
    await post.save();
    // ดึงข้อมูลชื่อคนคอมเมนต์กลับไปให้หน้าบ้านด้วย
    await post.populate('comments.user', 'username displayName');
    
    res.json(post.comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getPosts, createPost, deletePost, updatePost, toggleLike, addComment };