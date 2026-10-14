const User = require('../models/User');
const Workspace = require('../models/Workspace');
const EdtechTeacher = require('../models/EdtechTeacher');
const EdtechCourse = require('../models/EdtechCourse');
const EdtechBatch = require('../models/EdtechBatch');
const EdtechStudentProfile = require('../models/EdtechStudentProfile');

async function vendorWorkspace(vendorId) {
  const vendor = await User.findOne({ _id: vendorId, role: 'vendor' })
    .select('name email companyName status featureOverrides');
  if (!vendor) return { error: 'Vendor not found', status: 404 };
  const workspace = await Workspace.findOne({ owner: vendor._id });
  if (!workspace) return { error: 'Workspace not found', status: 404 };
  return { vendor, workspace };
}

const listInstitutes = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', 'featureOverrides.edtech': true })
      .select('name email companyName status createdAt')
      .sort('companyName name')
      .lean();
    const data = await Promise.all(vendors.map(async (v) => {
      const ws = await Workspace.findOne({ owner: v._id }).select('_id');
      if (!ws) return { vendor: v, counts: { teachers: 0, students: 0, batches: 0, courses: 0 } };
      const [teachers, students, batches, courses] = await Promise.all([
        EdtechTeacher.countDocuments({ workspace: ws._id }),
        EdtechStudentProfile.countDocuments({ workspace: ws._id, archived: { $ne: true } }),
        EdtechBatch.countDocuments({ workspace: ws._id }),
        EdtechCourse.countDocuments({ workspace: ws._id }),
      ]);
      return { vendor: v, counts: { teachers, students, batches, courses } };
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInstitute = async (req, res) => {
  try {
    const ctx = await vendorWorkspace(req.params.vendorId);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const ws = ctx.workspace._id;
    const [teachers, courses, batches, students] = await Promise.all([
      EdtechTeacher.find({ workspace: ws }).populate('userId', 'name email').sort('name'),
      EdtechCourse.find({ workspace: ws }).sort('name'),
      EdtechBatch.find({ workspace: ws }).populate('course', 'name').populate('teacher', 'name').sort('name'),
      EdtechStudentProfile.find({ workspace: ws, archived: { $ne: true } }).limit(200).lean(),
    ]);
    const Contact = require('../models/Contact');
    const contacts = await Contact.find({ _id: { $in: students.map((s) => s.contact) } }).select('name phone').lean();
    const cmap = {};
    for (const c of contacts) cmap[String(c._id)] = c;
    res.json({
      success: true,
      data: {
        vendor: ctx.vendor,
        edtechEnabled: ctx.vendor.featureOverrides?.edtech === true,
        teachers,
        courses,
        batches,
        students: students.map((s) => ({ ...s, contact: cmap[String(s.contact)] || null })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const ctx = await vendorWorkspace(req.params.vendorId);
    if (ctx.error) return res.status(ctx.status).json({ success: false, message: ctx.error });
    const allowed = ['name', 'subject', 'phone', 'active'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    const teacher = await EdtechTeacher.findOneAndUpdate(
      { _id: req.params.id, workspace: ctx.workspace._id },
      patch,
      { new: true }
    );
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setEdtechFeature = async (req, res) => {
  try {
    const vendor = await User.findOne({ _id: req.params.vendorId, role: 'vendor' });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    const enabled = req.body.enabled === true;
    vendor.featureOverrides = { ...(vendor.featureOverrides || {}) };
    vendor.featureOverrides.edtech = enabled;
    vendor.markModified('featureOverrides');
    await vendor.save();
    res.json({ success: true, data: { edtech: enabled } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listInstitutes, getInstitute, updateTeacher, setEdtechFeature };
