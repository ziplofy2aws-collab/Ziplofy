const mongoose = require('mongoose');
const SectorRecord = require('../models/SectorRecord');
const Contact = require('../models/Contact');
const { entityFor, entitiesForIndustry, INDUSTRIES } = require('../utils/industryConfig');
const { logAction } = require('../services/auditService');

const bad = (res, status, message) => res.status(status).json({ success: false, message });

// Status transition rules per entity (industry:entity -> { from: [to...] }).
// If not listed, any status change is allowed.
const TRANSITIONS = {
  'tour_travel:bookings': {
    draft: ['pending', 'confirmed', 'cancelled'],
    pending: ['confirmed', 'cancelled', 'no_show'],
    confirmed: ['completed', 'cancelled', 'no_show'],
    cancelled: [], completed: [], no_show: [],
  },
  'tour_travel:packages': {
    draft: ['active', 'inactive'],
    active: ['sold_out', 'inactive'],
    sold_out: ['active', 'inactive'],
    inactive: ['active'],
  },
  'tour_travel:enquiries': {
    new: ['contacted', 'lost'],
    contacted: ['qualified', 'lost'],
    qualified: ['quotation_sent', 'lost'],
    quotation_sent: ['followup_required', 'converted', 'lost'],
    followup_required: ['contacted', 'qualified', 'lost'],
    converted: [], lost: [],
  },
};

