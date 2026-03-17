const express = require('express');
const router = express.Router();
// 🚨 อย่าลืม import 2 ฟังก์ชันใหม่เข้ามาด้วย
const { createBand, getBands, getMyBands, getBandMessages, sendBandMessage, leaveBand, updateBand, removeMember, deleteBand, applyToBand, acceptMember, rejectMember } = require('../controllers/bandController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/my-bands', protect, getMyBands);
router.put('/:bandId/leave', protect, leaveBand);

router.put('/:bandId', protect, updateBand); // แก้ไขข้อมูลวง
router.delete('/:bandId/members/:memberId', protect, removeMember); // เตะคน
router.delete('/:bandId', protect, deleteBand); // ยุบวง

// ==========================================
// 🚨 เส้นทางสำหรับระบบแชท
// ==========================================
router.get('/:bandId/messages', protect, getBandMessages); // ดึงข้อความ
router.post('/:bandId/messages', protect, sendBandMessage); // ส่งข้อความ

router.post('/:bandId/apply', protect, applyToBand); // คนนอกกดขอเข้า
router.put('/:bandId/accept/:userId', protect, acceptMember); // หัวหน้ากดรับ
router.put('/:bandId/reject/:userId', protect, rejectMember); // หัวหน้ากดปัดตก

router.post('/', protect, createBand);
router.get('/', protect, getBands);

module.exports = router;