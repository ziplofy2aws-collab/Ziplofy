const mongoose = require('mongoose');

const clinicQueueTokenSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicDoctor', required: true, index: true },
  date: { type: String, required: true },
  tokenNo: { type: Number, required: true },
  tokenLabel: { type: String, default: '' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  visit: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicVisit', default: null },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  patientName: { type: String, default: '' },
  patientPhone: { type: String, default: '' },
  priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  status: { type: String, enum: ['waiting', 'called', 'done', 'skipped', 'no_show', 'cancelled'], default: 'waiting' },
  calledAt: { type: Date, default: null },
  recallCount: { type: Number, default: 0 },
  skippedAt: { type: Date, default: null },
  skipReason: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  cancelReason: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

clinicQueueTokenSchema.index({ workspace: 1, doctor: 1, date: 1, tokenNo: 1 }, { unique: true });
clinicQueueTokenSchema.index({ workspace: 1, date: 1, status: 1 });
// One active queue entry per appointment per day (walk-ins have appointment:null so only one doc each).
clinicQueueTokenSchema.index(
  { workspace: 1, appointment: 1, date: 1 },
  { unique: true, partialFilterExpression: { appointment: { $type: 'objectId' }, status: { $in: ['waiting', 'called'] } } }
);

module.exports = mongoose.model('ClinicQueueToken', clinicQueueTokenSchema);
