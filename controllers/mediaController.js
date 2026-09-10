const cloudinary = require('../config/cloudinary');
const Message = require('../models/Message');

// Upload image or audio to cloudinary
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'accessible-comm'
    });

    res.json({
      url: result.secure_url,
      type: result.resource_type,
      publicId: result.public_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Describe image for blind users using Google Vision
exports.describeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();

    const [labelResult] = await client.labelDetection(req.file.path);
    const [webResult] = await client.webDetection(req.file.path);

    const labels = labelResult.labelAnnotations
      .map(l => l.description)
      .join(', ');

    const bestGuess = webResult.webDetection
      .bestGuessLabels?.[0]?.label || labels;

    res.json({
      description: bestGuess,
      labels: labels
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save sign language gesture as a message
exports.signToText = async (req, res) => {
  try {
    const { gesture, roomId } = req.body;

    if (!gesture || !roomId) {
      return res.status(400).json({ error: 'Gesture and roomId are required' });
    }

    const message = await Message.create({
      room: roomId,
      sender: req.user._id,
      content: gesture,
      type: 'sign'
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};