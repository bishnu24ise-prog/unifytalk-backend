const mongoose = require('mongoose');

const signItemSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  emoji: { type: String, default: '🤟' },
  type:  { type: String, enum: ['hand', 'face', 'other'], default: 'hand' },
  confidence: { type: Number, default: null },
}, { _id: false });

const signSessionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  signs:   { type: [signItemSchema], default: [] },
  label:   { type: String, default: '' },   // optional session label
  duration: { type: Number, default: 0 },   // seconds
}, { timestamps: true });

module.exports = mongoose.model('SignSession', signSessionSchema);
