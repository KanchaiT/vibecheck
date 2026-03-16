// backend/src/controllers/orderController.js
const Product = require('../models/Product');
const Order = require('../models/Order');

// ==========================================
// 🎯 Function 4.3 - Atomic Stock Management
// ==========================================

// @desc    สั่งซื้อสินค้าและตัดสต็อก
// @route   POST /api/orders
const createOrder = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // 1. Find: ถามหาของ
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    }

    // 2. Check: เช็คว่าพอไหม (C1: Pre-check Validation)
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: 'สต็อกสินค้าไม่เพียงพอ', 
        currentStock: product.stock 
      });
    }

    // 3. Server-side Calculation: ความถูกต้องของราคา (C3)
    // 🚨 ห้ามรับ totalPrice จาก req.body เด็ดขาด ป้องกัน User แอบแก้ราคา
    const calculatedTotalPrice = product.price * quantity; 

    // 4. Atomic Update: ตัดของแบบป้องกันคนแย่งกันซื้อ (C4)
    // 🚨 ใช้ findOneAndUpdate พร้อมเงื่อนไข stock: { $gte: quantity } เพื่อความชัวร์ระดับ Engine
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } }, // ต้องมั่นใจว่าสต็อกยังพอจริงๆ ในเสี้ยววินาทีนี้
      { $inc: { stock: -quantity } }, // สั่งให้ MongoDB ลบเลขเอง (Atomic)
      { new: true }
    );

    // ถ้าจังหวะนั้นมีคนซื้อตัดหน้าไปจนของหมดพอดี
    if (!updatedProduct) {
      return res.status(400).json({ message: 'อ๊ะ! มีคนซื้อตัดหน้าไปแล้ว สต็อกไม่พอครับ' });
    }

    // 5. Deduct Stock & Create Order: บันทึกการขาย (C2 & C5)
    try {
      const newOrder = await Order.create({
        productId,
        quantity,
        totalPrice: calculatedTotalPrice
      });

      res.status(201).json({
        message: 'สั่งซื้อสำเร็จ!',
        order: newOrder,
        remainingStock: updatedProduct.stock
      });
    } catch (orderError) {
      // 🚨 C5: Data Integrity (Error Recovery)
      // ถ้าสร้าง Order พัง (เช่น Database หลุด) ต้อง "คืนสต็อก" กลับไปให้ร้าน (Rollback)
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } } // บวกสต็อกคืน
      );
      return res.status(500).json({ message: 'ระบบขัดข้อง คืนสต็อกให้เรียบร้อยแล้ว' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder };