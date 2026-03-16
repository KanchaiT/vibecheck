// backend/src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  // 🚨 C3: totalPrice ต้องคำนวณจากฝั่ง Server เท่านั้น
  totalPrice: { type: Number, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);