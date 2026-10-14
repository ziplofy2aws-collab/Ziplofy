const mongoose = require('mongoose');

const edtechTeacherSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

edtechTeacherSchema.index({ workspace: 1, userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('EdtechTeacher', edtechTeacherSchema);
