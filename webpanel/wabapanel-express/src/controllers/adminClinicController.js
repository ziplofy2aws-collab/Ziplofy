const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Contact = require('../models/Contact');
const Appointment = require('../models/Appointment');
const ClinicDoctor = require('../models/ClinicDoctor');
const ClinicPatientProfile = require('../models/ClinicPatientProfile');
const ClinicVisit = require('../models/ClinicVisit');
const ClinicPrescription = require('../models/ClinicPrescription');
const ClinicSettings = require('../models/ClinicSettings');

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
  if ('archived' in body) med.archived = !!body.archived;
  return med;
}

async function assignUhid(workspaceId, medical) {
  if (medical.uhid) return medical;
  let s = await ClinicSettings.findOne({ workspace: workspaceId });
  if (!s) s = await ClinicSettings.create({ workspace: workspaceId });
  const prefix = String(s.uhidPrefix || 'CLN').replace(/[^A-Za-z0-9-]/g, '').slice(0, 8) || 'CLN';
  const seq = Math.max(1, Number(s.nextUhidSeq) || 1);
  s.nextUhidSeq = seq + 1;
  await s.save();
  medical.uhid = `${prefix}-${String(seq).padStart(4, '0')}`;
  await medical.save();
  return medical;
}

async function vendorWorkspace(vendorId) {
  const vendor = await User.findOne({ _id: vendorId, role: 'vendor' })
    .select('name email companyName status featureOverrides');
  if (!vendor) return { error: 'Vendor not found', status: 404 };
  const workspace = await Workspace.findOne({ owner: vendor._id });
  if (!workspace) return { error: 'Workspace not found', status: 404 };
  return { vendor, workspace };
}

