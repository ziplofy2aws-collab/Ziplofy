const mongoose = require('mongoose');

const clinicQueueTokenSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicDoctor', required: true, index: true },
  date: { type: String, required: true },
  tokenNo: { type: Number, required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  visit: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicVisit', default: null },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  patientName: { type: String, default: '' },
  patientPhone: { type: String, default: '' },
  status: { type: String, enum: ['waiting', 'called', 'done', 'skipped'], default: 'waiting' },
  calledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

clinicQueueTokenSchema.index({ workspace: 1, doctor: 1, date: 1, tokenNo: 1 }, { unique: true });

module.exports = mongoose.model('ClinicQueueToken', clinicQueueTokenSchema);
