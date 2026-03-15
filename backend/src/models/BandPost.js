const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // 1. เพิ่มฟิลด์แยกประเภทโพสต์
  postType: {
    type: String,
    enum: ['BandFinder', 'Knowledge'],
    default: 'BandFinder'
  },
  // 2. ปลด required ออกจากของเดิม เพื่อให้ยืดหยุ่น
  roleNeeded: { type: String },
  bandName: { type: String },
  bandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Band' },
  
  // 3. เพิ่มฟิลด์สำหรับ Knowledge Post
  title: { type: String },
  content: { type: String },
  mediaUrl: { type: String }, // เผื่อใส่ลิงก์รูปภาพประกอบ
  mediaType: { type: String },

  tags: [{ type: String }],
  isDeleted: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // เก็บ ID คนกดไลก์
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// เปลี่ยนชื่อ Model เป็น Post ให้ครอบคลุมขึ้น (หรือจะใช้ชื่อเดิมก็ได้ครับ)
module.exports = mongoose.model('Post', postSchema);