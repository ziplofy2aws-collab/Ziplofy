const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  title: { type: String, required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  contactName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, default: 30 },
  status: { type: String, enum: ['scheduled', 'confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show', 'rescheduled'], default: 'scheduled' },
  checkInAt: { type: Date, default: null },
  cancelReason: { type: String, default: '' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  cancelledAt: { type: Date, default: null },
  noShowAt: { type: Date, default: null },
  archived: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicDoctor', default: null, index: true },
  reminderSent: { type: Boolean, default: false },
  reminder1hSent: { type: Boolean, default: false },
  reminder24hSent: { type: Boolean, default: false },
  reminderSettings: {
    reminder1h: { type: Boolean, default: true },
    reminder24h: { type: Boolean, default: true },
    confirmationOnCreate: { type: Boolean, default: true },
  },
  rescheduleCount: { type: Number, default: 0 },
  pendingReschedule: { type: Boolean, default: false },
  previousDate: { type: Date },
  previousTime: { type: String },
  type: { type: String, default: 'general' },
  location: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

appointmentSchema.pre('save', function () {
  this.$locals.wasNew = this.isNew;
  this.$locals.cancelledNow = !this.isNew && this.isModified('status') && this.status === 'cancelled';
  this.$locals.rescheduledNow = !this.isNew && (this.isModified('date') || this.isModified('startTime') || (this.isModified('status') && this.status === 'rescheduled'));
});

appointmentSchema.post('save', function (doc) {
  const l = doc.$locals || {};
  if (l.wasNew) {
    setImmediate(() => {
      require('../services/ownerNotify').appointmentBooked(doc).catch(() => {});
      require('../services/googleCalendar').createEventForAppointment(doc).catch(() => {});
    });
  } else if (l.cancelledNow) {
    setImmediate(() => require('../services/ownerNotify').apptChanged(doc, 'cancelled').catch(() => {}));
  } else if (l.rescheduledNow) {
    setImmediate(() => require('../services/ownerNotify').apptChanged(doc, 'rescheduled').catch(() => {}));
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
