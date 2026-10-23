const Appointment = require('../models/Appointment');
const Workspace = require('../models/Workspace');
const Contact = require('../models/Contact');
const WhatsAppService = require('../services/whatsappService');
const { sendPaginated } = require('../utils/apiResponse');
const bookingService = require('../services/bookingService');

// IST timezone helper
const toIST = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

const formatDateIST = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { 
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' 
  });
};

// Check for time slot conflicts (per doctor when doctorId is set)
const checkTimeConflict = async (workspaceId, date, startTime, endTime, excludeId = null, doctorId = null) => {
  const dateObj = new Date(date);
  const dayStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const dayEnd = new Date(dayStart.getTime() + 86400000);

  const query = {
    workspace: workspaceId,
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $in: ['scheduled', 'confirmed', 'checked_in', 'in_consultation', 'rescheduled'] },
  };
  if (excludeId) query._id = { $ne: excludeId };
  if (doctorId) query.doctor = doctorId;

  const existing = await Appointment.find(query);
  
  const newStart = parseInt(startTime.replace(':', ''));
  const newEnd = endTime ? parseInt(endTime.replace(':', '')) : newStart + 30;

  for (const appt of existing) {
    const apptStart = parseInt((appt.startTime || '00:00').replace(':', ''));
    const apptEnd = parseInt((appt.endTime || '23:59').replace(':', ''));
    
    if (newStart < apptEnd && newEnd > apptStart) {
      return { conflict: true, conflictWith: appt };
    }
  }
  return { conflict: false };
};

const getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, date, doctor } = req.query;
    const query = { workspace: req.workspace._id };
    query.archived = req.query.archived === 'true' ? true : { $ne: true };
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    if (doctor) query.doctor = doctor;
    if (req.user?.staffType === 'doctor') {
      const ClinicDoctor = require('../models/ClinicDoctor');
      const mine = await ClinicDoctor.findOne({ workspace: req.workspace._id, userId: req.user._id }).select('_id');
      query.doctor = mine ? mine._id : { $in: [] };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('contact', 'name phone')
      .populate('assignedTo', 'name')
      .populate('doctor', 'name specialty')
      .sort('date startTime')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: appointments, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, workspace: req.workspace._id })
      .populate('contact', 'name phone')
      .populate('assignedTo', 'name')
      .populate('doctor', 'name specialty');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send WhatsApp notification for appointment + save to chat inbox
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const sendAppointmentMessage = async (workspace, appointment, type) => {
  try {
    if (!workspace.whatsapp?.accessToken || !workspace.whatsapp?.phoneNumberId) return;

    // Find contact - first by reference, then by phone matching
    let contact = appointment.contact ? await Contact.findById(appointment.contact) : null;
    let phone = contact?.phone || appointment.contactPhone;
    if (!phone) return;

    let cleanPhone = phone.replace(/[^0-9]/g, '');
    // Ensure phone has country code (91 for India)
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // If no contact ref, try finding existing contact by phone (with/without country code)
    if (!contact) {
      contact = await Contact.findOne({
        workspace: workspace._id,
        $or: [
          { phone: cleanPhone },
          { phone: '+' + cleanPhone },
          { phone: cleanPhone.replace(/^91/, '') },
          { phone: { $regex: cleanPhone.slice(-10) + '$' } },
        ]
      });
    }
    const wa = new WhatsAppService(workspace.whatsapp.accessToken, workspace.whatsapp.phoneNumberId);

    const dateStr = formatDateIST(appointment.date);
    const timeStr = appointment.startTime || '';
    const title = appointment.title || 'Appointment';
    const contactName = contact?.name || appointment.contactName || 'Customer';

    let message = '';
    switch(type) {
      case 'created':
        message = `Hi ${contactName}! ✅ Your appointment "${title}" has been scheduled for ${dateStr} at ${timeStr} (IST). We look forward to meeting you!\n\nReply RESCHEDULE to change timing or CANCEL to cancel.`;
        break;
      case 'confirmed':
        message = `Hi ${contactName}! ✅ Your appointment "${title}" on ${dateStr} at ${timeStr} (IST) has been confirmed. See you soon!`;
        break;
      case 'completed':
        message = `Hi ${contactName}! Your appointment "${title}" has been completed. Thank you for visiting us! 🙏`;
        break;
      case 'cancelled':
        message = `Hi ${contactName}, your appointment "${title}" scheduled for ${dateStr} has been cancelled. Reply BOOK to schedule a new appointment.`;
        break;
      case 'rescheduled':
        message = `Hi ${contactName}! Your appointment "${title}" has been rescheduled to ${dateStr} at ${timeStr} (IST). See you then!`;
        break;
      case 'reminder_1h':
        message = `⏰ Reminder: Hi ${contactName}, your appointment "${title}" is in 1 HOUR — ${dateStr} at ${timeStr} (IST). See you soon!`;
        break;
      case 'reminder_24h':
        message = `📅 Reminder: Hi ${contactName}, you have an appointment "${title}" TOMORROW — ${dateStr} at ${timeStr} (IST). Don't forget!\n\nReply RESCHEDULE to change or CANCEL to cancel.`;
        break;
      case 'reminder':
        message = `⏰ Reminder: Hi ${contactName}, you have an appointment "${title}" scheduled for ${dateStr} at ${timeStr} (IST). See you soon!`;
        break;
    }

    if (message) {
      const result = await wa.sendTextMessage(cleanPhone, message);
      console.log(`[Appointment] Sent ${type} message to ${cleanPhone}`);

      // Save message to chat inbox so it shows in conversations
      try {
        // Find existing contact by phone (handle with/without country code)
        let dbContact = contact;
        if (!dbContact) {
          const last10 = cleanPhone.slice(-10);
          dbContact = await Contact.findOne({
            workspace: workspace._id,
            $or: [
              { phone: cleanPhone },
              { phone: '+' + cleanPhone },
              { phone: last10 },
              { phone: { $regex: last10 + '$' } },
            ]
          });
        }
        if (!dbContact) {
          dbContact = await Contact.create({
            workspace: workspace._id, phone: cleanPhone, name: appointment.contactName || cleanPhone, status: 'active'
          });
        }

        // Find or create conversation
        let conversation = await Conversation.findOneAndUpdate(
          { workspace: workspace._id, contact: dbContact._id },
          { 
            workspace: workspace._id, 
            contact: dbContact._id,
            lastMessage: { text: message, timestamp: new Date(), direction: 'outbound', type: 'text' },
            $setOnInsert: { status: 'active' }
          },
          { upsert: true, new: true }
        );

        // Create message record
        await Message.create({
          workspace: workspace._id,
          conversation: conversation._id,
          contact: dbContact._id,
          direction: 'outbound',
          type: 'text',
          text: message,
          status: result?.success ? 'sent' : 'failed',
          waMessageId: result?.data?.messages?.[0]?.id || '',
          isAutomated: true,
          metadata: { source: 'appointment_' + type, appointmentId: appointment._id },
        });
      } catch (dbErr) {
        console.error('[Appointment] DB save error:', dbErr.message);
      }
    }
  } catch (err) {
    console.error('[Appointment] Message send error:', err.message);
  }
};

