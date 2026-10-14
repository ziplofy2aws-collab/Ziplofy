const mongoose = require('mongoose');

const edtechCourseSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, default: '', trim: true },
  grade: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  feeAmount: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('EdtechCourse', edtechCourseSchema);
