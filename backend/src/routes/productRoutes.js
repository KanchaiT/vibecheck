// backend/src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct } = require('../controllers/productController');

// โยง Route สำหรับจัดการสินค้า
router.get('/', getProducts);          // ดึงทั้งหมด
router.get('/:id', getProductById);    // ดึงเฉพาะชิ้น
router.post('/', createProduct);       // สร้างใหม่

module.exports = router;