// backend/src/models/Band.js
const mongoose = require('mongoose');

const bandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // เก็บรายชื่อสมาชิกในวง (ตอนสร้างวง หัวหน้าจะถูกจับยัดเข้ามาในนี้อัตโนมัติ)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // เก็บช่องทางการติดต่อ (เอาไว้ทำหน้าโปรไฟล์วง)
  socialLinks: {
    youtube: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    phone: { type: String, default: "" }, // 🚨 เติมเบอร์โทรเข้ามาตรงนี้!
  },
  
  // เดี๋ยวเราค่อยมาเพิ่มโครงสร้างห้องแชทในนี้ทีหลังครับ เอาโครงหลักก่อน
}, { timestamps: true });

module.exports = mongoose.model('Band', bandSchema);