const express = require('express');
const router = express.Router();
const { updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware'); // เรียกยามมาเฝ้า

// ต้องมี Token (protect) ถึงจะยิง PUT มาเพื่ออัปเดตได้
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;