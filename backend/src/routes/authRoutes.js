// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { registerUser, loginUser, getUserProfile, updatePassword, logoutUser, loginLimiter } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/users/:id', getUserProfile);
router.put('/updateMyPassword', protect, updatePassword);
router.post('/logout', protect, logoutUser);

module.exports = router;