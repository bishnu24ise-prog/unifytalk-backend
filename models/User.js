const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  disabilityType: {
    type: String,
    enum: ['deaf', 'mute', 'blind', 'low-vision', 'none'],
    default: 'none'
  },
  avatar: {
    type: String
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);