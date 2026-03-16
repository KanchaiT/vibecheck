// backend/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');

// ==========================================
// 🎯 Function 4.3 - Order Routes
// ==========================================

// @route   POST /api/orders
// @desc    สั่งซื้อสินค้าและตัดสต็อก (Atomic Stock Management)
router.post('/', createOrder);

module.exports = router;