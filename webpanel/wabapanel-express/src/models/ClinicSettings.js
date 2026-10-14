const mongoose = require('mongoose');

const clinicSettingsSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true },
  slotDuration: { type: Number, default: 15, min: 5, max: 180 },
  whatsappConfirm: { type: String, default: '' },
  whatsappReminder: { type: String, default: '' },
  whatsappRxCaption: { type: String, default: 'Your prescription is attached. Please follow the advice and reach out if you have questions.' },
  uhidPrefix: { type: String, default: 'CLN', trim: true },
  nextUhidSeq: { type: Number, default: 1, min: 1 },
}, { timestamps: true });

module.exports = mongoose.model('ClinicSettings', clinicSettingsSchema);
