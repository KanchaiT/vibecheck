// backend/src/models/Band.js
const mongoose = require('mongoose');

const bandSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'กรุณาระบุชื่อวง'] 
  },
  genres: [{ 
    type: String 
  }],
  contact: {
    ig: { type: String, default: "-" },
    phone: { type: String, default: "-" }
  },
  // เก็บรายชื่อสมาชิกเป็น Array และอ้างอิงไปที่ Mongoose Schema ของ User
  members: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    role: { type: String, required: true }, // ตำแหน่งในวง เช่น Guitarist
    isLeader: { type: Boolean, default: false } // เป็นหัวหน้าวงหรือไม่
  }]
}, { timestamps: true });

module.exports = mongoose.model('Band', bandSchema);