async function patientRows(workspaceId, { page = 1, limit = 20, search, archived } = {}) {
  const query = { workspace: workspaceId, isGroup: { $ne: true } };
  if (search) {
    const uhidHits = await ClinicPatientProfile.find({
      workspace: workspaceId,
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
      workspace: workspaceId,
      archived: true,
    }).select('contact').lean();
    const archivedIds = rows.map((p) => p.contact);
    query._id = archivedFilter === true ? { $in: archivedIds } : { $nin: archivedIds };
  }
  const total = await Contact.countDocuments(query);
  const contacts = await Contact.find(query)
    .sort('-updatedAt')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();
  if (!contacts.length) {
    return { data: [], total, page: Number(page), limit: Number(limit) };
  }
  const profiles = await ClinicPatientProfile.find({
    workspace: workspaceId,
    contact: { $in: contacts.map((c) => c._id) },
  }).lean();
  const pmap = {};
  for (const p of profiles) pmap[String(p.contact)] = p;
  const lastVisits = await ClinicVisit.aggregate([
    { $match: { workspace: workspaceId, contact: { $in: contacts.map((c) => c._id) } } },
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
  return { data, total, page: Number(page), limit: Number(limit) };
}

const listClinics = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', 'featureOverrides.clinic': true })
      .select('name email companyName status featureOverrides createdAt')
      .sort('companyName name')
      .lean();
    const data = await Promise.all(vendors.map(async (v) => {
      const ws = await Workspace.findOne({ owner: v._id }).select('_id');
      if (!ws) {
        return { vendor: v, workspaceId: null, counts: { doctors: 0, patients: 0, visits: 0 } };
      }
      const [doctors, patients, visits] = await Promise.all([
        ClinicDoctor.countDocuments({ workspace: ws._id }),
        ClinicPatientProfile.countDocuments({ workspace: ws._id, archived: { $ne: true } }),
        ClinicVisit.countDocuments({ workspace: ws._id }),
      ]);
      return { vendor: v, workspaceId: ws._id, counts: { doctors, patients, visits } };
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getClinic = async (req, res) => {
  try {
    const ctx = await vendorWorkspace(req.params.vendorId);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const { vendor, workspace } = ctx;
    const [doctors, countsDoctors, countsPatients, countsVisits, patients] = await Promise.all([
      ClinicDoctor.find({ workspace: workspace._id }).populate('userId', 'name email staffType').sort('name'),
      ClinicDoctor.countDocuments({ workspace: workspace._id }),
      ClinicPatientProfile.countDocuments({ workspace: workspace._id, archived: { $ne: true } }),
      ClinicVisit.countDocuments({ workspace: workspace._id }),
      patientRows(workspace._id, req.query),
    ]);
    res.json({
      success: true,
      data: {
        vendor,
        workspaceId: workspace._id,
        clinicEnabled: vendor.featureOverrides?.clinic === true,
        counts: { doctors: countsDoctors, patients: countsPatients, visits: countsVisits },
        doctors,
        patients,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctor = async (req, res) => {
  try {
    const ctx = await vendorWorkspace(req.params.vendorId);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const doctor = await ClinicDoctor.findOne({ _id: req.params.id, workspace: ctx.workspace._id })
      .populate('userId', 'name email staffType');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const ctx = await vendorWorkspace(req.params.vendorId);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const allowed = ['name', 'specialty', 'qualifications', 'consultationMins', 'room', 'photo', 'bio', 'active'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if (patch.consultationMins) patch.consultationMins = Math.max(5, Math.min(180, Number(patch.consultationMins) || 15));
    const doctor = await ClinicDoctor.findOneAndUpdate(
      { _id: req.params.id, workspace: ctx.workspace._id },
      patch,
      { new: true }
    ).populate('userId', 'name email staffType');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const ctx = await vendorWorkspace(req.params.vendorId);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const contact = await Contact.findOne({ _id: req.params.contactId, workspace: ctx.workspace._id }).lean();
    if (!contact) return res.status(404).json({ success: false, message: 'Patient not found' });
    const medical = await ClinicPatientProfile.findOne({ workspace: ctx.workspace._id, contact: contact._id }).lean();
    const visits = await ClinicVisit.find({ workspace: ctx.workspace._id, contact: contact._id })
      .populate('doctor', 'name specialty')
      .sort('-date -createdAt')
      .limit(50);
    const prescriptions = await ClinicPrescription.find({ visit: { $in: visits.map((v) => v._id) } }).sort('-createdAt');
    const appointments = await Appointment.find({ workspace: ctx.workspace._id, contact: contact._id })
      .populate('doctor', 'name specialty')
      .sort('-date -startTime')
      .limit(50);
    res.json({ success: true, data: { contact, medical, visits, prescriptions, appointments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const ctx = await vendorWorkspace(req.params.vendorId);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const body = req.body || {};
    const contact = await Contact.findOne({ _id: req.params.contactId, workspace: ctx.workspace._id });
    if (!contact) return res.status(404).json({ success: false, message: 'Patient not found' });
    if (body.name) contact.name = body.name;
    if (body.phone) contact.phone = body.phone;
    if (body.email != null) contact.email = body.email;
    await contact.save();
    const medFields = pickMedFields(body);
    let medical = await ClinicPatientProfile.findOneAndUpdate(
      { workspace: ctx.workspace._id, contact: contact._id },
      { $set: medFields, $setOnInsert: { workspace: ctx.workspace._id, contact: contact._id } },
      { new: true, upsert: true }
    );
    medical = await assignUhid(ctx.workspace._id, medical);
    res.json({ success: true, data: { contact, medical } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setClinicFeature = async (req, res) => {
  try {
    const vendor = await User.findOne({ _id: req.params.vendorId, role: 'vendor' });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    const enabled = req.body.enabled === true;
    vendor.featureOverrides = { ...(vendor.featureOverrides || {}) };
    vendor.featureOverrides.clinic = enabled;
    vendor.markModified('featureOverrides');
    await vendor.save();
    res.json({ success: true, data: { clinic: enabled, featureOverrides: vendor.featureOverrides } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinics,
  getClinic,
  getDoctor,
  updateDoctor,
  getPatient,
  updatePatient,
  setClinicFeature,
};