function sanitizeField(field, value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return field.type === 'number' || field.type === 'money' ? null : (field.type === 'list' || field.type === 'multiselect' || field.type === 'imagelist' ? [] : '');
  switch (field.type) {
    case 'image':
      return String(value).trim().slice(0, 2000);
    case 'imagelist': {
      return (Array.isArray(value) ? value : [value])
        .map((v) => String(v).trim()).filter(Boolean).slice(0, 24);
    }
    case 'number':
    case 'money': {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    case 'date': {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    case 'select': {
      const v = String(value);
      return (field.options || []).includes(v) ? v : '';
    }
    case 'multiselect':
    case 'list': {
      const arr = (Array.isArray(value) ? value : [value])
        .map((v) => String(v).trim()).filter(Boolean).slice(0, 40);
      if (field.type === 'multiselect' && !field.allowOther) {
        return arr.filter((v) => (field.options || []).includes(v));
      }
      return arr;
    }
    case 'toggle':
      return value === true || value === 'true' || value === 1 || value === 'on';
    case 'time': {
      const v = String(value);
      return /^([01]?\d|2[0-3]):[0-5]\d$/.test(v) ? v : '';
    }
    case 'repeater': {
      if (!Array.isArray(value)) return [];
      return value.slice(0, 60).map((row) => {
        if (!row || typeof row !== 'object') return {};
        const clean = {};
        for (const sf of field.subFields || []) {
          const sv = sanitizeField(sf, row[sf.name]);
          if (sv !== undefined) clean[sf.name] = sv;
        }
        return clean;
      });
    }
    case 'link': {
      return mongoose.Types.ObjectId.isValid(value) ? value : null;
    }
    case 'multilink': {
      const arr = (Array.isArray(value) ? value : [value])
        .filter((v) => mongoose.Types.ObjectId.isValid(v)).slice(0, 50);
      return arr.map((v) => String(v));
    }
    default:
      return String(value).slice(0, 5000);
  }
}

function buildDoc(def, body) {
  const data = {};
  const linkRefs = {};
  for (const field of def.fields) {
    if (field.readonly) continue; // server-owned fields (refs, computed money)
    const v = sanitizeField(field, body[field.name]);
    if (v === undefined) continue;
    if (field.type === 'link') linkRefs[field.name] = v ? new mongoose.Types.ObjectId(v) : null;
    else if (field.type === 'multilink') linkRefs[field.name] = (v || []).map((id) => new mongoose.Types.ObjectId(id));
    else data[field.name] = v;
  }
  for (const field of def.fields) {
    if (!field.required) continue;
    const val = field.type === 'link' || field.type === 'multilink' ? linkRefs[field.name] : data[field.name];
    const empty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
    if (empty && !field.readonly) return { error: `${field.label} is required` };
  }
  const titleField = def.fields.find((f) => f.titleField);
  const title = titleField
    ? (titleField.type === 'link' ? '' : String(data[titleField.name] || ''))
    : '';
  let status = String(body.status || def.defaultStatus || '');
  if (!def.statuses.some((s) => s.id === status)) status = def.defaultStatus || def.statuses[0]?.id || '';
  const startsAt = def.dateField && data[def.dateField] ? new Date(data[def.dateField]) : null;
  const moneyField = def.fields.find((f) => f.type === 'money');
  const amount = moneyField && data[moneyField.name] != null ? Number(data[moneyField.name]) : null;

  // Travel packages: auto-derive searchable tags from the trip's location +
  // category, so "Honeymoon · Goa · Beach" tags itself for the storefront.
  if (def.industry === 'tour_travel' && def.key === 'packages' && 'tags' in data) {
    const derived = [
      data.category, data.destination, data.country, data.region,
      ...(Array.isArray(data.destinations) ? data.destinations : []),
    ].map((v) => String(v || '').trim().replace(/_/g, ' ')).filter(Boolean);
    const manual = Array.isArray(data.tags) ? data.tags : [];
    const seen = new Set();
    data.tags = [...manual, ...derived]
      .map((t) => String(t).trim()).filter(Boolean)
      .filter((t) => { const k = t.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 30);
  }

  return { data, linkRefs, title, status, startsAt, amount };
}

// Generate a unique reference (e.g. TVL-0007) inside data.<field>.
async function nextRef(def, workspaceId) {
  const cfg = def.autoRef;
  if (!cfg) return null;
  const last = await SectorRecord.findOne({
    workspace: workspaceId, industry: def.industry, entity: def.key,
    [`data.${cfg.field}`]: { $regex: `^${cfg.prefix}-` },
  }).sort({ createdAt: -1 }).select(`data.${cfg.field}`).lean();
  const lastNum = last ? parseInt(String(last.data?.[cfg.field] || '').split('-').pop(), 10) : 0;
  const seq = Number.isFinite(lastNum) ? lastNum + 1 : 1;
  return `${cfg.prefix}-${String(seq).padStart(4, '0')}`;
}

async function linkContactIfNeeded(def, data, workspaceId) {
  // If any field is marked linkContact and has a phone, upsert a Contact so
  // sector people records are NOT duplicates of the contact directory.
  const phoneField = def.fields.find((f) => f.linkContact);
  if (!phoneField) return null;
  const phone = String(data[phoneField.name] || '').trim();
  if (!phone) return null;
  let contact = await Contact.findOne({ workspace: workspaceId, phone }).lean();
  if (!contact) {
    const nameField = def.fields.find((f) => f.titleField);
    try {
      contact = await Contact.create({
        workspace: workspaceId,
        name: String(data[nameField?.name] || phone),
        phone,
        email: data.email || '',
      });
    } catch {
      // unique (workspace, phone) race or duplicate — re-read
      contact = await Contact.findOne({ workspace: workspaceId, phone }).lean();
    }
  }
  return contact ? contact._id : null;
}

async function checkConflict(def, doc, workspaceId, excludeId) {
  if (!def.conflict) return null;
  const keyVal = doc.linkRefs[def.conflict.field];
  const dateVal = doc.data[def.conflict.dateField];
  if (!keyVal || !dateVal) return null;
  const day = new Date(dateVal);
  const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
  const q = {
    workspace: workspaceId,
    industry: def.industry,
    entity: def.key,
    archived: { $ne: true },
    status: { $nin: ['cancelled', 'no_show', 'checked_out', 'completed'] },
    [`linkRefs.${def.conflict.field}`]: new mongoose.Types.ObjectId(keyVal),
    [`data.${def.conflict.dateField}`]: { $gte: day, $lt: nextDay },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };
  if (def.conflict.slotField && doc.data[def.conflict.slotField]) {
    q[`data.${def.conflict.slotField}`] = String(doc.data[def.conflict.slotField]);
  }
  const clash = await SectorRecord.findOne(q).lean();
  return clash ? (def.conflict.message || 'Conflicting record exists') : null;
}

// ─── Tour & Travel booking rules ─────────────────────────────────
// Validates the linked package, enforces capacity, computes pricing
// server-side (never trust a client-supplied total) and appends to
// statusHistory on change.
async function applyTravelBookingRules(def, built, workspaceId, existing) {
  const data = built.data;
  const pkgId = built.linkRefs.packageId;
  if (!pkgId) return null;

  const pkg = await SectorRecord.findOne({
    _id: pkgId, workspace: workspaceId, industry: 'tour_travel', entity: 'packages', archived: { $ne: true },
  }).lean();
  if (!pkg) return 'Selected package does not exist';
  if (['inactive', 'sold_out'].includes(pkg.status) && built.status !== 'cancelled') {
    return `Package "${pkg.title}" is ${pkg.status.replace('_', ' ')} and cannot take bookings`;
  }

  // snapshot commercial terms so later package edits don't rewrite history
  if (!existing || String(existing.linkRefs?.packageId || '') !== String(pkgId)) {
    data.packageSnapshot = {
      title: pkg.title, code: pkg.data?.code, destination: pkg.data?.destination,
      basePrice: pkg.data?.basePrice, priceBasis: pkg.data?.priceBasis,
      currency: pkg.data?.currency || 'INR',
    };
  }

  // ── server-side pricing
  const adults = Number(data.adults) || 0;
  const children = Number(data.children) || 0;
  const infants = Number(data.infants) || 0;
  const unit = (p) => Number(p) || 0;
  const adultRate = unit(pkg.data?.adultPrice) || unit(pkg.data?.discountedPrice) || unit(pkg.data?.basePrice);
  const childRate = unit(pkg.data?.childPrice);
  const infantRate = unit(pkg.data?.infantPrice);
  let subtotal = adults * adultRate + children * childRate + infants * infantRate;
  // add-ons matched by title against package addon definitions
  const pkgAddons = Array.isArray(pkg.data?.addons) ? pkg.data.addons : [];
  const chosen = Array.isArray(data.addons) ? data.addons : [];
  chosen.forEach((name) => {
    const found = pkgAddons.find((a) => a.title === name);
    if (found) subtotal += unit(found.price);
  });
  const taxPercent = unit(pkg.data?.taxPercent);
  const taxAmount = Math.round(subtotal * taxPercent) / 100;
  const discount = unit(data.discount);
  data.subtotal = subtotal;
  data.taxAmount = taxAmount;
  data.total = Math.max(0, subtotal + taxAmount - discount);
  const payments = Array.isArray(data.payments) ? data.payments : [];
  data.paidTotal = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const refund = unit(data.refundAmount);
  data.balance = Math.max(0, data.total - data.paidTotal - refund);
  built.amount = data.total;

  // ── capacity check (only when moving to/being confirmed)
  const pax = adults + children + infants;
  if (built.status === 'confirmed' && pkg.data?.maxTravellers) {
    const booked = await SectorRecord.aggregate([
      {
        $match: {
          workspace: workspaceId, industry: 'tour_travel', entity: 'bookings',
          status: 'confirmed', archived: { $ne: true },
          'linkRefs.packageId': new mongoose.Types.ObjectId(pkgId),
          ...(existing ? { _id: { $ne: existing._id } } : {}),
        },
      },
      { $group: { _id: null, pax: { $sum: { $add: [{ $ifNull: ['$data.adults', 0] }, { $ifNull: ['$data.children', 0] }, { $ifNull: ['$data.infants', 0] }] } } } },
    ]);
    const already = booked[0]?.pax || 0;
    if (already + pax > Number(pkg.data.maxTravellers)) {
      const left = Math.max(0, Number(pkg.data.maxTravellers) - already);
      return `Not enough capacity — ${left} seat${left === 1 ? '' : 's'} left on this departure`;
    }
  }
  return null;
}

function pushStatusHistory(data, from, to, userId, note) {
  if (from === to) return;
  const h = Array.isArray(data.statusHistory) ? data.statusHistory : [];
  h.push({ from, to, at: new Date(), by: String(userId || ''), note: note || '' });
  data.statusHistory = h.slice(-50);
}

// ─── handlers ────────────────────────────────────────────────────

const listEntities = (req, res) => {
  const { industry } = req.params;
  const info = INDUSTRIES[industry];
  if (!info || !info.sector) return bad(res, 404, 'Unknown industry');
  return res.json({
    success: true,
    data: {
      industry: { id: industry, label: info.label, sectionLabel: info.sectionLabel },
      entities: entitiesForIndustry(industry).map((e) => ({
        key: e.key, singular: e.singular, plural: e.plural, statuses: e.statuses,
        defaultStatus: e.defaultStatus, fields: e.fields, dateField: e.dateField,
        singleton: !!e.singleton, subTitleField: e.subTitleField || null,
        autoRef: e.autoRef || null,
      })),
    },
  });
};

const listRecords = async (req, res) => {
  try {
    const def = entityFor(req.params.industry, req.params.entity);
    if (!def) return bad(res, 404, 'Unknown entity');
    if (def.singleton) {
      const doc = await SectorRecord.findOne({
        workspace: req.workspace._id, industry: def.industry, entity: def.key,
      });
      return res.json({ success: true, data: doc ? [doc] : [] });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const q = { workspace: req.workspace._id, industry: def.industry, entity: def.key, archived: { $ne: true } };
    if (req.query.status) q.status = String(req.query.status);
    const search = String(req.query.search || '').trim();
    if (search) {
      const fields = def.searchFields?.length ? def.searchFields : [def.fields.find((f) => f.titleField)?.name].filter(Boolean);
      q.$or = [
        { title: { $regex: search, $options: 'i' } },
        ...fields.map((f) => ({ [`data.${f}`]: { $regex: search, $options: 'i' } })),
      ];
    }
    const [data, total] = await Promise.all([
      SectorRecord.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      SectorRecord.countDocuments(q),
    ]);
    // resolve link titles for display (+ subtitle e.g. staff specialties)
    // supports both single (link) and array (multilink) refs
    const linkIds = [];
    data.forEach((r) => {
      for (const v of Object.values(r.linkRefs || {})) {
        if (Array.isArray(v)) linkIds.push(...v.filter(Boolean).map(String));
        else if (v) linkIds.push(String(v));
      }
    });
    let linkTitles = {};
    if (linkIds.length) {
      const refs = await SectorRecord.find({ _id: { $in: linkIds } }).select('title data entity industry').lean();
      const subByEntity = {};
      refs.forEach((r) => {
        if (!(r.entity in subByEntity)) {
          subByEntity[r.entity] = entityFor(r.industry, r.entity)?.subTitleField || null;
        }
      });
      refs.forEach((r) => {
        const base = r.title || Object.values(r.data || {})[0] || '';
        const subKey = subByEntity[r.entity];
        const sub = subKey ? r.data?.[subKey] : null;
        const subStr = Array.isArray(sub) ? sub.join(', ') : (sub || '');
        linkTitles[String(r._id)] = subStr ? `${base} — ${subStr}` : base;
      });
    }
    return res.json({ success: true, data, total, page, linkTitles });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

const getRecord = async (req, res) => {
  try {
    const def = entityFor(req.params.industry, req.params.entity);
    if (!def) return bad(res, 404, 'Unknown entity');
    const doc = await SectorRecord.findOne({
      _id: req.params.id, workspace: req.workspace._id, industry: def.industry, entity: def.key,
    }).lean();
    if (!doc) return bad(res, 404, 'Not found');
    // resolve link titles for detail view
    const linkIds = [];
    for (const v of Object.values(doc.linkRefs || {})) {
      if (Array.isArray(v)) linkIds.push(...v.filter(Boolean).map(String));
      else if (v) linkIds.push(String(v));
    }
    let linkTitles = {};
    if (linkIds.length) {
      const refs = await SectorRecord.find({ _id: { $in: linkIds } }).select('title data entity industry').lean();
      refs.forEach((r) => { linkTitles[String(r._id)] = r.title || Object.values(r.data || {})[0] || ''; });
    }
    return res.json({ success: true, data: doc, linkTitles });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

const createRecord = async (req, res) => {
  try {
    const def = entityFor(req.params.industry, req.params.entity);
    if (!def) return bad(res, 404, 'Unknown entity');
    const built = buildDoc(def, req.body || {});
    if (built.error) return bad(res, 400, built.error);
    if (def.singleton) {
      const existing = await SectorRecord.findOne({ workspace: req.workspace._id, industry: def.industry, entity: def.key });
      if (existing) return bad(res, 409, 'Already exists — update the existing record');
    }
    const conflict = await checkConflict(def, built, req.workspace._id, null);
    if (conflict) return bad(res, 409, conflict);

    // auto reference (bookingRef, enquiryRef…)
    if (def.autoRef) built.data[def.autoRef.field] = await nextRef(def, req.workspace._id);

    // travel-specific business rules
    if (def.industry === 'tour_travel' && def.key === 'bookings') {
      const ruleErr = await applyTravelBookingRules(def, built, req.workspace._id, null);
      if (ruleErr) return bad(res, ruleErr.includes('capacity') || ruleErr.includes('seat') ? 409 : 400, ruleErr);
    }

    const contact = await linkContactIfNeeded(def, built.data, req.workspace._id);
    let title = built.title;
    if (!title) {
      const linkTitleField = def.fields.find((f) => f.titleField && f.type === 'link');
      if (linkTitleField && built.linkRefs[linkTitleField.name]) {
        const ref = await SectorRecord.findById(built.linkRefs[linkTitleField.name]).select('title').lean();
        title = ref?.title || '';
      }
    }
    // status history seed
    pushStatusHistory(built.data, null, built.status, req.user._id, 'created');

    const doc = await SectorRecord.create({
      workspace: req.workspace._id,
      industry: def.industry,
      entity: def.key,
      title,
      status: built.status,
      contact,
      linkRefs: built.linkRefs,
      amount: built.amount,
      startsAt: built.startsAt,
      data: built.data,
      createdBy: req.user._id,
    });
    logAction(req.workspace._id, req.user._id, 'sector_record.create', `${def.industry}/${def.key}`, String(doc._id), title);
    return res.json({ success: true, data: doc });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

const updateRecord = async (req, res) => {
  try {
    const def = entityFor(req.params.industry, req.params.entity);
    if (!def) return bad(res, 404, 'Unknown entity');
    const existing = await SectorRecord.findOne({
      _id: req.params.id, workspace: req.workspace._id, industry: def.industry, entity: def.key,
    });
    if (!existing) return bad(res, 404, 'Not found');
    // Merge existing values so partial updates don't wipe links/status
    const existingLinks = existing.linkRefs ? JSON.parse(JSON.stringify(existing.linkRefs)) : {};
    const merged = { ...existing.data, ...existingLinks, status: existing.status, ...(req.body || {}) };
    const built = buildDoc(def, merged);
    if (built.error) return bad(res, 400, built.error);

    // status transition validation
    const trans = TRANSITIONS[`${def.industry}:${def.key}`];
    if (trans && built.status !== existing.status) {
      const allowed = trans[existing.status] || [];
      if (!allowed.includes(built.status)) {
        return bad(res, 400, `Cannot move from "${existing.status}" to "${built.status}"`);
      }
    }

    const conflict = await checkConflict(def, built, req.workspace._id, existing._id);
    if (conflict) return bad(res, 409, conflict);

    // travel booking rules + status history
    if (def.industry === 'tour_travel' && def.key === 'bookings') {
      // carry forward server fields
      built.data.refundAmount = existing.data?.refundAmount ?? built.data.refundAmount;
      built.data.statusHistory = existing.data?.statusHistory || [];
      const ruleErr = await applyTravelBookingRules(def, built, req.workspace._id, existing);
      if (ruleErr) return bad(res, ruleErr.includes('capacity') || ruleErr.includes('seat') ? 409 : 400, ruleErr);
      pushStatusHistory(built.data, existing.status, built.status, req.user._id, req.body?.cancelReason || '');
    }

    const contact = await linkContactIfNeeded(def, built.data, req.workspace._id);
    existing.data = built.data;
    existing.linkRefs = built.linkRefs;
    existing.status = built.status;
    existing.startsAt = built.startsAt;
    existing.amount = built.amount;
    if (built.title) existing.title = built.title;
    if (contact) existing.contact = contact;
    existing.markModified('data');
    existing.markModified('linkRefs');
    await existing.save();
    logAction(req.workspace._id, req.user._id, 'sector_record.update', `${def.industry}/${def.key}`, String(existing._id));
    return res.json({ success: true, data: existing });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

// POST /:id/status — dedicated status transition endpoint
const setStatus = async (req, res) => {
  try {
    const def = entityFor(req.params.industry, req.params.entity);
    if (!def) return bad(res, 404, 'Unknown entity');
    const existing = await SectorRecord.findOne({
      _id: req.params.id, workspace: req.workspace._id, industry: def.industry, entity: def.key,
    });
    if (!existing) return bad(res, 404, 'Not found');
    const target = String(req.body?.status || '');
    if (!def.statuses.some((s) => s.id === target)) return bad(res, 400, 'Unknown status');
    const trans = TRANSITIONS[`${def.industry}:${def.key}`];
    if (trans) {
      const allowed = trans[existing.status] || [];
      if (!allowed.includes(target)) {
        return bad(res, 400, `Cannot move from "${existing.status}" to "${target}"`);
      }
    }
    const prevStatus = existing.status;
    existing.status = target;
    const data = existing.data || {};
    if (req.body?.cancelReason) data.cancelReason = String(req.body.cancelReason).slice(0, 1000);
    if (req.body?.refundAmount !== undefined) {
      const r = Number(req.body.refundAmount);
      data.refundAmount = Number.isFinite(r) ? r : 0;
    }
    pushStatusHistory(data, prevStatus, target, req.user._id, req.body?.reason || req.body?.cancelReason || '');
    existing.data = data;
    existing.markModified('data');
    await existing.save();
    logAction(req.workspace._id, req.user._id, 'sector_record.status', `${def.industry}/${def.key}`, String(existing._id), `${target}`);
    return res.json({ success: true, data: existing });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

// POST /:id/duplicate — clone a record (fresh ref, draft status, no links to history)
const duplicateRecord = async (req, res) => {
  try {
    const def = entityFor(req.params.industry, req.params.entity);
    if (!def) return bad(res, 404, 'Unknown entity');
    const src = await SectorRecord.findOne({
      _id: req.params.id, workspace: req.workspace._id, industry: def.industry, entity: def.key,
    }).lean();
    if (!src) return bad(res, 404, 'Not found');
    const data = JSON.parse(JSON.stringify(src.data || {}));
    delete data.statusHistory;
    delete data.packageSnapshot;
    if (def.autoRef) data[def.autoRef.field] = await nextRef(def, req.workspace._id);
    const doc = await SectorRecord.create({
      workspace: req.workspace._id,
      industry: def.industry,
      entity: def.key,
      title: `${src.title || ''} (copy)`.trim(),
      status: def.defaultStatus || src.status,
      linkRefs: src.linkRefs || {},
      contact: src.contact || null,
      data,
      createdBy: req.user._id,
    });
    logAction(req.workspace._id, req.user._id, 'sector_record.duplicate', `${def.industry}/${def.key}`, String(doc._id));
    return res.json({ success: true, data: doc });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

// POST /api/sector/tour_travel/enquiries/:id/convert — enquiry → booking
const convertEnquiry = async (req, res) => {
  try {
    const industry = req.params.industry;
    if (industry !== 'tour_travel') return bad(res, 400, 'Conversion is supported for travel enquiries');
    const enquiry = await SectorRecord.findOne({
      _id: req.params.id, workspace: req.workspace._id, industry, entity: 'enquiries',
    });
    if (!enquiry) return bad(res, 404, 'Enquiry not found');
    if (enquiry.linkRefs?.convertedBookingId) {
      return bad(res, 409, 'This enquiry is already converted to a booking');
    }
    if (enquiry.status === 'lost') return bad(res, 400, 'Cannot convert a lost enquiry');

    const d = enquiry.data || {};
    const pkgId = req.body?.packageId || enquiry.linkRefs?.packageId;
    const departureDate = req.body?.departureDate || d.travelDate;
    if (!pkgId) return bad(res, 400, 'Select a package to convert this enquiry');
    if (!departureDate) return bad(res, 400, 'A departure date is required');

    const body = {
      customerName: d.name, phone: d.phone, email: d.email,
      packageId: pkgId, departureDate, returnDate: req.body?.returnDate,
      adults: Number(req.body?.adults ?? d.paxCount ?? 1) || 1,
      children: Number(req.body?.children ?? 0) || 0,
      infants: Number(req.body?.infants ?? 0) || 0,
      source: 'referral',
      enquiryId: String(enquiry._id),
      internalNotes: `Converted from enquiry ${d.enquiryRef || enquiry._id}`,
      specialRequests: d.specialRequests,
      status: 'pending',
    };

    const def = entityFor(industry, 'bookings');
    const built = buildDoc(def, body);
    if (built.error) return bad(res, 400, built.error);
    const ruleErr = await applyTravelBookingRules(def, built, req.workspace._id, null);
    if (ruleErr) return bad(res, 400, ruleErr);
    built.data.bookingRef = await nextRef(def, req.workspace._id);
    pushStatusHistory(built.data, null, built.status, req.user._id, 'created from enquiry');
    const contact = await linkContactIfNeeded(def, built.data, req.workspace._id);
    const doc = await SectorRecord.create({
      workspace: req.workspace._id, industry, entity: 'bookings',
      title: built.title, status: built.status, contact,
      linkRefs: built.linkRefs, amount: built.amount, startsAt: built.startsAt,
      data: built.data, createdBy: req.user._id,
    });

    // mark enquiry converted + back-reference
    const prevEnquiryStatus = enquiry.status;
    enquiry.status = 'converted';
    const links = enquiry.linkRefs || {};
    links.convertedBookingId = doc._id;
    enquiry.linkRefs = links;
    const ed = enquiry.data || {};
    pushStatusHistory(ed, prevEnquiryStatus, 'converted', req.user._id, `booking ${doc.data?.bookingRef || doc._id}`);
    enquiry.data = ed;
    enquiry.markModified('data');
    enquiry.markModified('linkRefs');
    await enquiry.save();

    logAction(req.workspace._id, req.user._id, 'sector_record.convert', 'tour_travel/enquiries', String(enquiry._id), String(doc._id));
    return res.json({ success: true, data: { enquiry, booking: doc } });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

const archiveRecord = async (req, res) => {
  try {
    const def = entityFor(req.params.industry, req.params.entity);
    if (!def) return bad(res, 404, 'Unknown entity');
    const doc = await SectorRecord.findOneAndUpdate(
      { _id: req.params.id, workspace: req.workspace._id, industry: def.industry, entity: def.key },
      { $set: { archived: true } },
      { new: true }
    );
    if (!doc) return bad(res, 404, 'Not found');
    logAction(req.workspace._id, req.user._id, 'sector_record.archive', `${def.industry}/${def.key}`, String(doc._id));
    return res.json({ success: true, data: doc });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

// Per-industry overview: entity counts + status breakdowns + upcoming dated items
// + travel metrics (revenue, conversion, departures, follow-ups).
const overview = async (req, res) => {
  try {
    const { industry } = req.params;
    const info = INDUSTRIES[industry];
    if (!info || !info.sector) return bad(res, 404, 'Unknown industry');
    const entities = entitiesForIndustry(industry).filter((e) => !e.singleton);
    const ws = req.workspace._id;
    const result = { entities: {}, upcoming: [], recent: [], metrics: {} };
    await Promise.all(entities.map(async (def) => {
      const [byStatus, total] = await Promise.all([
        SectorRecord.aggregate([
          { $match: { workspace: ws, industry, entity: def.key, archived: { $ne: true } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        SectorRecord.countDocuments({ workspace: ws, industry, entity: def.key, archived: { $ne: true } }),
      ]);
      const statusCounts = {};
      byStatus.forEach((s) => { statusCounts[s._id] = s.count; });
      result.entities[def.key] = { key: def.key, plural: def.plural, singular: def.singular, total, statusCounts };
      if (def.dateField) {
        const upcoming = await SectorRecord.find({
          workspace: ws, industry, entity: def.key, archived: { $ne: true },
          startsAt: { $gte: new Date() },
          status: { $nin: ['cancelled', 'no_show', 'done', 'closed', 'lost', 'checked_out', 'converted'] },
        }).sort({ startsAt: 1 }).limit(5).lean();
        upcoming.forEach((r) => result.upcoming.push({ entity: def.key, entityLabel: def.plural, record: r }));
      }
    }));
    result.upcoming.sort((a, b) => new Date(a.record.startsAt) - new Date(b.record.startsAt));
    result.upcoming = result.upcoming.slice(0, 8);
    result.recent = await SectorRecord.find({ workspace: ws, industry, archived: { $ne: true } })
      .sort({ createdAt: -1 }).limit(6).lean();

    // ── travel metrics
    if (industry === 'tour_travel') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const [todayBookings, revenue, followupsDue, popularPackages] = await Promise.all([
        SectorRecord.countDocuments({
          workspace: ws, industry, entity: 'bookings', archived: { $ne: true },
          createdAt: { $gte: today, $lt: tomorrow },
        }),
        SectorRecord.aggregate([
          { $match: { workspace: ws, industry, entity: 'bookings', archived: { $ne: true }, status: { $nin: ['cancelled'] } } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$data.total', 0] } }, paid: { $sum: { $ifNull: ['$data.paidTotal', 0] } }, balance: { $sum: { $ifNull: ['$data.balance', 0] } } } },
        ]),
        SectorRecord.countDocuments({
          workspace: ws, industry, entity: 'enquiries', archived: { $ne: true },
          'data.nextFollowUp': { $lte: new Date() }, status: { $nin: ['converted', 'lost'] },
        }),
        SectorRecord.aggregate([
          { $match: { workspace: ws, industry, entity: 'bookings', archived: { $ne: true }, 'linkRefs.packageId': { $exists: true } } },
          { $group: { _id: '$linkRefs.packageId', count: { $sum: 1 } } },
          { $sort: { count: -1 } }, { $limit: 3 },
        ]),
      ]);
      const pkgTitles = await SectorRecord.find({
        _id: { $in: (popularPackages || []).map((p) => p._id).filter(Boolean) },
      }).select('title').lean();
      result.metrics = {
        todayBookings,
        revenue: revenue[0]?.total || 0,
        collected: revenue[0]?.paid || 0,
        outstanding: revenue[0]?.balance || 0,
        followupsDue: followupsDue || 0,
        popularPackages: (popularPackages || []).map((p) => ({
          id: String(p._id), count: p.count,
          title: pkgTitles.find((t) => String(t._id) === String(p._id))?.title || 'Package',
        })),
        conversionRate: (() => {
          const enq = result.entities.enquiries?.total || 0;
          const conv = result.entities.enquiries?.statusCounts?.converted || 0;
          return enq ? Math.round((conv / enq) * 100) : null;
        })(),
      };
    }
    return res.json({ success: true, data: result });
  } catch (e) {
    return bad(res, 500, e.message);
  }
};

module.exports = {
  listEntities, listRecords, getRecord, createRecord, updateRecord,
  setStatus, duplicateRecord, convertEnquiry, archiveRecord, overview,
  // shared with the public travel-enquiry endpoint
  nextRef, linkContactIfNeeded, pushStatusHistory,
};
