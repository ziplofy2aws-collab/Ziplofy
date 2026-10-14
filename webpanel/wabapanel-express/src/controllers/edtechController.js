const User = require('../models/User');
const Contact = require('../models/Contact');
const Workspace = require('../models/Workspace');
const EdtechSettings = require('../models/EdtechSettings');
const EdtechTeacher = require('../models/EdtechTeacher');
const EdtechCourse = require('../models/EdtechCourse');
const EdtechBatch = require('../models/EdtechBatch');
const EdtechStudentProfile = require('../models/EdtechStudentProfile');
const EdtechEnrollment = require('../models/EdtechEnrollment');
const EdtechAttendance = require('../models/EdtechAttendance');

const todayStr = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

async function getOrCreateSettings(workspaceId) {
  let s = await EdtechSettings.findOne({ workspace: workspaceId });
  if (!s) s = await EdtechSettings.create({ workspace: workspaceId });
  return s;
}

async function scopedTeacher(req) {
  if (req.user?.staffType !== 'teacher') return null;
  return EdtechTeacher.findOne({ workspace: req.workspace._id, userId: req.user._id });
}

function blockTeacherWrite(req, res) {
  if (req.user?.staffType === 'teacher') {
    res.status(403).json({ success: false, message: 'Teachers cannot change institute setup' });
    return true;
  }
  return false;
}

async function teacherBatchIds(workspaceId, teacherId) {
  const rows = await EdtechBatch.find({ workspace: workspaceId, teacher: teacherId }).select('_id').lean();
  return rows.map((r) => r._id);
}

async function assignEnrollment(workspaceId, profile) {
  if (profile.enrollmentNo) return profile;
  const s = await getOrCreateSettings(workspaceId);
  const prefix = String(s.enrollmentPrefix || 'STU').replace(/[^A-Za-z0-9-]/g, '').slice(0, 8) || 'STU';
  const seq = Math.max(1, Number(s.nextEnrollmentSeq) || 1);
  s.nextEnrollmentSeq = seq + 1;
  await s.save();
  profile.enrollmentNo = `${prefix}-${String(seq).padStart(4, '0')}`;
  await profile.save();
  return profile;
}

