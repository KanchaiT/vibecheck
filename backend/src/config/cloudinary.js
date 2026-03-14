const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ยืนยันตัวตนกับ Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ตั้งค่าที่เก็บไฟล์
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vibecheck_uploads',
    resource_type: 'auto', // 👈 'auto' คือหัวใจสำคัญ ทำให้รับได้ทั้งรูปและวิดีโอ!
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov']
  },
});

const upload = multer({ storage: storage });
module.exports = upload;