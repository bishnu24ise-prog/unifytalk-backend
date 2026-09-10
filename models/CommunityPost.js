const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text:     { type: String, required: true, trim: true, maxlength: 1000 },
  imageUrl: { type: String, default: null },
  tags:     { type: [String], default: [] },
  likes:    { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
