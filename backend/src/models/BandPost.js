// backend/src/models/BandPost.js
const mongoose = require('mongoose');

const bandPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // เชื่อมความสัมพันธ์กับ User Collection (Function 4.3)
  },
  roleNeeded: {
    type: String,
    required: [true, 'กรุณาระบุตำแหน่งที่ต้องการหา (เช่น Bassist, Drummer)'],
  },
  bandName: {
    type: String,
    required: [true, 'กรุณาระบุชื่อวง'],
  },
  tags: [{
    type: String, // เช่น ["J-Rock", "Alt-Rock"]
  }],
  isDeleted: {
    type: Boolean,
    default: false, // Function 4.2: ระบบ Soft Delete (ซ่อนโพสต์แทนการลบจริง)
  }
}, { timestamps: true });

module.exports = mongoose.model('BandPost', bandPostSchema);