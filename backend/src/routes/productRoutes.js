const express = require('express');
const router = express.Router();
// 🚨 รับเข้ามาให้ครบทั้ง 4 ฟังก์ชัน ชื่อต้องตรงเป๊ะ
const { getProductStats, getProducts, getProductById, createProduct } = require('../controllers/productController');

// ==========================================
// 🎯 Routes
// ==========================================
// 🚨 ต้องวาง /stats ไว้ก่อน /:id เสมอ ไม่งั้นพังครับ
router.get('/stats', getProductStats); 

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);

module.exports = router;