// backend/src/models/Band.js
const mongoose = require('mongoose');

const bandSchema = new mongoose.Schema({
  // 🚨 C4: แก้ไข name ให้บังคับกรอก (required) และห้ามตั้งชื่อวงซ้ำ (unique) [cite: 288, 308]
  name: { 
    type: String, 
    required: [true, 'กรุณาระบุชื่อวงดนตรี'],
    unique: true 
  },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 🚨 C2: เพิ่มฟิลด์เรทราคาจ้างงาน เพื่อทดสอบห้ามติดลบ (min: 0) [cite: 289, 301]
  hourlyRate: {
    type: Number,
    required: [true, 'กรุณาระบุเรทราคาจ้างงาน'],
    min: [0, 'เรทราคาจ้างงานห้ามติดลบ (ต้องมากกว่าหรือเท่ากับ 0)']
  },

  // 🚨 C3: เพิ่มแนวเพลงหลัก เพื่อทดสอบการบังคับเลือก (enum) [cite: 290, 305]
  genre: {
    type: String,
    required: [true, 'กรุณาระบุแนวเพลงหลัก'],
    enum: {
      values: ['Rock', 'Pop', 'Jazz', 'Indie'],
      message: 'แนวเพลง {VALUE} ไม่ได้รับอนุญาต (ต้องเป็น Rock, Pop, Jazz หรือ Indie เท่านั้น)'
    }
  },

  // เก็บรายชื่อสมาชิกในวง (ตอนสร้างวง หัวหน้าจะถูกจับยัดเข้ามาในนี้อัตโนมัติ)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // เก็บช่องทางการติดต่อ (เอาไว้ทำหน้าโปรไฟล์วง)
  socialLinks: {
    youtube: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    phone: { type: String, default: "" }, 
  },
  
// 🚨 C6: มี timestamps: true อยู่แล้ว แจ่มมากครับ! มันจะสร้าง createdAt ให้อัตโนมัติ [cite: 291, 316]
}, { timestamps: true }); 

module.exports = mongoose.model('Band', bandSchema);