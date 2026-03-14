// backend/src/routes/bandRoutes.js
const express = require('express');
const router = express.Router();
const { getMyBand, leaveBand, createBand } = require('../controllers/bandController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createBand); // เอาไว้สร้างวงใหม่
router.route('/myband').get(protect, getMyBand); // เอาไว้ดึงข้อมูลวงของฉัน
router.route('/leave').put(protect, leaveBand); // เอาไว้กดออกจากวง

module.exports = router;