const APPT_WRITE_FIELDS = [
  'title', 'contact', 'contactName', 'contactPhone', 'contactEmail',
  'date', 'startTime', 'endTime', 'duration', 'notes', 'assignedTo',
  'doctor', 'type', 'location', 'reminderSettings', 'metadata', 'status',
];
function pickApptFields(body) {
  const out = {};
  for (const k of APPT_WRITE_FIELDS) if (k in body) out[k] = body[k];
  delete out.workspace;
  return out;
}

const createAppointment = async (req, res) => {
  try {
    const body = pickApptFields(req.body);
    // Slot capacity check (allows multiple bookings per slot up to maxPerSlot).
    if (body.date && body.startTime) {
      const settings = await bookingService.getSettings(req.workspace._id);
      const cap = Math.max(1, settings.maxPerSlot || 1);
      const dateObj = new Date(body.date);
      const dayStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const usedQuery = {
        workspace: req.workspace._id,
        date: { $gte: dayStart, $lt: dayEnd },
        startTime: body.startTime,
        status: { $in: ['scheduled', 'confirmed', 'checked_in', 'in_consultation', 'rescheduled'] },
      };
      if (body.doctor) usedQuery.doctor = body.doctor;
      const used = await Appointment.countDocuments(usedQuery);
      if (used >= cap) {
        return res.status(400).json({
          success: false,
          message: `This slot is full (${used}/${cap} booked at ${body.startTime}). Please choose another time.`,
        });
      }
      // Overlap check against other appointments for this doctor.
      if (body.doctor) {
        const { conflict, conflictWith } = await checkTimeConflict(
          req.workspace._id, body.date, body.startTime, body.endTime, null, body.doctor
        );
        if (conflict) {
          return res.status(400).json({
            success: false,
            message: `Time conflict: "${conflictWith.title}" is already booked ${conflictWith.startTime}-${conflictWith.endTime} on this date.`,
          });
        }
      }
    }
    const appointment = await Appointment.create({ ...body, workspace: req.workspace._id });

    try {
      const bkSettings = await bookingService.getSettings(req.workspace._id);
      bookingService.notifyBooking(bkSettings, appointment);
    } catch (e) { /* notify is best-effort */ }

    require('../services/googleCalendar').createEventForAppointment(appointment);

    // Send WhatsApp confirmation
    const workspace = await Workspace.findById(req.workspace._id);
    if (workspace && req.body.sendNotification !== false) {
      sendAppointmentMessage(workspace, appointment, 'created');
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const oldAppointment = await Appointment.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!oldAppointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, workspace: req.workspace._id },
      pickApptFields(req.body),
      { new: true }
    );

    // Send notification on status change
    if (req.body.status && req.body.status !== oldAppointment.status) {
      const workspace = await Workspace.findById(req.workspace._id);
      if (workspace) {
        sendAppointmentMessage(workspace, appointment, req.body.status);
      }
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reschedule appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime) return res.status(400).json({ success: false, message: 'Date and startTime required' });

    const appointment = await Appointment.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Check for time slot conflict (exclude current appointment)
    const { conflict, conflictWith } = await checkTimeConflict(
      req.workspace._id, date, startTime, endTime || appointment.endTime, appointment._id, appointment.doctor
    );
    if (conflict) {
      const conflictTime = conflictWith.startTime + '-' + conflictWith.endTime;
      return res.status(400).json({
        success: false,
        message: 'Time slot conflict! "' + conflictWith.title + '" is already booked at ' + conflictTime + ' on this date. Please choose a different time.'
      });
    }

    // Save previous date/time
    appointment.previousDate = appointment.date;
    appointment.previousTime = appointment.startTime;
    appointment.date = new Date(date);
    appointment.startTime = startTime;
    if (endTime) appointment.endTime = endTime;
    appointment.status = 'rescheduled';
    appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1;
    appointment.reminder1hSent = false;
    appointment.reminder24hSent = false;
    await appointment.save();

    // Send rescheduled notification
    const workspace = await Workspace.findById(req.workspace._id);
    if (workspace) {
      sendAppointmentMessage(workspace, appointment, 'rescheduled');
    }

    res.json({ success: true, data: appointment, message: 'Appointment rescheduled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = 'cancelled';
    appointment.cancelReason = String(req.body?.reason || '').slice(0, 300);
    appointment.cancelledBy = req.user?._id || null;
    appointment.cancelledAt = new Date();
    // Any pending reminders are moot once cancelled.
    await appointment.save();

    // Free the queue slot for the day if the patient was still waiting.
    try {
      const ClinicQueueToken = require('../models/ClinicQueueToken');
      const today = `${appointment.date.getFullYear()}-${String(appointment.date.getMonth() + 1).padStart(2, '0')}-${String(appointment.date.getDate()).padStart(2, '0')}`;
      await ClinicQueueToken.updateMany(
        { appointment: appointment._id, date: today, status: { $in: ['waiting', 'skipped'] } },
        { status: 'cancelled', cancelReason: appointment.cancelReason || 'Appointment cancelled', completedAt: new Date() }
      );
    } catch { /* best-effort */ }

    // Send cancellation notification
    const workspace = await Workspace.findById(req.workspace._id);
    if (workspace) {
      sendAppointmentMessage(workspace, appointment, 'cancelled');
    }

    res.json({ success: true, data: appointment, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark appointment as no-show (patient never arrived)
const noShowAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    appointment.status = 'no_show';
    appointment.noShowAt = new Date();
    appointment.cancelReason = String(req.body?.reason || '').slice(0, 300);
    await appointment.save();
    try {
      const ClinicQueueToken = require('../models/ClinicQueueToken');
      await ClinicQueueToken.updateMany(
        { appointment: appointment._id, status: { $in: ['waiting', 'skipped'] } },
        { status: 'no_show', completedAt: new Date() }
      );
    } catch { /* best-effort */ }
    await require('../services/auditService').logAction(req.workspace._id, req.user?._id, 'appointment.no_show', 'Appointment', String(appointment._id), appointment.cancelReason, req.ip);
    res.json({ success: true, data: appointment, message: 'Marked as no-show' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findOneAndDelete({ _id: req.params.id, workspace: req.workspace._id });
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send manual reminder
const sendReminder = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, workspace: req.workspace._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const workspace = await Workspace.findById(req.workspace._id);
    if (!workspace) return res.status(400).json({ success: false, message: 'Workspace not found' });

    await sendAppointmentMessage(workspace, appointment, 'reminder');
    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Auto-reminder cron function (called every 5 min by scheduler)
const processAutoReminders = async () => {
  try {
    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find appointments needing 1-hour reminder
    const appts1h = await Appointment.find({
      status: { $in: ['scheduled', 'confirmed', 'rescheduled'] },
      reminder1hSent: { $ne: true },
      date: { $lte: in1h, $gte: now },
    }).populate('contact', 'name phone');

    for (const appt of appts1h) {
      // Check if appointment time is within 1 hour
      const apptDate = new Date(appt.date);
      const [hours, minutes] = (appt.startTime || '00:00').split(':').map(Number);
      apptDate.setHours(hours, minutes, 0, 0);
      
      const diff = apptDate.getTime() - now.getTime();
      if (diff > 0 && diff <= 60 * 60 * 1000) {
        const workspace = await Workspace.findById(appt.workspace);
        if (workspace) {
          await sendAppointmentMessage(workspace, appt, 'reminder_1h');
          require('../services/ownerNotify').appointmentReminder(appt, '1 hour').catch(() => {});
          appt.reminder1hSent = true;
          await appt.save();
          console.log(`[Appointment] Auto 1h reminder sent for: ${appt.title}`);
        }
      }
    }

    // Find appointments needing 24-hour reminder
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    const appts24h = await Appointment.find({
      status: { $in: ['scheduled', 'confirmed', 'rescheduled'] },
      reminder24hSent: { $ne: true },
      date: { $gte: tomorrow, $lte: tomorrowEnd },
    });

    for (const appt of appts24h) {
      const workspace = await Workspace.findById(appt.workspace);
      if (workspace) {
        await sendAppointmentMessage(workspace, appt, 'reminder_24h');
        appt.reminder24hSent = true;
        await appt.save();
        console.log(`[Appointment] Auto 24h reminder sent for: ${appt.title}`);
      }
    }

    return { sent1h: appts1h.length, sent24h: appts24h.length };
  } catch (err) {
    console.error('[Appointment] Auto-reminder error:', err.message);
  }
};

// ---------- Availability settings ----------
const getAvailability = async (req, res) => {
  try {
    const s = await bookingService.getSettings(req.workspace._id);
    res.json({ success: true, data: s });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const s = await bookingService.getSettings(req.workspace._id);
    const allowed = ['enabled', 'title', 'description', 'timezone', 'slotDuration', 'maxPerSlot', 'advanceDays', 'weekly', 'overrides', 'notificationEmails'];
    for (const k of allowed) if (k in req.body) s[k] = req.body[k];
    if ('notificationEmails' in req.body) {
      const raw = Array.isArray(req.body.notificationEmails) ? req.body.notificationEmails : String(req.body.notificationEmails || '').split(',');
      s.notificationEmails = raw.map((e) => String(e).trim()).filter((e) => e.includes('@'));
    }
    if (Array.isArray(s.overrides)) {
      s.overrides = s.overrides
        .filter((o) => o && /^\d{4}-\d{2}-\d{2}$/.test(o.date))
        .map((o) => ({ date: o.date, unavailable: !!o.unavailable, windows: Array.isArray(o.windows) ? o.windows : [] }));
    }
    if (s.slotDuration) s.slotDuration = Math.max(5, Math.min(480, Number(s.slotDuration) || 30));
    if (s.maxPerSlot) s.maxPerSlot = Math.max(1, Math.min(100, Number(s.maxPerSlot) || 1));
    await s.save();
    res.json({ success: true, data: s });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSlots = async (req, res) => {
  try {
    const date = String(req.query.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ success: false, message: 'date (YYYY-MM-DD) required' });
    const s = await bookingService.getSettings(req.workspace._id);
    const doctorId = req.query.doctor || null;
    const slots = await bookingService.slotsForDate(req.workspace._id, s, date, doctorId);
    const resolved = await bookingService.resolveDoctorSchedule(req.workspace._id, s, doctorId);
    res.json({ success: true, data: { date, slotDuration: (resolved && resolved.slotDuration) || s.slotDuration, slots } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getAppointments, getAppointment, createAppointment, updateAppointment, 
  deleteAppointment, sendReminder, rescheduleAppointment, cancelAppointment, noShowAppointment,
  processAutoReminders,
  getAvailability, updateAvailability, getSlots,
};
