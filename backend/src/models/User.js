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
  spotifyUrl: { type: String, default: "" }
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