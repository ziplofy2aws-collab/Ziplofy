const User = require('../models/User');
const Contact = require('../models/Contact');
const Appointment = require('../models/Appointment');
const Workspace = require('../models/Workspace');
const ClinicDoctor = require('../models/ClinicDoctor');
const ClinicDoctorSchedule = require('../models/ClinicDoctorSchedule');
const ClinicPatientProfile = require('../models/ClinicPatientProfile');
const ClinicVisit = require('../models/ClinicVisit');
const ClinicPrescription = require('../models/ClinicPrescription');
const ClinicQueueToken = require('../models/ClinicQueueToken');
const ClinicSettings = require('../models/ClinicSettings');
const { generatePrescriptionPdf } = require('../services/clinicRxPdf');
const WhatsAppService = require('../services/whatsappService');
const { logAction } = require('../services/auditService');

function emitClinic(req, event, payload) {
  try {
    const io = req.app.get('io') || global.io;
    if (io) io.to(`workspace:${req.workspace._id}`).emit(event, payload);
  } catch { /* realtime is best-effort */ }
}

const todayStr = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

async function scopedDoctor(req) {
  if (req.user?.staffType !== 'doctor') return null;
  return ClinicDoctor.findOne({ workspace: req.workspace._id, userId: req.user._id });
}

async function getOrCreateSettings(workspaceId) {
  let s = await ClinicSettings.findOne({ workspace: workspaceId });
  if (!s) s = await ClinicSettings.create({ workspace: workspaceId });
  return s;
}

const PATIENT_MED_FIELDS = [
  'gender', 'dob', 'bloodGroup', 'allergies', 'chronicNotes', 'uhid',
  'address', 'city', 'state', 'pincode',
  'emergencyName', 'emergencyPhone', 'guardianName', 'occupation', 'referredBy',
];

function pickMedFields(body) {
  const med = {};
  for (const k of PATIENT_MED_FIELDS) {
    if (k in body) med[k] = body[k] === '' ? '' : body[k];
  }
  if (med.dob === '') med.dob = null;
  return med;
}

async function assignUhid(workspaceId, medical) {
  if (medical.uhid) return medical;
  // Atomic counter increment — safe under concurrent registrations.
  let s = await ClinicSettings.findOneAndUpdate(
    { workspace: workspaceId },
    { $inc: { nextUhidSeq: 1 } },
    { new: true }
  );
  if (!s) {
    await getOrCreateSettings(workspaceId);
    s = await ClinicSettings.findOneAndUpdate(
      { workspace: workspaceId },
      { $inc: { nextUhidSeq: 1 } },
      { new: true }
    );
  }
  const prefix = String(s.uhidPrefix || 'CLN').replace(/[^A-Za-z0-9-]/g, '').slice(0, 8) || 'CLN';
  const seq = Math.max(1, Number(s.nextUhidSeq) - 1 || 1);
  medical.uhid = `${prefix}-${String(seq).padStart(4, '0')}`;
  await medical.save();
  return medical;
}

async function doctorContactIds(workspaceId, doctorId) {
  const visits = await ClinicVisit.find({ workspace: workspaceId, doctor: doctorId }).distinct('contact');
  const appts = await Appointment.find({ workspace: workspaceId, doctor: doctorId }).distinct('contact');
  return [...new Set([...visits, ...appts].filter(Boolean).map(String))];
}

async function nextTokenNo(workspaceId, doctorId, date) {
  const last = await ClinicQueueToken.findOne({ workspace: workspaceId, doctor: doctorId, date }).sort('-tokenNo').select('tokenNo');
  return (last?.tokenNo || 0) + 1;
}

async function tokenPrefixFor(workspaceId) {
  const s = await getOrCreateSettings(workspaceId);
  return String(s.tokenPrefix || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 6);
}

