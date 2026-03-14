// backend/src/controllers/userController.js
const User = require('../models/User');

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // รับค่าใหม่มาอัปเดต (ถ้าไม่ได้ส่งค่ามา ให้ใช้ค่าเดิม)
      user.majorInstrument = req.body.majorInstrument || user.majorInstrument;
      user.displayName = req.body.displayName !== undefined ? req.body.displayName : user.displayName;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.vibeTags = req.body.vibeTags || user.vibeTags;
      user.youtubeUrl = req.body.youtubeUrl !== undefined ? req.body.youtubeUrl : user.youtubeUrl;
      user.spotifyUrl = req.body.spotifyUrl !== undefined ? req.body.spotifyUrl : user.spotifyUrl;
      
      const updatedUser = await user.save();

      // ส่งข้อมูลทั้งหมดกลับไปให้ Frontend
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        majorInstrument: updatedUser.majorInstrument,
        role: updatedUser.role,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        vibeTags: updatedUser.vibeTags,
        youtubeUrl: updatedUser.youtubeUrl,
        spotifyUrl: updatedUser.spotifyUrl
      });
    } else {
      res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateUserProfile };