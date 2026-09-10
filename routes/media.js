const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Multer setup - save to uploads/ folder temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// POST /api/media/upload - upload image or audio
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'accessible-comm'
    });
    res.json({
      url: result.secure_url,
      type: result.resource_type
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/media/describe-image - AI description for blind users
router.post('/describe-image', protect, upload.single('file'), async (req, res) => {
  try {
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.labelDetection(req.file.path);
    const labels = result.labelAnnotations
      .map(l => l.description)
      .join(', ');
    res.json({ description: labels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;