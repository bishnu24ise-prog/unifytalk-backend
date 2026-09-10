const Message = require('../models/Message');
const Room = require('../models/Room');

// Get all rooms for logged in user
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room
      .find({ participants: req.user._id })
      .populate('participants', 'name avatar isOnline disabilityType')
      .populate('lastMessage');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get messages for a room
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message
      .find({ room: req.params.roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar disabilityType')
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { participantId, isGroup, name } = req.body;

    if (!isGroup) {
      let room = await Room.findOne({
        participants: { $all: [req.user._id, participantId] },
        isGroup: false
      });
      if (room) return res.json(room);
    }

    const room = await Room.create({
      name: name || '',
      participants: isGroup
        ? [...req.body.participants, req.user._id]
        : [req.user._id, participantId],
      isGroup: isGroup || false,
      createdBy: req.user._id
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};