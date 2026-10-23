const mongoose = require('mongoose');

const clinicVisitSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicDoctor', required: true, index: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  patientName: { type: String, default: '' },
  patientPhone: { type: String, default: '' },
  date: { type: String, required: true, index: true },
  vitals: {
    bp: { type: String, default: '' },
    pulse: { type: String, default: '' },
    rr: { type: String, default: '' },
    temp: { type: String, default: '' },
    tempUnit: { type: String, default: 'F' },
    spo2: { type: String, default: '' },
    height: { type: String, default: '' },
    weight: { type: String, default: '' },
    bmi: { type: String, default: '' },
  },
  // Structured clinical documentation (SOAP-compatible + extended fields)
  chiefComplaint: { type: String, default: '' },
  hpi: { type: String, default: '' },            // history of present illness
  history: { type: String, default: '' },        // past / family / meds history
  examination: { type: String, default: '' },    // physical exam findings
  diagnosis: { type: String, default: '' },
  diagnosisCode: { type: String, default: '' },
  investigations: { type: String, default: '' }, // labs / imaging advised
  referrals: { type: String, default: '' },
  followUp: { type: String, default: '' },
  notes: { type: String, default: '' },
  subjective: { type: String, default: '' },
  objective: { type: String, default: '' },
  assessment: { type: String, default: '' },
  plan: { type: String, default: '' },
  status: { type: String, enum: ['waiting', 'in_consult', 'done'], default: 'waiting' },
  startedAt: { type: Date, default: null },
  finalizedAt: { type: Date, default: null },
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

clinicVisitSchema.index({ workspace: 1, doctor: 1, date: 1 });

module.exports = mongoose.model('ClinicVisit', clinicVisitSchema);
