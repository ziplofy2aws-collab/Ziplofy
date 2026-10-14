const mongoose = require('mongoose');

const edtechEnrollmentSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'EdtechBatch', required: true, index: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true, index: true },
  status: { type: String, enum: ['active', 'left'], default: 'active' },
  feeDue: { type: Number, default: 0, min: 0 },
  feePaid: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

edtechEnrollmentSchema.index({ workspace: 1, batch: 1, contact: 1 }, { unique: true });

module.exports = mongoose.model('EdtechEnrollment', edtechEnrollmentSchema);
