const mongoose = require('mongoose');

const windowSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
}, { _id: false });

const overrideSchema = new mongoose.Schema({
  date: { type: String, required: true },
  unavailable: { type: Boolean, default: false },
  windows: { type: [windowSchema], default: [] },
}, { _id: false });

const defaultWeekly = () => [
  [],
  [{ start: '10:00', end: '18:00' }],
  [{ start: '10:00', end: '18:00' }],
  [{ start: '10:00', end: '18:00' }],
  [{ start: '10:00', end: '18:00' }],
  [{ start: '10:00', end: '18:00' }],
  [],
];

const clinicDoctorScheduleSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicDoctor', required: true, unique: true },
  weekly: { type: [[windowSchema]], default: defaultWeekly },
  overrides: { type: [overrideSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('ClinicDoctorSchedule', clinicDoctorScheduleSchema);
module.exports.defaultWeekly = defaultWeekly;