// ---------- Doctors ----------
const listDoctors = async (req, res) => {
  try {
    const mine = await scopedDoctor(req);
    const filter = { workspace: req.workspace._id };
    if (mine) filter._id = mine._id;
    if (req.query.active === 'true') filter.active = true;
    const doctors = await ClinicDoctor.find(filter).populate('userId', 'name email staffType').sort('name');
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctor = async (req, res) => {
  try {
    const mine = await scopedDoctor(req);
    if (mine && String(mine._id) !== String(req.params.id)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const doctor = await ClinicDoctor.findOne({ _id: req.params.id, workspace: req.workspace._id })
      .populate('userId', 'name email staffType');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const schedule = await ClinicDoctorSchedule.findOne({ workspace: req.workspace._id, doctor: doctor._id });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcomingAppointments = await Appointment.find({
      workspace: req.workspace._id, doctor: doctor._id, date: { $gte: today },
      status: { $in: ['scheduled', 'confirmed', 'checked_in', 'in_consultation', 'rescheduled'] },
    }).populate('contact', 'name phone').sort('date startTime').limit(20);
    const recentVisits = await ClinicVisit.find({ workspace: req.workspace._id, doctor: doctor._id, status: 'done' })
      .sort('-date -createdAt').limit(10).select('date patientName status diagnosis');
    res.json({ success: true, data: { ...doctor.toObject(), schedule, upcomingAppointments, recentVisits } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    if (req.user?.staffType === 'doctor') {
      return res.status(403).json({ success: false, message: 'Doctors cannot add roster entries' });
    }
    const body = req.body || {};
    let userId = body.userId || null;
    if (body.email && body.password && !userId) {
      const existing = await User.findOne({ email: String(body.email).toLowerCase() });
      if (existing) return res.status(400).json({ success: false, message: 'A user with this email already exists' });
      const agent = await User.create({
        name: body.name,
        email: String(body.email).toLowerCase(),
        password: body.password,
        role: 'agent',
        status: 'active',
        staffType: 'doctor',
        permissions: ['clinic'],
        currentWorkspace: req.workspace._id,
      });
      await require('../models/Workspace').updateOne(
        { _id: req.workspace._id, 'members.user': { $ne: agent._id } },
        { $push: { members: { user: agent._id, role: 'agent' } } }
      );
      userId = agent._id;
    }
    const doctor = await ClinicDoctor.create({
      workspace: req.workspace._id,
      userId,
      name: body.name,
      specialty: body.specialty || '',
      department: body.department || '',
      qualifications: body.qualifications || '',
      registrationNo: body.registrationNo || '',
      experience: body.experience || '',
      consultationMins: Math.max(5, Math.min(180, Number(body.consultationMins) || 15)),
      consultationFee: Math.max(0, Number(body.consultationFee) || 0),
      room: body.room || '',
      photo: body.photo || '',
      bio: body.bio || '',
      email: body.email || '',
      phone: body.phone || '',
      active: body.active !== false,
    });
    await ClinicDoctorSchedule.create({ workspace: req.workspace._id, doctor: doctor._id });
    try {
      const bookingService = require('../services/bookingService');
      const s = await bookingService.getSettings(req.workspace._id);
      if (!s.enabled) { s.enabled = true; await s.save(); }
    } catch { /* optional */ }
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    if (req.user?.staffType === 'doctor') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const allowed = ['name', 'specialty', 'department', 'qualifications', 'registrationNo', 'experience', 'consultationMins', 'consultationFee', 'room', 'photo', 'bio', 'email', 'phone', 'active', 'userId'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (patch.consultationMins) patch.consultationMins = Math.max(5, Math.min(180, Number(patch.consultationMins) || 15));
    if (patch.consultationFee != null) patch.consultationFee = Math.max(0, Number(patch.consultationFee) || 0);
    const doctor = await ClinicDoctor.findOneAndUpdate(
      { _id: req.params.id, workspace: req.workspace._id },
      patch,
      { new: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    if (req.user?.staffType === 'doctor') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const doctor = await ClinicDoctor.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const futureAppts = await Appointment.countDocuments({
      workspace: req.workspace._id, doctor: doctor._id, date: { $gte: today },
      status: { $in: ['scheduled', 'confirmed', 'checked_in', 'rescheduled'] },
    });
    // Hard delete only when explicitly requested AND there is no history.
    if (req.query.hard === 'true' && !futureAppts) {
      const visits = await ClinicVisit.countDocuments({ workspace: req.workspace._id, doctor: doctor._id });
      if (!visits) {
        await ClinicDoctor.deleteOne({ _id: doctor._id });
        await ClinicDoctorSchedule.deleteOne({ doctor: doctor._id });
        return res.json({ success: true, message: 'Doctor removed' });
      }
    }
    // Default: deactivate — preserves all historical consultations/prescriptions.
    doctor.active = false;
    await doctor.save();
    await logAction(req.workspace._id, req.user._id, 'doctor.deactivate', 'ClinicDoctor', String(doctor._id), `futureAppointments=${futureAppts}`, req.ip);
    res.json({ success: true, data: doctor, futureAppointments: futureAppts, message: futureAppts ? `Deactivated. ${futureAppts} upcoming appointment(s) need reassignment.` : 'Doctor deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSchedule = async (req, res) => {
  try {
    const mine = await scopedDoctor(req);
    if (mine && String(mine._id) !== String(req.params.id)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    let schedule = await ClinicDoctorSchedule.findOne({ workspace: req.workspace._id, doctor: req.params.id });
    if (!schedule) schedule = await ClinicDoctorSchedule.create({ workspace: req.workspace._id, doctor: req.params.id });
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const mine = await scopedDoctor(req);
    if (mine && String(mine._id) !== String(req.params.id)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    let schedule = await ClinicDoctorSchedule.findOne({ workspace: req.workspace._id, doctor: req.params.id });
    if (!schedule) schedule = await ClinicDoctorSchedule.create({ workspace: req.workspace._id, doctor: req.params.id });
    if (Array.isArray(req.body.weekly)) schedule.weekly = req.body.weekly;
    if (Array.isArray(req.body.overrides)) {
      schedule.overrides = req.body.overrides
        .filter((o) => o && /^\d{4}-\d{2}-\d{2}$/.test(o.date))
        .map((o) => ({ date: o.date, unavailable: !!o.unavailable, windows: Array.isArray(o.windows) ? o.windows : [] }));
    }
    await schedule.save();
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- Patients ----------
const listPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, archived } = req.query;
    const query = { workspace: req.workspace._id, isGroup: { $ne: true } };
    const mine = await scopedDoctor(req);
    if (mine) {
      const ids = await doctorContactIds(req.workspace._id, mine._id);
      query._id = { $in: ids };
    }
    if (search) {
      const uhidHits = await ClinicPatientProfile.find({
        workspace: req.workspace._id,
        uhid: { $regex: String(search).trim(), $options: 'i' },
      }).select('contact').lean();
      const uhidIds = uhidHits.map((p) => p.contact);
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        ...(uhidIds.length ? [{ _id: { $in: uhidIds } }] : []),
      ];
    }
    const archivedFilter = archived === 'true' ? true : archived === 'all' ? null : false;
    if (archivedFilter !== null) {
      const rows = await ClinicPatientProfile.find({
        workspace: req.workspace._id,
        archived: true,
      }).select('contact').lean();
      const archivedStr = new Set(rows.map((p) => String(p.contact)));
      const archivedIds = rows.map((p) => p.contact);
      if (archivedFilter === true) {
        if (query._id && query._id.$in) {
          query._id = { $in: query._id.$in.filter((id) => archivedStr.has(String(id))) };
        } else {
          query._id = { $in: archivedIds };
        }
      } else if (query._id && query._id.$in) {
        query._id = { $in: query._id.$in.filter((id) => !archivedStr.has(String(id))) };
      } else {
        query._id = { $nin: archivedIds };
      }
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort('-updatedAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    if (!contacts.length) {
      return res.json({ success: true, data: [], total, page: Number(page), limit: Number(limit) });
    }
    const profiles = await ClinicPatientProfile.find({
      workspace: req.workspace._id,
      contact: { $in: contacts.map((c) => c._id) },
    }).lean();
    const pmap = {};
    for (const p of profiles) pmap[String(p.contact)] = p;
    const lastVisits = await ClinicVisit.aggregate([
      { $match: { workspace: req.workspace._id, contact: { $in: contacts.map((c) => c._id) } } },
      { $sort: { date: -1, createdAt: -1 } },
      { $group: { _id: '$contact', date: { $first: '$date' }, status: { $first: '$status' } } },
    ]);
    const vmap = {};
    for (const v of lastVisits) vmap[String(v._id)] = v;
    const data = contacts.map((c) => ({
      ...c,
      medical: pmap[String(c._id)] || null,
      lastVisit: vmap[String(c._id)] || null,
    }));
    res.json({ success: true, data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.contactId, workspace: req.workspace._id }).lean();
    if (!contact) return res.status(404).json({ success: false, message: 'Patient not found' });
    const mine = await scopedDoctor(req);
    if (mine) {
      const ids = await doctorContactIds(req.workspace._id, mine._id);
      if (!ids.includes(String(contact._id))) {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }
    }
    const medical = await ClinicPatientProfile.findOne({ workspace: req.workspace._id, contact: contact._id }).lean();
    const visitFilter = { workspace: req.workspace._id, contact: contact._id };
    if (mine) visitFilter.doctor = mine._id;
    const visits = await ClinicVisit.find(visitFilter).populate('doctor', 'name specialty').sort('-date -createdAt').limit(50);
    const visitIds = visits.map((v) => v._id);
    const prescriptions = await ClinicPrescription.find({ visit: { $in: visitIds } }).sort('-createdAt');
    const apptFilter = { workspace: req.workspace._id, contact: contact._id };
    if (mine) apptFilter.doctor = mine._id;
    const appointments = await Appointment.find(apptFilter)
      .populate('doctor', 'name specialty')
      .sort('-date -startTime')
      .limit(50);
    res.json({ success: true, data: { contact, medical, visits, prescriptions, appointments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upsertPatient = async (req, res) => {
  try {
    const body = req.body || {};
    let contact = null;
    if (req.params.contactId && req.params.contactId !== 'new') {
      contact = await Contact.findOne({ _id: req.params.contactId, workspace: req.workspace._id });
      if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
      const mine = await scopedDoctor(req);
      if (mine) {
        const ids = await doctorContactIds(req.workspace._id, mine._id);
        if (!ids.includes(String(contact._id))) {
          return res.status(403).json({ success: false, message: 'Not allowed' });
        }
      }
      if (body.name) contact.name = body.name;
      if (body.phone) contact.phone = body.phone;
      if (body.email != null) contact.email = body.email;
      await contact.save();
    } else {
      const phone = String(body.phone || '').replace(/\D/g, '');
      if (!phone) return res.status(400).json({ success: false, message: 'phone is required' });
      contact = await Contact.findOne({ workspace: req.workspace._id, phone: { $regex: phone.slice(-10) + '$' } });
      if (!contact) {
        contact = await Contact.create({
          workspace: req.workspace._id,
          name: body.name || phone,
          phone,
          email: body.email || '',
          source: 'manual',
        });
      } else if (body.name) {
        contact.name = body.name;
        if (body.email != null) contact.email = body.email;
        await contact.save();
      }
    }
    const medFields = pickMedFields(body);
    medFields.archived = false;
    let medical = await ClinicPatientProfile.findOneAndUpdate(
      { workspace: req.workspace._id, contact: contact._id },
      { $set: medFields, $setOnInsert: { workspace: req.workspace._id, contact: contact._id } },
      { new: true, upsert: true }
    );
    medical = await assignUhid(req.workspace._id, medical);
    res.json({ success: true, data: { contact, medical } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const archivePatient = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.contactId, workspace: req.workspace._id }).select('_id');
    if (!contact) return res.status(404).json({ success: false, message: 'Patient not found' });
    const mine = await scopedDoctor(req);
    if (mine) {
      const ids = await doctorContactIds(req.workspace._id, mine._id);
      if (!ids.includes(String(contact._id))) {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }
    }
    const medical = await ClinicPatientProfile.findOneAndUpdate(
      { workspace: req.workspace._id, contact: contact._id },
      { $set: { archived: true }, $setOnInsert: { workspace: req.workspace._id, contact: contact._id } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: medical, message: 'Patient archived' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Possible duplicate patients by phone / email / name+dob — for staff review (never auto-merge).
const findDuplicates = async (req, res) => {
  try {
    const phone = String(req.query.phone || '').replace(/\D/g, '');
    const email = String(req.query.email || '').trim().toLowerCase();
    const name = String(req.query.name || '').trim();
    const or = [];
    if (phone.length >= 6) or.push({ phone: { $regex: phone.slice(-10) + '$' } });
    if (email) or.push({ email: { $regex: '^' + email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' } });
    if (name.length >= 2) or.push({ name: { $regex: '^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' } });
    if (!or.length) return res.json({ success: true, data: [] });
    const contacts = await Contact.find({ workspace: req.workspace._id, isGroup: { $ne: true }, $or: or }).limit(10).lean();
    const profiles = await ClinicPatientProfile.find({ workspace: req.workspace._id, contact: { $in: contacts.map((c) => c._id) } }).lean();
    const pmap = {};
    for (const p of profiles) pmap[String(p.contact)] = p;
    res.json({ success: true, data: contacts.map((c) => ({ ...c, medical: pmap[String(c._id)] || null })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportPatients = async (req, res) => {
  try {
    req.query.limit = '5000';
    req.query.page = '1';
    const fakeRes = {
      _status: 200,
      status(code) { this._status = code; return this; },
      json(payload) {
        if (this._status >= 400 || payload.success === false) {
          return res.status(this._status >= 400 ? this._status : 500).json(payload);
        }
        const rows = payload.data || [];
        const header = ['UHID', 'Name', 'Phone', 'Email', 'Gender', 'DOB', 'Blood group', 'City', 'Allergies', 'Last visit'];
        const csv = [header.join(',')].concat(rows.map((r) => {
          const m = r.medical || {};
          const cells = [
            m.uhid, r.name, r.phone, r.email, m.gender,
            m.dob ? String(m.dob).slice(0, 10) : '',
            m.bloodGroup, m.city, m.allergies,
            r.lastVisit?.date || '',
          ].map((v) => `"${String(v || '').replace(/"/g, '""')}"`);
          return cells.join(',');
        })).join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="patients.csv"');
        res.send(csv);
      },
    };
    await listPatients(req, fakeRes);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- Queue ----------
const listQueue = async (req, res) => {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date) ? req.query.date : todayStr();
    const mine = await scopedDoctor(req);
    const doctorId = mine ? mine._id : req.query.doctor;
    const filter = { workspace: req.workspace._id, date };
    if (doctorId) filter.doctor = doctorId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    let tokens = await ClinicQueueToken.find(filter)
      .populate('doctor', 'name specialty room')
      .populate('appointment', 'startTime endTime title type')
      .populate('visit', 'status notes finalizedAt')
      .sort({ priority: -1, tokenNo: 1 });
    // UHID / age from the medical profile
    const contactIds = tokens.map((t) => t.contact).filter(Boolean);
    const profiles = await ClinicPatientProfile.find({ workspace: req.workspace._id, contact: { $in: contactIds } }).select('contact uhid dob gender').lean();
    const pmap = {};
    for (const p of profiles) pmap[String(p.contact)] = p;
    tokens = tokens.map((t) => {
      const o = t.toObject();
      const m = o.contact ? pmap[String(o.contact)] : null;
      o.uhid = m?.uhid || '';
      o.patientDob = m?.dob || null;
      o.patientGender = m?.gender || '';
      return o;
    });
    // Summary for the dashboard (full day, unfiltered by status/priority)
    const all = await ClinicQueueToken.find({ workspace: req.workspace._id, date, ...(doctorId ? { doctor: doctorId } : {}) }).select('status createdAt calledAt completedAt').lean();
    const waits = all.filter((t) => t.calledAt && t.createdAt).map((t) => (new Date(t.calledAt) - new Date(t.createdAt)) / 60000);
    const summary = {
      total: all.length,
      waiting: all.filter((t) => t.status === 'waiting').length,
      called: all.filter((t) => t.status === 'called').length,
      done: all.filter((t) => t.status === 'done').length,
      skipped: all.filter((t) => t.status === 'skipped').length,
      noShow: all.filter((t) => t.status === 'no_show').length,
      avgWaitMin: waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0,
    };
    res.json({ success: true, data: tokens, date, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkIn = async (req, res) => {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.body.date) ? req.body.date : todayStr();
    const mine = await scopedDoctor(req);
    const doctorId = mine ? mine._id : req.body.doctor;
    if (!doctorId) return res.status(400).json({ success: false, message: 'doctor is required' });
    const doctor = await ClinicDoctor.findOne({ _id: doctorId, workspace: req.workspace._id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    let appointment = null;
    if (req.body.appointment) {
      appointment = await Appointment.findOne({ _id: req.body.appointment, workspace: req.workspace._id });
    }

    let contact = appointment?.contact || req.body.contact || null;
    let patientName = appointment?.contactName || req.body.patientName || '';
    let patientPhone = appointment?.contactPhone || req.body.patientPhone || '';
    if (contact) {
      const c = await Contact.findById(contact).select('name phone');
      if (c) {
        patientName = patientName || c.name;
        patientPhone = patientPhone || c.phone;
        contact = c._id;
      }
    }

    const activeStatuses = { $in: ['waiting', 'called'] };
    const existing = appointment
      ? await ClinicQueueToken.findOne({ workspace: req.workspace._id, appointment: appointment._id, date, status: activeStatuses })
      : (patientPhone
        ? await ClinicQueueToken.findOne({ workspace: req.workspace._id, doctor: doctor._id, date, patientPhone, status: activeStatuses })
        : null);
    if (existing) return res.json({ success: true, data: existing, message: 'Already checked in' });

    const priority = req.body.priority === 'urgent' ? 'urgent' : 'normal';
    const visit = await ClinicVisit.create({
      workspace: req.workspace._id,
      appointment: appointment?._id || null,
      doctor: doctor._id,
      contact,
      patientName,
      patientPhone,
      date,
      status: 'waiting',
    });
    const prefix = await tokenPrefixFor(req.workspace._id);
    // Unique {workspace,doctor,date,tokenNo} index — retry on concurrent collisions.
    let token = null;
    let lastErr = null;
    for (let attempt = 0; attempt < 4 && !token; attempt++) {
      try {
        const tokenNo = await nextTokenNo(req.workspace._id, doctor._id, date);
        token = await ClinicQueueToken.create({
          workspace: req.workspace._id,
          doctor: doctor._id,
          date,
          tokenNo,
          tokenLabel: `${prefix}${tokenNo}`,
          appointment: appointment?._id || null,
          visit: visit._id,
          contact,
          patientName,
          patientPhone,
          priority,
          status: 'waiting',
          createdBy: req.user._id,
        });
      } catch (e) {
        if (e && e.code === 11000) { lastErr = e; continue; }
        throw e;
      }
    }
    if (!token) throw lastErr || new Error('Could not assign queue token');
    if (appointment && ['scheduled', 'confirmed'].includes(appointment.status)) {
      appointment.status = 'checked_in';
      appointment.checkInAt = new Date();
      if (!appointment.doctor) appointment.doctor = doctor._id;
      await appointment.save();
    }
    emitClinic(req, 'clinic:queue', { date, doctor: doctor._id, action: 'check_in' });
    res.status(201).json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function setTokenStatus(req, res, status) {
  try {
    const mine = await scopedDoctor(req);
    const token = await ClinicQueueToken.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!token) return res.status(404).json({ success: false, message: 'Token not found' });
    if (mine && String(mine._id) !== String(token.doctor)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const reason = String(req.body?.reason || '').slice(0, 300);
    const prev = token.status;

    if (status === 'called') {
      if (!['waiting', 'skipped', 'called'].includes(prev)) return res.status(400).json({ success: false, message: 'Only waiting/skipped patients can be called' });
      if (prev === 'called') token.recallCount = (token.recallCount || 0) + 1;
      token.calledAt = new Date();
    }
    if (status === 'skipped') {
      token.skippedAt = new Date();
      if (reason) token.skipReason = reason;
    }
    if (status === 'waiting' && prev === 'skipped') {
      // re-queue: keep token no + history, back to waiting
      token.skippedAt = null;
    }
    if (status === 'done') token.completedAt = new Date();
    if (status === 'no_show') { token.cancelReason = reason; token.completedAt = new Date(); }
    if (status === 'cancelled') { token.cancelReason = reason; token.completedAt = new Date(); }
    token.status = status;
    await token.save();

    // Keep visit + appointment lifecycles in sync.
    if (token.visit) {
      const visitStatus = status === 'called' ? 'in_consult' : status === 'done' ? 'done' : 'waiting';
      const patch = { status: visitStatus };
      if (status === 'called') patch.startedAt = new Date();
      await ClinicVisit.updateOne({ _id: token.visit }, patch);
    }
    if (token.appointment) {
      const apptStatus = status === 'called' ? 'in_consultation'
        : status === 'done' ? 'completed'
        : status === 'no_show' ? 'no_show'
        : null;
      if (apptStatus) await Appointment.updateOne({ _id: token.appointment }, { status: apptStatus });
      else if (status === 'skipped' || status === 'waiting') await Appointment.updateOne({ _id: token.appointment }, { status: 'checked_in' });
    }
    emitClinic(req, 'clinic:queue', { date: token.date, doctor: token.doctor, action: status, tokenId: token._id });
    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

const callToken = (req, res) => setTokenStatus(req, res, 'called');
const skipToken = (req, res) => setTokenStatus(req, res, 'skipped');
const completeToken = (req, res) => setTokenStatus(req, res, 'done');
const requeueToken = (req, res) => setTokenStatus(req, res, 'waiting');
const noShowToken = (req, res) => setTokenStatus(req, res, 'no_show');
const cancelToken = (req, res) => setTokenStatus(req, res, 'cancelled');

const callNext = async (req, res) => {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.body.date) ? req.body.date : todayStr();
    const mine = await scopedDoctor(req);
    const doctorId = mine ? mine._id : req.body.doctor;
    if (!doctorId) return res.status(400).json({ success: false, message: 'doctor is required' });
    const next = await ClinicQueueToken.findOne({
      workspace: req.workspace._id,
      doctor: doctorId,
      date,
      status: 'waiting',
    }).sort({ priority: -1, tokenNo: 1 });
    if (!next) return res.status(404).json({ success: false, message: 'No waiting patients' });
    req.params.id = String(next._id);
    return setTokenStatus(req, res, 'called');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------- Visits / Rx ----------
const listVisits = async (req, res) => {
  try {
    const mine = await scopedDoctor(req);
    const filter = { workspace: req.workspace._id };
    if (mine) filter.doctor = mine._id;
    else if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.contact) filter.contact = req.query.contact;
    if (req.query.status) filter.status = req.query.status;
    const visits = await ClinicVisit.find(filter)
      .populate('doctor', 'name specialty')
      .populate('contact', 'name phone')
      .sort('-date -createdAt')
      .limit(100);
    res.json({ success: true, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVisit = async (req, res) => {
  try {
    const visit = await ClinicVisit.findOne({ _id: req.params.id, workspace: req.workspace._id })
      .populate('doctor', 'name specialty qualifications room')
      .populate('contact', 'name phone email')
      .populate('appointment', 'startTime endTime date');
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    const mine = await scopedDoctor(req);
    if (mine && String(mine._id) !== String(visit.doctor._id || visit.doctor)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const prescription = await ClinicPrescription.findOne({ visit: visit._id });
    const medical = visit.contact
      ? await ClinicPatientProfile.findOne({ workspace: req.workspace._id, contact: visit.contact._id || visit.contact })
      : null;
    res.json({ success: true, data: { visit, prescription, medical } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const VISIT_DOC_FIELDS = [
  'notes', 'subjective', 'objective', 'assessment', 'plan', 'status', 'vitals',
  'chiefComplaint', 'hpi', 'history', 'examination', 'diagnosis', 'diagnosisCode',
  'investigations', 'referrals', 'followUp',
];

const updateVisit = async (req, res) => {
  try {
    const visit = await ClinicVisit.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    const mine = await scopedDoctor(req);
    if (mine && String(mine._id) !== String(visit.doctor)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    if (visit.finalizedAt) {
      return res.status(400).json({ success: false, message: 'This consultation is finalized and read-only' });
    }
    for (const k of VISIT_DOC_FIELDS) if (k in req.body) visit[k] = req.body[k];
    if (req.body.status === 'in_consult' && !visit.startedAt) visit.startedAt = new Date();
    await visit.save();
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Finalize: lock the record, mark queue token done + appointment completed.
const finalizeVisit = async (req, res) => {
  try {
    const visit = await ClinicVisit.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    const mine = await scopedDoctor(req);
    if (mine && String(mine._id) !== String(visit.doctor)) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can finalize this consultation' });
    }
    if (visit.finalizedAt) return res.json({ success: true, data: visit, message: 'Already finalized' });
    visit.status = 'done';
    visit.finalizedAt = new Date();
    visit.finalizedBy = req.user._id;
    await visit.save();
    await ClinicQueueToken.updateOne(
      { visit: visit._id, status: { $in: ['waiting', 'called', 'skipped'] } },
      { status: 'done', completedAt: new Date() }
    );
    if (visit.appointment) await Appointment.updateOne({ _id: visit.appointment }, { status: 'completed' });
    await logAction(req.workspace._id, req.user._id, 'visit.finalize', 'ClinicVisit', String(visit._id), `patient=${visit.patientName}`, req.ip);
    emitClinic(req, 'clinic:queue', { date: visit.date, doctor: visit.doctor, action: 'done' });
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const savePrescription = async (req, res) => {
  try {
    const visit = await ClinicVisit.findOne({ _id: req.params.id, workspace: req.workspace._id })
      .populate('doctor')
      .populate('contact');
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    const mine = await scopedDoctor(req);
    if (mine && String(mine._id) !== String(visit.doctor._id || visit.doctor)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    if (visit.finalizedAt) {
      return res.status(400).json({ success: false, message: 'This consultation is finalized — prescription is read-only' });
    }
    const DRUG_FIELDS = ['name', 'generic', 'dose', 'freq', 'days', 'route', 'qty', 'instructions', 'food', 'remarks'];
    const drugs = Array.isArray(req.body.drugs)
      ? req.body.drugs.filter((d) => d && d.name).map((d) => {
        const out = {};
        for (const k of DRUG_FIELDS) out[k] = String(d[k] || '').trim().slice(0, 300);
        return out;
      })
      : [];
    const advice = String(req.body.advice || '');
    let rx = await ClinicPrescription.findOne({ visit: visit._id });
    if (!rx) {
      rx = await ClinicPrescription.create({
        workspace: req.workspace._id,
        visit: visit._id,
        doctor: visit.doctor._id || visit.doctor,
        contact: visit.contact?._id || visit.contact,
        drugs,
        advice,
      });
    } else {
      rx.drugs = drugs;
      rx.advice = advice;
      await rx.save();
    }
    const clinicSettings = await getOrCreateSettings(req.workspace._id);
    const pdf = await generatePrescriptionPdf({
      workspace: req.workspace,
      doctor: visit.doctor,
      contact: visit.contact,
      visit,
      prescription: rx,
      clinicName: clinicSettings.clinicName || req.workspace.name,
      clinicInfo: {
        phone: clinicSettings.clinicPhone,
        email: clinicSettings.clinicEmail,
        address: clinicSettings.clinicAddress,
        website: clinicSettings.clinicWebsite,
        header: clinicSettings.rxHeader,
        footer: clinicSettings.rxFooter,
        instructions: clinicSettings.rxInstructions,
      },
      uhid: (await ClinicPatientProfile.findOne({ workspace: req.workspace._id, contact: visit.contact?._id || visit.contact }).select('uhid').lean())?.uhid || '',
    });
    rx.pdfUrl = pdf.url;
    await rx.save();
    res.json({ success: true, data: rx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendPrescription = async (req, res) => {
  try {
    const visit = await ClinicVisit.findOne({ _id: req.params.id, workspace: req.workspace._id })
      .populate('contact')
      .populate('doctor', 'name');
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    const rx = await ClinicPrescription.findOne({ visit: visit._id });
    if (!rx || !rx.pdfUrl) return res.status(400).json({ success: false, message: 'Save the prescription PDF first' });
    const phone = visit.patientPhone || visit.contact?.phone;
    if (!phone) return res.status(400).json({ success: false, message: 'No patient phone number' });
    const workspace = await Workspace.findById(req.workspace._id);
    if (!workspace?.whatsapp?.accessToken || !workspace?.whatsapp?.phoneNumberId) {
      return res.status(400).json({ success: false, message: 'WhatsApp is not connected' });
    }
    const settings = await getOrCreateSettings(req.workspace._id);
    let cleanPhone = String(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const caption = settings.whatsappRxCaption || 'Your prescription is attached.';
    const wa = new WhatsAppService(workspace.whatsapp.accessToken, workspace.whatsapp.phoneNumberId);
    const result = await wa.sendMediaMessage(cleanPhone, 'document', rx.pdfUrl, caption);
    if (!result?.success) {
      return res.status(400).json({ success: false, message: result?.error?.message || 'WhatsApp send failed' });
    }
    rx.sentOnWhatsAppAt = new Date();
    await rx.save();

    try {
      const Conversation = require('../models/Conversation');
      const Message = require('../models/Message');
      let contact = visit.contact;
      if (!contact) {
        contact = await Contact.findOne({ workspace: workspace._id, phone: { $regex: cleanPhone.slice(-10) + '$' } });
      }
      if (contact) {
        let conversation = await Conversation.findOne({ workspace: workspace._id, contact: contact._id });
        if (!conversation) {
          conversation = await Conversation.create({
            workspace: workspace._id,
            contact: contact._id,
            channel: 'whatsapp',
            lastMessageAt: new Date(),
          });
        }
        await Message.create({
          workspace: workspace._id,
          conversation: conversation._id,
          contact: contact._id,
          direction: 'outbound',
          type: 'document',
          text: caption,
          media: { url: rx.pdfUrl, caption, mimeType: 'application/pdf', filename: 'prescription.pdf' },
          waMessageId: result.data?.messages?.[0]?.id || '',
          status: 'sent',
          isAutomated: true,
          metadata: { source: 'clinic_rx', visitId: visit._id },
        });
      }
    } catch (e) { /* inbox save is best-effort */ }

    res.json({ success: true, data: rx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const s = await getOrCreateSettings(req.workspace._id);
    res.json({ success: true, data: s });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    if (req.user?.staffType === 'doctor') {
      return res.status(403).json({ success: false, message: 'Only clinic administrators can change settings' });
    }
    const s = await getOrCreateSettings(req.workspace._id);
    const allowed = [
      'slotDuration', 'whatsappConfirm', 'whatsappReminder', 'whatsappRxCaption', 'uhidPrefix',
      'clinicName', 'clinicPhone', 'clinicEmail', 'clinicAddress', 'clinicWebsite', 'clinicLogo',
      'timezone', 'currency', 'language',
      'tokenPrefix', 'tokenResetPolicy',
      'rxHeader', 'rxFooter', 'rxInstructions',
      'remind24h', 'remind1h', 'confirmOnCreate',
    ];
    for (const k of allowed) if (k in req.body) s[k] = req.body[k];
    if (s.slotDuration) s.slotDuration = Math.max(5, Math.min(180, Number(s.slotDuration) || 15));
    if (s.uhidPrefix != null) {
      s.uhidPrefix = String(s.uhidPrefix).replace(/[^A-Za-z0-9-]/g, '').slice(0, 8) || 'CLN';
    }
    if (s.tokenPrefix != null) s.tokenPrefix = String(s.tokenPrefix).replace(/[^A-Za-z0-9-]/g, '').slice(0, 6);
    await s.save();
    await logAction(req.workspace._id, req.user._id, 'clinic.settings.update', 'ClinicSettings', String(s._id), '', req.ip);
    res.json({ success: true, data: s });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const doctor = await ClinicDoctor.findOne({ workspace: req.workspace._id, userId: req.user._id });
    res.json({ success: true, data: { staffType: req.user.staffType || '', doctor } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor,
  getSchedule, updateSchedule,
  listPatients, getPatient, upsertPatient, archivePatient, exportPatients, findDuplicates,
  listQueue, checkIn, callToken, skipToken, completeToken, callNext, requeueToken, noShowToken, cancelToken,
  listVisits, getVisit, updateVisit, finalizeVisit, savePrescription, sendPrescription,
  getSettings, updateSettings, getMe,
};
