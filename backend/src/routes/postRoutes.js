const express = require('express');
const router = express.Router();
const { getPosts, createPost, deletePost, updatePost, toggleLike, addComment,  } = require('../controllers/postController');
const { protect,restrictTo } = require('../middlewares/authMiddleware');

// 🚨 นำเข้าตัวอัปโหลด
const upload = require('../config/cloudinary'); 

// 🚨 จุดสำคัญ 1: ตรง .post() ต้องมี upload.single('mediaFile') แทรกอยู่
router.route('/')
  .get(protect, getPosts)
  .post(protect, upload.single('mediaFile'), createPost);

router.get('/editor-only', protect, restrictTo('editor', 'manager'), (req, res) => {
  res.status(200).json({ message: 'ยินดีต้อนรับเข้าสู่โซน VIP สำหรับ Editor, Manager และ Admin ครับ!' });
});

// 🚨 จุดสำคัญ 2: ตรง .put() ก็ต้องมี upload.single('mediaFile') แทรกอยู่เหมือนกัน
router.route('/:id')
  .delete(protect, restrictTo('editor', 'manager'), deletePost)
  .put(protect, upload.single('mediaFile'), updatePost);

router.route('/:id/like').put(protect, toggleLike);
router.route('/:id/comment').post(protect, addComment);

module.exports = router;