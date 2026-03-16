// backend/src/controllers/postController.js
const BandPost = require('../models/BandPost');
const Band = require('../models/Band');

// ==========================================
// 🎯 Function 4.4 - Multi-Tag Search & Pagination
// ==========================================
// @desc    ค้นหาโพสต์ด้วยแท็ก และแบ่งหน้า (Pagination)
// @route   GET /api/posts/search
const searchPosts = async (req, res) => {
  try {
    const { tags, page = 1, limit = 5 } = req.query;

    // ค้นหาเฉพาะโพสต์ที่ยังไม่ถูกลบ
    let query = { isDeleted: false };

    // 🚨 C2: Array Parsing (แปลง String เป็น Array)
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      // 🚨 C1: Exact Tag Matching (บังคับต้องมีแท็กครบทุกตัว)
      query.tags = { $all: tagsArray };
    }

    // 🚨 C3: Skip & Limit Logic
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipAmount = (pageNum - 1) * limitNum;

    const posts = await BandPost.find(query)
      .populate('user', 'username displayName')
      .populate('comments.user', 'username displayName')
      .skip(skipAmount)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // 🚨 C4: Pagination Metadata
    const totalPosts = await BandPost.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limitNum); // ปัดเศษขึ้นเสมอ

    // 🚨 C5: Empty Result Handling (ถ้าหาไม่เจอจะส่ง 200 OK พร้อม data เป็น Array ว่าง [])
    res.status(200).json({
      data: posts,
      metadata: {
        totalPosts,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// โค้ด VibeCheck เดิมของคุณ
// ==========================================

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
      mediaUrl: mediaUrl,   
      mediaType: mediaType, 
      tags: parsedTags
    });

    if (postType === 'BandFinder' && bandName) {
      // 1. ลองหาดูก่อน
      let currentBand = await Band.findOne({ 
        name: bandName, 
        leader: req.user._id 
      });

      // 2. ถ้ายังไม่มี ให้สร้างใหม่
      if (!currentBand) {
        currentBand = await Band.create({
          name: bandName,
          leader: req.user._id,
          members: [req.user._id] 
        });
        console.log(`🎉 สร้างวงใหม่สำเร็จ: ${bandName}`);
      }

      // 🚨 3. สำคัญมาก! เอา ID ของวงที่ได้ มาเซฟเก็บไว้ในโพสต์ด้วย!
      post.bandId = currentBand._id;
      await post.save();
    }

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

    if (!post) {
      return res.status(404).json({ message: 'ไม่พบโพสต์นี้' });
    }

    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบโพสต์นี้' });
    }

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

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id); 
    } else {
      post.likes.splice(index, 1); 
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
    await post.populate('comments.user', 'username displayName');
    
    res.json(post.comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🚨 อย่าลืม Export searchPosts ออกไปด้วย!
module.exports = { searchPosts, getPosts, createPost, deletePost, updatePost, toggleLike, addComment };