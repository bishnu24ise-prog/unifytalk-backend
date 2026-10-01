const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roomId:    { type: String, default: null },
  roomName:  { type: String, default: '' },
  messages:  { type: Number, default: 0 },   // message count snapshot
  duration:  { type: Number, default: 0 },   // seconds
  summary:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
