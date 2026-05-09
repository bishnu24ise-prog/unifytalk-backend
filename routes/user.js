const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// GET /api/user/profile
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

// PUT /api/user/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        disabilityType: req.body.disabilityType,
        preferredLanguage: req.body.preferredLanguage,
        avatar: req.body.avatar
      },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;