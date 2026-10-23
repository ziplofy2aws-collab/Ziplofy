const mongoose = require('mongoose');

const clinicSettingsSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true },
  slotDuration: { type: Number, default: 15, min: 5, max: 180 },
  whatsappConfirm: { type: String, default: '' },
  whatsappReminder: { type: String, default: '' },
  whatsappRxCaption: { type: String, default: 'Your prescription is attached. Please follow the advice and reach out if you have questions.' },
  uhidPrefix: { type: String, default: 'CLN', trim: true },
  nextUhidSeq: { type: Number, default: 1, min: 1 },

  // Clinic identity (used on the prescription PDF + public booking)
  clinicName: { type: String, default: '', trim: true },
  clinicPhone: { type: String, default: '', trim: true },
  clinicEmail: { type: String, default: '', trim: true },
  clinicAddress: { type: String, default: '', trim: true },
  clinicWebsite: { type: String, default: '', trim: true },
  clinicLogo: { type: String, default: '' },
  timezone: { type: String, default: 'Asia/Kolkata', trim: true },
  currency: { type: String, default: 'INR', trim: true },
  language: { type: String, default: 'en', trim: true },

  // OPD queue
  tokenPrefix: { type: String, default: '', trim: true },
  tokenResetPolicy: { type: String, enum: ['daily', 'never'], default: 'daily' },

  // Prescription template
  rxHeader: { type: String, default: '' },
  rxFooter: { type: String, default: '' },
  rxInstructions: { type: String, default: '' },

  // Reminder toggles (the actual sends run from the Appointments scheduler)
  remind24h: { type: Boolean, default: true },
  remind1h: { type: Boolean, default: true },
  confirmOnCreate: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ClinicSettings', clinicSettingsSchema);
