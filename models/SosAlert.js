const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message:   { type: String, default: 'EMERGENCY — I need help!' },
  location:  {
    lat:  { type: Number, default: null },
    lng:  { type: Number, default: null },
    text: { type: String, default: '' },
  },
  contacts:  { type: [String], default: [] },  // email / phone list
  resolved:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SosAlert', sosAlertSchema);
