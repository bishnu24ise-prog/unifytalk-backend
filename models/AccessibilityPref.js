const mongoose = require('mongoose');

const voiceLogSchema = new mongoose.Schema({
  command:    { type: String },
  recognized: { type: Boolean, default: true },
  action:     { type: String, default: '' },
  at:         { type: Date, default: Date.now },
}, { _id: false });

const accessibilityPrefSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fontSize:      { type: String, default: 'medium' },
  highContrast:  { type: Boolean, default: false },
  reduceMotion:  { type: Boolean, default: false },
  screenReader:  { type: Boolean, default: false },
  voiceEnabled:  { type: Boolean, default: false },
  language:      { type: String, default: 'en' },
  voiceLogs:     { type: [voiceLogSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('AccessibilityPref', accessibilityPrefSchema);
