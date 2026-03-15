// backend/src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  band: { type: mongoose.Schema.Types.ObjectId, ref: 'Band', required: true }, // ข้อความนี้ของวงไหน
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ใครเป็นคนพิมพ์
  text: { type: String, required: true }, // พิมพ์ว่าอะไร
}, { timestamps: true }); // เก็บเวลาที่พิมพ์อัตโนมัติ (createdAt)

module.exports = mongoose.model('Message', messageSchema);