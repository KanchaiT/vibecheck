const express = require('express');
const router = express.Router();
const { getPosts, createPost, deletePost, updatePost, toggleLike, addComment } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

// 🚨 จุดสำคัญ: ต้อง import อุปกรณ์อัปโหลดมาด้วย
const upload = require('../config/cloudinary'); 

// 🚨 สังเกตตรง .post() ต้องมี upload.single('mediaFile') แทรกอยู่ตรงกลาง
router.route('/').get(protect, getPosts).post(protect, upload.single('mediaFile'), createPost);

router.route('/:id')
    .delete(protect, deletePost)
    .put(protect, upload.single('mediaFile'), updatePost);

router.route('/:id/like').put(protect, toggleLike);
router.route('/:id/comment').post(protect, addComment);

module.exports = router;