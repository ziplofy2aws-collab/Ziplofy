const mongoose = require('mongoose');

const edtechStudentProfileSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  enrollmentNo: { type: String, default: '', trim: true, index: true },
  grade: { type: String, default: '', trim: true },
  guardianName: { type: String, default: '', trim: true },
  guardianPhone: { type: String, default: '', trim: true },
  dob: { type: Date, default: null },
  address: { type: String, default: '', trim: true },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

edtechStudentProfileSchema.index({ workspace: 1, contact: 1 }, { unique: true });

module.exports = mongoose.model('EdtechStudentProfile', edtechStudentProfileSchema);
