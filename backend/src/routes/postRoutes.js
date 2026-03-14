const express = require('express');
const router = express.Router();
// นำเข้า deletePost เพิ่มเข้ามา
const { getPosts, createPost, deletePost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getPosts).post(protect, createPost);

// เพิ่ม Route สำหรับลบโพสต์ (ต้องผ่าน protect ก่อน)
router.route('/:id').delete(protect, deletePost);

module.exports = router;