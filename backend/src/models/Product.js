// backend/src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // 🚨 สต็อกห้ามติดลบเด็ดขาด
  stock: { type: Number, required: true, min: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);