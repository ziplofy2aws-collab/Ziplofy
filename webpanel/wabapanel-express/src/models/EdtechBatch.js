const mongoose = require('mongoose');

const edtechBatchSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EdtechCourse', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'EdtechTeacher', default: null },
  name: { type: String, required: true, trim: true },
  days: { type: [Number], default: [1, 2, 3, 4, 5] },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '10:00' },
  room: { type: String, default: '', trim: true },
  capacity: { type: Number, default: 30, min: 1 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

edtechBatchSchema.index({ workspace: 1, course: 1 });

module.exports = mongoose.model('EdtechBatch', edtechBatchSchema);
