// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'กรุณากรอก Username'], 
    unique: true,
    trim: true 
  },
  // 🚨 ข้อควรระวังสำหรับระบบ VibeCheck เดิม: ต้องเพิ่ม email ด้วยตามโจทย์ 4.2 บังคับ
  email: { 
    type: String, 
    required: [true, 'กรุณากรอก Email'],
    unique: true
  },
  password: { 
    type: String, 
    required: [true, 'กรุณากรอกรหัสผ่าน'],
    minlength: 6 
  },
  majorInstrument: { 
    type: String, 
    required: [true, 'กรุณาระบุเครื่องดนตรีหลัก']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  displayName: { type: String },
  bio: { type: String, default: "Music is the space between the notes." },
  vibeTags: [{ type: String }], // เก็บเป็น Array เช่น ["J-Rock", "Metal"]
  youtubeUrl: { type: String, default: "" },
  spotifyUrl: { type: String, default: "" },

  // ==========================================
  // 🚨 Function 4.2 - Soft Delete Fields
  // ==========================================
  // C1: ต้องตั้งค่าเริ่มต้น (default) เป็น false [cite: 337]
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  // ให้เป็นค่า null ในตอนเริ่มต้น (จะใส่ค่าเมื่อถูกลบ) [cite: 338]
  deletedAt: { 
    type: Date, 
    default: null 
  }

}, { timestamps: true });

// Function 5.1: Hash password อัตโนมัติก่อน Save ลง Database
userSchema.pre('save', async function() {
  // ถ้าไม่ได้แก้ไขรหัสผ่าน ให้ข้ามไปเลย
  if (!this.isModified('password')) return;
  
  // สร้าง Salt และ Hash รหัสผ่าน
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ฟังก์ชันเทียบรหัสผ่านตอน Login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);