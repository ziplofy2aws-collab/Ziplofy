const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
}, { _id: false });

const edtechAttendanceSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'EdtechBatch', required: true, index: true },
  date: { type: String, required: true },
  marks: { type: [markSchema], default: [] },
}, { timestamps: true });

edtechAttendanceSchema.index({ workspace: 1, batch: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('EdtechAttendance', edtechAttendanceSchema);
