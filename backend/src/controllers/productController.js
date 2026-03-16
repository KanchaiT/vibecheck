// backend/src/controllers/productController.js
const Product = require('../models/Product');

// @desc    ดึงข้อมูลสินค้าทั้งหมด
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ดึงข้อมูลสินค้าตาม ID (เอาไว้ดูสต็อกรายชิ้น)
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    สร้างสินค้าใหม่เข้าคลัง
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    
    const newProduct = await Product.create({
      name,
      price,
      stock
    });

    res.status(201).json({
      message: 'เพิ่มสินค้าเข้าคลังเรียบร้อย!',
      product: newProduct
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ส่งออกแบบ CommonJS
module.exports = { getProducts, getProductById, createProduct };