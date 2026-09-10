const mongoose = require('mongoose');

const symptomReportSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symptoms:   { type: [String], default: [] },
  severity:   { type: Number, min: 1, max: 10, default: 5 },
  bodyPart:   { type: String, default: '' },
  notes:      { type: String, default: '' },
  duration:   { type: String, default: '' },  // e.g. "2 days"
}, { timestamps: true });

module.exports = mongoose.model('SymptomReport', symptomReportSchema);
