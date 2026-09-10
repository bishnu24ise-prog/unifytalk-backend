const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Room = require('../models/Room');

// POST /api/chat/room - create or get a room
router.post('/room', protect, async (req, res) => {
  try {
    const { participantId } = req.body;
    let room = await Room.findOne({
      participants: { $all: [req.user._id, participantId] },
      isGroup: false
    });
    if (!room) {
      room = await Room.create({
        participants: [req.user._id, participantId],
        createdBy: req.user._id
      });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/:roomId/messages - get message history
router.get('/:roomId/messages', protect, async (req, res) => {
  try {
    const messages = await Message
      .find({ room: req.params.roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name disabilityType avatar')
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/rooms - get all rooms for logged in user
router.get('/rooms', protect, async (req, res) => {
  try {
    const rooms = await Room
      .find({ participants: req.user._id })
      .populate('participants', 'name avatar isOnline disabilityType')
      .populate('lastMessage');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;