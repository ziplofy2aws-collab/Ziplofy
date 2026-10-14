const mongoose = require('mongoose');

const clinicDoctorSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true, trim: true },
  specialty: { type: String, default: '', trim: true },
  qualifications: { type: String, default: '', trim: true },
  consultationMins: { type: Number, default: 15, min: 5, max: 180 },
  room: { type: String, default: '', trim: true },
  photo: { type: String, default: '' },
  bio: { type: String, default: '', trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

clinicDoctorSchema.index({ workspace: 1, userId: 1 }, { unique: true, sparse: true });
clinicDoctorSchema.index({ workspace: 1, active: 1 });

module.exports = mongoose.model('ClinicDoctor', clinicDoctorSchema);
