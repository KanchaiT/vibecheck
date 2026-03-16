// backend/src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { searchPosts, getPosts, createPost, updatePost, deletePost, toggleLike, addComment } = require('../controllers/postController');

// สมมติว่าคุณมี authMiddleware (ถ้าไม่มี หรือไฟล์ชื่ออื่น ให้แก้ Path ด้วยนะครับ)
const { protect } = require('../middlewares/authMiddleware'); 

// 🚨 Function 4.4 (ไม่ต้องใช้ protect เพื่อให้เทส Postman ง่ายๆ)
router.get('/search', searchPosts);

// เส้นทางอื่นๆ (เอา upload.single ออกไปก่อน)
router.route('/')
  .get(protect, getPosts)
  .post(protect, createPost); // 👈 แก้ตรงนี้

router.route('/:id')
  .put(protect, updatePost) // 👈 แก้ตรงนี้
  .delete(protect, deletePost);

router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

module.exports = router;