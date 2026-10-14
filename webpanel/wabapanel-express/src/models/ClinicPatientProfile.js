const mongoose = require('mongoose');

const clinicPatientProfileSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  gender: { type: String, enum: ['', 'male', 'female', 'other'], default: '' },
  dob: { type: Date, default: null },
  bloodGroup: { type: String, default: '', trim: true },
  allergies: { type: String, default: '', trim: true },
  chronicNotes: { type: String, default: '', trim: true },
  uhid: { type: String, default: '', trim: true, index: true },
  address: { type: String, default: '', trim: true },
  city: { type: String, default: '', trim: true },
  state: { type: String, default: '', trim: true },
  pincode: { type: String, default: '', trim: true },
  emergencyName: { type: String, default: '', trim: true },
  emergencyPhone: { type: String, default: '', trim: true },
  guardianName: { type: String, default: '', trim: true },
  occupation: { type: String, default: '', trim: true },
  referredBy: { type: String, default: '', trim: true },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

clinicPatientProfileSchema.index({ workspace: 1, contact: 1 }, { unique: true });
clinicPatientProfileSchema.index({ workspace: 1, archived: 1 });

module.exports = mongoose.model('ClinicPatientProfile', clinicPatientProfileSchema);
