const mongoose = require('mongoose');

const pictogramItemSchema = new mongoose.Schema({
  id:    { type: String },
  label: { type: String },
  emoji: { type: String },
  category: { type: String },
}, { _id: false });

const pictogramSessionSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  board:      { type: [pictogramItemSchema], default: [] },
  sentence:   { type: String, default: '' },
  language:   { type: String, default: 'en' },
  duration:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PictogramSession', pictogramSessionSchema);