const getMe = async (req, res) => {
  try {
    const teacher = await EdtechTeacher.findOne({ workspace: req.workspace._id, userId: req.user._id });
    res.json({ success: true, data: { staffType: req.user.staffType || '', teacher } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const dashboard = async (req, res) => {
  try {
    const ws = req.workspace._id;
    const mine = await scopedTeacher(req);
    const batchFilter = { workspace: ws };
    if (mine) batchFilter.teacher = mine._id;
    const batches = await EdtechBatch.find(batchFilter).select('_id').lean();
    const batchIds = batches.map((b) => b._id);
    const [courses, teachers, students, enrollments] = await Promise.all([
      mine ? Promise.resolve(0) : EdtechCourse.countDocuments({ workspace: ws, active: { $ne: false } }),
      mine ? Promise.resolve(1) : EdtechTeacher.countDocuments({ workspace: ws, active: { $ne: false } }),
      mine
        ? EdtechEnrollment.distinct('contact', { workspace: ws, batch: { $in: batchIds }, status: 'active' }).then((ids) => ids.length)
        : EdtechStudentProfile.countDocuments({ workspace: ws, archived: { $ne: true } }),
      EdtechEnrollment.countDocuments({ workspace: ws, batch: { $in: batchIds }, status: 'active' }),
    ]);
    res.json({
      success: true,
      data: { courses, teachers, students, batches: batchIds.length, enrollments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listTeachers = async (req, res) => {
  try {
    const mine = await scopedTeacher(req);
    const filter = { workspace: req.workspace._id };
    if (mine) filter._id = mine._id;
    const teachers = await EdtechTeacher.find(filter).populate('userId', 'name email staffType').sort('name');
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const body = req.body || {};
    if (!body.name) return res.status(400).json({ success: false, message: 'name is required' });
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
        staffType: 'teacher',
        permissions: ['edtech'],
        currentWorkspace: req.workspace._id,
      });
      await Workspace.updateOne(
        { _id: req.workspace._id, 'members.user': { $ne: agent._id } },
        { $push: { members: { user: agent._id, role: 'agent' } } }
      );
      userId = agent._id;
    }
    const teacher = await EdtechTeacher.create({
      workspace: req.workspace._id,
      userId,
      name: body.name,
      subject: body.subject || '',
      phone: body.phone || '',
      active: body.active !== false,
    });
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const allowed = ['name', 'subject', 'phone', 'active'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    const teacher = await EdtechTeacher.findOneAndUpdate(
      { _id: req.params.id, workspace: req.workspace._id },
      patch,
      { new: true }
    );
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listCourses = async (req, res) => {
  try {
    const courses = await EdtechCourse.find({ workspace: req.workspace._id }).sort('name');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const body = req.body || {};
    if (!body.name) return res.status(400).json({ success: false, message: 'name is required' });
    const course = await EdtechCourse.create({
      workspace: req.workspace._id,
      name: body.name,
      subject: body.subject || '',
      grade: body.grade || '',
      description: String(body.description || '').trim().slice(0, 1000),
      feeAmount: Math.max(0, Number(body.feeAmount) || 0),
      active: body.active !== false,
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const allowed = ['name', 'subject', 'grade', 'description', 'feeAmount', 'active'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if ('feeAmount' in patch) patch.feeAmount = Math.max(0, Number(patch.feeAmount) || 0);
    if ('description' in patch) patch.description = String(patch.description || '').trim().slice(0, 1000);
    const course = await EdtechCourse.findOneAndUpdate(
      { _id: req.params.id, workspace: req.workspace._id },
      patch,
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listBatches = async (req, res) => {
  try {
    const mine = await scopedTeacher(req);
    const filter = { workspace: req.workspace._id };
    if (mine) filter.teacher = mine._id;
    if (req.query.course) filter.course = req.query.course;
    const batches = await EdtechBatch.find(filter)
      .populate('course', 'name subject grade feeAmount')
      .populate('teacher', 'name subject')
      .sort('name');
    res.json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBatch = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const body = req.body || {};
    if (!body.name || !body.course) return res.status(400).json({ success: false, message: 'name and course are required' });
    const course = await EdtechCourse.findOne({ _id: body.course, workspace: req.workspace._id });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const batch = await EdtechBatch.create({
      workspace: req.workspace._id,
      course: course._id,
      teacher: body.teacher || null,
      name: body.name,
      days: Array.isArray(body.days) ? body.days.map(Number).filter((n) => n >= 0 && n <= 6) : [1, 2, 3, 4, 5],
      startTime: body.startTime || '09:00',
      endTime: body.endTime || '10:00',
      room: body.room || '',
      capacity: Math.max(1, Number(body.capacity) || 30),
      active: body.active !== false,
    });
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const allowed = ['name', 'course', 'teacher', 'days', 'startTime', 'endTime', 'room', 'capacity', 'active'];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    if ('capacity' in patch) patch.capacity = Math.max(1, Number(patch.capacity) || 30);
    if (Array.isArray(patch.days)) patch.days = patch.days.map(Number).filter((n) => n >= 0 && n <= 6);
    const batch = await EdtechBatch.findOneAndUpdate(
      { _id: req.params.id, workspace: req.workspace._id },
      patch,
      { new: true }
    );
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { workspace: req.workspace._id, archived: { $ne: true } };
    const mine = await scopedTeacher(req);
    if (mine) {
      const ids = await teacherBatchIds(req.workspace._id, mine._id);
      const contacts = await EdtechEnrollment.find({
        workspace: req.workspace._id,
        batch: { $in: ids },
        status: 'active',
      }).distinct('contact');
      filter.contact = { $in: contacts };
    }
    if (search) {
      const q = String(search).trim();
      const contactHits = await Contact.find({
        workspace: req.workspace._id,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
        ],
      }).select('_id').lean();
      const or = [
        { enrollmentNo: { $regex: q, $options: 'i' } },
        { contact: { $in: contactHits.map((c) => c._id) } },
      ];
      filter.$or = or;
    }
    const total = await EdtechStudentProfile.countDocuments(filter);
    const profiles = await EdtechStudentProfile.find(filter)
      .sort('-updatedAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    const contacts = await Contact.find({ _id: { $in: profiles.map((p) => p.contact) } }).lean();
    const cmap = {};
    for (const c of contacts) cmap[String(c._id)] = c;
    const data = profiles.map((p) => ({ ...p, contact: cmap[String(p.contact)] || null }));
    res.json({ success: true, data, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const profile = await EdtechStudentProfile.findOne({
      workspace: req.workspace._id,
      contact: req.params.contactId,
    }).lean();
    const contact = await Contact.findOne({ _id: req.params.contactId, workspace: req.workspace._id }).lean();
    if (!contact || !profile) return res.status(404).json({ success: false, message: 'Student not found' });
    const mine = await scopedTeacher(req);
    let enrollFilter = { workspace: req.workspace._id, contact: contact._id };
    if (mine) {
      const ids = await teacherBatchIds(req.workspace._id, mine._id);
      const allowed = await EdtechEnrollment.exists({ ...enrollFilter, batch: { $in: ids }, status: 'active' });
      if (!allowed) return res.status(403).json({ success: false, message: 'Not allowed' });
      enrollFilter.batch = { $in: ids };
    }
    const enrollments = await EdtechEnrollment.find(enrollFilter)
      .populate({ path: 'batch', select: 'name startTime endTime course teacher', populate: { path: 'course', select: 'name' } });
    res.json({ success: true, data: { contact, profile, enrollments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upsertStudent = async (req, res) => {
  try {
    const body = req.body || {};
    let contact = null;
    if (req.params.contactId && req.params.contactId !== 'new') {
      contact = await Contact.findOne({ _id: req.params.contactId, workspace: req.workspace._id });
      if (!contact) return res.status(404).json({ success: false, message: 'Student not found' });
      if (req.user?.staffType === 'teacher') {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }
      if (body.name) contact.name = body.name;
      if (body.phone) contact.phone = body.phone;
      if (body.email != null) contact.email = body.email;
      await contact.save();
    } else {
      if (blockTeacherWrite(req, res)) return;
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
    const set = { archived: false };
    for (const k of ['grade', 'guardianName', 'guardianPhone', 'address', 'enrollmentNo']) {
      if (k in body) set[k] = body[k] || '';
    }
    if ('dob' in body) set.dob = body.dob ? body.dob : null;
    let profile = await EdtechStudentProfile.findOneAndUpdate(
      { workspace: req.workspace._id, contact: contact._id },
      { $set: set, $setOnInsert: { workspace: req.workspace._id, contact: contact._id } },
      { new: true, upsert: true }
    );
    profile = await assignEnrollment(req.workspace._id, profile);
    res.json({ success: true, data: { contact, profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const archiveStudent = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const profile = await EdtechStudentProfile.findOneAndUpdate(
      { workspace: req.workspace._id, contact: req.params.contactId },
      { archived: true },
      { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: profile, message: 'Student archived' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const enrollStudent = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const batch = await EdtechBatch.findOne({ _id: req.params.id, workspace: req.workspace._id }).populate('course', 'feeAmount');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    const contact = await Contact.findOne({ _id: req.body.contactId, workspace: req.workspace._id });
    if (!contact) return res.status(404).json({ success: false, message: 'Student not found' });
    const profile = await EdtechStudentProfile.findOne({ workspace: req.workspace._id, contact: contact._id, archived: { $ne: true } });
    if (!profile) return res.status(400).json({ success: false, message: 'Add the student before enrolling' });
    const activeCount = await EdtechEnrollment.countDocuments({ batch: batch._id, status: 'active' });
    const existing = await EdtechEnrollment.findOne({ workspace: req.workspace._id, batch: batch._id, contact: contact._id });
    if (!existing && activeCount >= batch.capacity) {
      return res.status(400).json({ success: false, message: 'Batch is full' });
    }
    const enrollment = await EdtechEnrollment.findOneAndUpdate(
      { workspace: req.workspace._id, batch: batch._id, contact: contact._id },
      {
        $set: { status: 'active' },
        $setOnInsert: {
          workspace: req.workspace._id,
          batch: batch._id,
          contact: contact._id,
          feeDue: Number(batch.course?.feeAmount) || 0,
          feePaid: 0,
        },
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEnrollment = async (req, res) => {
  try {
    if (blockTeacherWrite(req, res)) return;
    const patch = {};
    if ('feePaid' in req.body) patch.feePaid = Math.max(0, Number(req.body.feePaid) || 0);
    if ('feeDue' in req.body) patch.feeDue = Math.max(0, Number(req.body.feeDue) || 0);
    if (req.body.status === 'active' || req.body.status === 'left') patch.status = req.body.status;
    const row = await EdtechEnrollment.findOneAndUpdate(
      { _id: req.params.id, workspace: req.workspace._id },
      patch,
      { new: true }
    );
    if (!row) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date) ? req.query.date : todayStr();
    const batch = await EdtechBatch.findOne({ _id: req.query.batch, workspace: req.workspace._id });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    const mine = await scopedTeacher(req);
    if (mine && String(batch.teacher) !== String(mine._id)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const enrollments = await EdtechEnrollment.find({ batch: batch._id, status: 'active' }).select('contact').lean();
    const contacts = await Contact.find({ _id: { $in: enrollments.map((e) => e.contact) } }).select('name phone').lean();
    const sheet = await EdtechAttendance.findOne({ workspace: req.workspace._id, batch: batch._id, date }).lean();
    const marks = {};
    for (const m of sheet?.marks || []) marks[String(m.contact)] = m.status;
    res.json({
      success: true,
      data: {
        date,
        batch,
        students: contacts.map((c) => ({ ...c, status: marks[String(c._id)] || '' })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveAttendance = async (req, res) => {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.body.date) ? req.body.date : todayStr();
    const batch = await EdtechBatch.findOne({ _id: req.body.batch, workspace: req.workspace._id });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    const mine = await scopedTeacher(req);
    if (mine && String(batch.teacher) !== String(mine._id)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const allowed = new Set(['present', 'absent', 'late']);
    const marks = (Array.isArray(req.body.marks) ? req.body.marks : [])
      .filter((m) => m && m.contact && allowed.has(m.status))
      .map((m) => ({ contact: m.contact, status: m.status }));
    const sheet = await EdtechAttendance.findOneAndUpdate(
      { workspace: req.workspace._id, batch: batch._id, date },
      { $set: { marks }, $setOnInsert: { workspace: req.workspace._id, batch: batch._id, date } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: sheet });
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
    if (blockTeacherWrite(req, res)) return;
    const s = await getOrCreateSettings(req.workspace._id);
    if ('enrollmentPrefix' in req.body) {
      s.enrollmentPrefix = String(req.body.enrollmentPrefix || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 8) || 'STU';
    }
    await s.save();
    res.json({ success: true, data: s });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMe, dashboard,
  listTeachers, createTeacher, updateTeacher,
  listCourses, createCourse, updateCourse,
  listBatches, createBatch, updateBatch,
  listStudents, getStudent, upsertStudent, archiveStudent,
  enrollStudent, updateEnrollment,
  getAttendance, saveAttendance,
  getSettings, updateSettings,
};
