const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  generic: { type: String, default: '', trim: true },
  dose: { type: String, default: '', trim: true },   // strength / dosage e.g. "500mg"
  freq: { type: String, default: '', trim: true },   // e.g. "1-0-1" or "twice daily"
  days: { type: String, default: '', trim: true },   // duration e.g. "5 days"
  route: { type: String, default: '', trim: true },  // oral / topical / etc.
  qty: { type: String, default: '', trim: true },
  instructions: { type: String, default: '', trim: true },
  food: { type: String, default: '', trim: true },   // before/after food
  remarks: { type: String, default: '', trim: true },
}, { _id: false });

const clinicPrescriptionSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  visit: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicVisit', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicDoctor' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  drugs: { type: [drugSchema], default: [] },
  advice: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  sentOnWhatsAppAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('ClinicPrescription', clinicPrescriptionSchema);
