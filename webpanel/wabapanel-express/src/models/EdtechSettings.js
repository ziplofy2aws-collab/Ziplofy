const mongoose = require('mongoose');

const edtechSettingsSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true },
  enrollmentPrefix: { type: String, default: 'STU', trim: true },
  nextEnrollmentSeq: { type: Number, default: 1, min: 1 },
}, { timestamps: true });

module.exports = mongoose.model('EdtechSettings', edtechSettingsSchema);
