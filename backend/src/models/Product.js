// backend/src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  // เปลี่ยนหมวดหมู่ให้เข้ากับร้านขายของวงดนตรี
  category: { 
    type: String, 
    enum: ['Clothing', 'Accessory', 'Album', 'Electronic'],
    required: true
  },
  originalPrice: { type: Number, required: true }, // ราคาเต็ม [cite: 211]
  discountPercent: { type: Number, default: 0 },   // เปอร์เซ็นต์ส่วนลด [cite: 212]
  stock: { type: Number, required: true, min: 0 }  // เก็บไว้เผื่อเทส 4.3
}, { 
  timestamps: true,
  // 🚨 C4: Schema Configuration (ต้องใส่บรรทัดนี้ ไม่งั้นฟิลด์เสมือนจะไม่โชว์ใน JSON)
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🚨 C1 & C2: สร้าง Virtual Field ชื่อ 'salePrice' (คำนวณราคาหลังหักส่วนลด)
// สูตร: originalPrice * ((100 - discountPercent) / 100)
productSchema.virtual('salePrice').get(function() {
  return this.originalPrice * ((100 - this.discountPercent) / 100);
});

module.exports = mongoose.model('Product', productSchema);