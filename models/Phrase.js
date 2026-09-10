const mongoose = require('mongoose');

const phraseSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text:      { type: String, required: true, trim: true },
  category:  { type: String, default: 'general' },
  emoji:     { type: String, default: '💬' },
  useCount:  { type: Number, default: 0 },
  lastUsed:  { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Phrase', phraseSchema);
