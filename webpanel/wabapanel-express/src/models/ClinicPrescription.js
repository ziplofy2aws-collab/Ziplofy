const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dose: { type: String, default: '', trim: true },
  freq: { type: String, default: '', trim: true },
  days: { type: String, default: '', trim: true },
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
