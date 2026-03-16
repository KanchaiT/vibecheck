const express = require('express');
const router = express.Router();
const { updateUserProfile, getUsers, softDeleteUser, createUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware'); // เรียกยามมาเฝ้า

// ต้องมี Token (protect) ถึงจะยิง PUT มาเพื่ออัปเดตได้
router.route('/profile').put(protect, updateUserProfile);
router.get('/', getUsers);
router.post('/', createUser);
router.delete('/:id', softDeleteUser);

module.exports = router;