const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const WebpanelStore = require('../models/WebpanelStore');
const User = require('../models/User');
const SectorRecord = require('../models/SectorRecord');
const { entityFor } = require('../utils/industryConfig');
const { nextRef, linkContactIfNeeded, pushStatusHistory } = require('./sectorController');
const { resolveStoreRecordsWorkspaceId } = require('../utils/informaticIndustryData.util');

/**
 * Public storefront read for tour & travel packages — the same "live query"
 * pattern codiic storefronts use for products: nothing is copied into the
 * theme; the renderer fetches active packages per request, so an admin
 * "Add package" is visible immediately once status = active.
 *
 * Product-shaped items map onto codiic StorefrontProductItem so ported
 * product-grid/collection sections render them unchanged.
 */

const PUBLIC_PACKAGE_FIELDS = [
  'code', 'destination', 'destinations', 'category', 'country', 'region',
  'coverImage', 'galleryImages', 'tags', 'shortDescription', 'description',
  'durationDays', 'durationNights', 'dateType', 'departureDate', 'returnDate',
  'bookingOpens', 'bookingCloses', 'minTravellers', 'maxTravellers',
  'currency', 'priceBasis', 'basePrice', 'adultPrice', 'childPrice',
  'infantPrice', 'discountedPrice', 'taxPercent', 'addons',
  'itinerary', 'inclusions', 'exclusions', 'passportRequired', 'visaInfo',
  'insuranceInfo', 'ageRestriction', 'fitnessNotes', 'travelInstructions',
  'cancellationPolicy',
];

const originFrom = (req) =>
  `${req.headers['x-forwarded-proto'] || req.protocol || 'http'}://${req.get('host')}`;

const absolutize = (url, origin) => {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return `${origin}${u.startsWith('/') ? '' : '/'}${u}`;
};

const slugify = (s) =>
  String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'package';

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escJoin = (arr) => (Array.isArray(arr) ? arr.map(esc).filter(Boolean) : []);

const fmtDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Compose the travel-specific details into the product description HTML so
 * the theme's description block renders destination, duration, itinerary,
 * inclusions, and policies — same fields the travel form collects.
 */
function buildTravelDescription(d, durationText) {
  const parts = [];
  const base = String(d.shortDescription || d.description || '').trim();
  if (base) parts.push(`<p>${base}</p>`);

  const facts = [];
  if (d.destination) facts.push(['Destination', [d.destination, d.country].filter(Boolean).join(', ')]);
  const extraDests = escJoin(d.destinations).filter((x) => x !== d.destination);
  if (extraDests.length) facts.push(['Route', extraDests.join(' → ')]);
  if (durationText) facts.push(['Duration', durationText]);
  const depart = fmtDate(d.departureDate);
  if (depart) facts.push(['Departure', depart + (fmtDate(d.returnDate) ? ` — ${fmtDate(d.returnDate)}` : '')]);
  if (d.maxTravellers) facts.push(['Group size', `Max ${d.maxTravellers} travellers`]);
  if (d.category) facts.push(['Trip type', String(d.category).replace(/_/g, ' ')]);
  if (facts.length) {
    parts.push('<ul>' + facts.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${v}</li>`).join('') + '</ul>');
  }

  const inc = escJoin(d.inclusions);
  if (inc.length) parts.push(`<p><strong>Inclusions</strong></p><ul>${inc.map((i) => `<li>${i}</li>`).join('')}</ul>`);
  const exc = escJoin(d.exclusions);
  if (exc.length) parts.push(`<p><strong>Exclusions</strong></p><ul>${exc.map((i) => `<li>${i}</li>`).join('')}</ul>`);

  const days = Array.isArray(d.itinerary) ? d.itinerary : [];
  if (days.length) {
    parts.push('<p><strong>Day-by-day itinerary</strong></p><ol>' +
      days.map((day) =>
        `<li><strong>${esc(day.title || `Day ${day.day || ''}`)}</strong>${day.description ? ` — ${esc(day.description)}` : ''}` +
        `${day.accommodation ? `<br/><em>Stay: ${esc(day.accommodation)}</em>` : ''}` +
        `${(day.meals ? [].concat(day.meals) : []).length ? ` <em>· Meals: ${escJoin([].concat(day.meals)).join(', ')}</em>` : ''}</li>`
      ).join('') + '</ol>');
  }

  if (d.travelInstructions) parts.push(`<p><strong>Important instructions</strong><br/>${esc(d.travelInstructions)}</p>`);
  if (d.cancellationPolicy) parts.push(`<p><strong>Cancellation & refund policy</strong><br/>${esc(d.cancellationPolicy)}</p>`);
  if (d.visaInfo) parts.push(`<p><strong>Visa information</strong><br/>${esc(d.visaInfo)}</p>`);

  return parts.join('');
}

function toPublicPackage(rec, origin) {
  const d = rec.data || {};
  // /product/<slug>-<id> — readable like codiic's urlHandle, id suffix keeps it unique
  const handle = `${slugify(rec.title)}-${String(rec._id)}`;
  const imageUrls = [d.coverImage, ...(Array.isArray(d.galleryImages) ? d.galleryImages : [])]
    .map((u) => absolutize(u, origin))
    .filter(Boolean);
  // Effective list price: basePrice → adultPrice → childPrice → infantPrice
  const listPrice =
    Number(d.basePrice) ||
    Number(d.adultPrice) ||
    Number(d.childPrice) ||
    Number(d.infantPrice) ||
    0;
  const discounted = Number(d.discountedPrice) || 0;
  const hasDiscount = discounted > 0 && discounted < listPrice;
  const detail = {};
  for (const k of PUBLIC_PACKAGE_FIELDS) if (d[k] !== undefined) detail[k] = d[k];
  const durationText = [d.durationDays && `${d.durationDays}D`, d.durationNights && `${d.durationNights}N`]
    .filter(Boolean).join(' / ');
  return {
    _id: String(rec._id),
    title: rec.title,
    urlHandle: handle, // /product/<slug>-<id> — resolves via trailing ObjectId
    handle,
    status: rec.status,
    price: hasDiscount ? discounted : listPrice,
    compareAtPrice: hasDiscount ? listPrice : null,
    currency: d.currency || 'INR',
    priceBasis: d.priceBasis || 'per_person',
    imageUrls,
    image: imageUrls[0] || '',
    description: buildTravelDescription(d, durationText),
    vendor: d.destination || '', // renders in the card/vendor slot on codiic cards
    category: d.category || '',
    durationText,
    destination: d.destination || '',
    startsAt: rec.startsAt || null,
    data: detail,
  };
}

async function resolveTravelContext(req) {
  const store = await WebpanelStore.findById(req.params.storeId)
    .select('userId workspace industry storeName')
    .lean();
  if (!store) return { error: 404, message: 'Store not found' };

  let travelEnabled = store.industry === 'tour_travel';
  let owner = null;
  try {
    owner = await User.findById(store.userId).select('featureOverrides currentWorkspace').lean();
    if (owner?.featureOverrides?.travel === true) travelEnabled = true;
  } catch { /* noop */ }
  if (!travelEnabled) return { enabled: false, store };
  // store.workspace → owner.currentWorkspace → owner's first workspace
  const workspaceId = await resolveStoreRecordsWorkspaceId(store, owner);
  return { enabled: true, store, workspaceId };
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** GET /api/storefront/:storeId/travel-packages — list active packages */
exports.listStorefrontTravelPackages = async (req, res) => {
  try {
    const ctx = await resolveTravelContext(req);
    if (ctx.error) return res.status(ctx.error).json({ success: false, message: ctx.message });
    if (!ctx.enabled) return res.json({ success: true, data: { enabled: false, products: [] } });
    if (!ctx.workspaceId) return res.json({ success: true, data: { enabled: true, products: [] } });

    const filter = {
      workspace: ctx.workspaceId,
      industry: 'tour_travel',
      entity: 'packages',
      status: 'active',
      archived: { $ne: true },
    };
    const q = String(req.query.q || '').trim();
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [
        { title: rx },
        { 'data.destination': rx },
        { 'data.destinations': rx },
        { 'data.code': rx },
        { 'data.shortDescription': rx },
        { 'data.tags': rx },
        { 'data.category': rx },
      ];
    }

    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 24));
    const rows = await SectorRecord.find(filter)
      .sort({ startsAt: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    const origin = originFrom(req);
    res.json({
      success: true,
      data: { enabled: true, products: rows.map((r) => toPublicPackage(r, origin)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/storefront/:storeId/travel-packages/:packageId — package detail */
exports.getStorefrontTravelPackage = async (req, res) => {
  try {
    const ctx = await resolveTravelContext(req);
    if (ctx.error) return res.status(ctx.error).json({ success: false, message: ctx.message });
    if (!ctx.enabled) return res.json({ success: true, data: { enabled: false, product: null } });

    // Accepts raw ObjectId or a "<slug>-<id>" urlHandle
    const raw = String(req.params.packageId || '');
    const idMatch = raw.match(/[0-9a-fA-F]{24}$/);
    const packageId = idMatch ? idMatch[0] : raw;
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const rec = await SectorRecord.findOne({
      _id: packageId,
      workspace: ctx.workspaceId,
      industry: 'tour_travel',
      entity: 'packages',
      status: 'active',
      archived: { $ne: true },
    }).lean();
    if (!rec) return res.status(404).json({ success: false, message: 'Package not found' });

    res.json({ success: true, data: { enabled: true, product: toPublicPackage(rec, originFrom(req)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/storefront/:storeId/travel-packages/:packageId/enquiries
 * Storefront "Book now" — creates an `enquiries` SectorRecord linked to the
 * package, so it lands on the Tour & Travel > Enquiries page where staff can
 * convert it to a booking. Same rules as the internal create flow
 * (auto ENQ-#### ref, contact upsert from phone, status history seed).
 */
exports.createStorefrontTravelPackageEnquiry = async (req, res) => {
  try {
    const ctx = await resolveTravelContext(req);
    if (ctx.error) return res.status(ctx.error).json({ success: false, message: ctx.message });
    if (!ctx.enabled || !ctx.workspaceId) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const raw = String(req.params.packageId || '');
    const idMatch = raw.match(/[0-9a-fA-F]{24}$/);
    const packageId = idMatch ? idMatch[0] : raw;
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    const pkg = await SectorRecord.findOne({
      _id: packageId,
      workspace: ctx.workspaceId,
      industry: 'tour_travel',
      entity: 'packages',
      status: { $nin: ['inactive', 'sold_out'] },
      archived: { $ne: true },
    }).lean();
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    const body = req.body || {};
    const name = String(body.name || '').trim().slice(0, 200);
    const email = String(body.email || '').trim().slice(0, 254);
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const phone = String(body.phone || '').trim().slice(0, 64);
    const travellers = Math.min(99, Math.max(1, parseInt(body.travellers, 10) || 1));
    const note = String(body.message || '').trim().slice(0, 2000);
    const travelDate = /^\d{4}-\d{2}-\d{2}/.test(String(body.travelDate || ''))
      ? String(body.travelDate).slice(0, 10)
      : undefined;

    const enquiryDef = entityFor('tour_travel', 'enquiries');
    if (!enquiryDef) return res.status(500).json({ success: false, message: 'Enquiries not configured' });

    const pkgData = pkg.data || {};
    const data = {
      name,
      email,
      phone,
      destinations: [pkgData.destination, ...(pkgData.destinations || [])]
        .map((v) => String(v || '').trim()).filter(Boolean).slice(0, 24),
      paxCount: travellers,
      source: 'website',
      specialRequirements: note,
      notes: note,
      statusHistory: [],
    };
    if (travelDate) data.travelDate = travelDate;
    const tourTypes = enquiryDef.fields.find((f) => f.name === 'tourType')?.options || [];
    if (pkgData.category && tourTypes.includes(pkgData.category)) {
      data.tourType = pkgData.category;
    }
    data.enquiryRef = await nextRef(enquiryDef, ctx.workspaceId);
    pushStatusHistory(data, null, 'new', null, 'storefront enquiry');

    const contact = await linkContactIfNeeded(enquiryDef, data, ctx.workspaceId);
    const doc = await SectorRecord.create({
      workspace: ctx.workspaceId,
      industry: 'tour_travel',
      entity: 'enquiries',
      title: name,
      status: 'new',
      contact,
      linkRefs: { packageId: pkg._id },
      data,
    });

    res.status(201).json({
      success: true,
      data: { enquiryId: String(doc._id), enquiryRef: data.enquiryRef },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const travellerPublic = (doc, sessionToken) => ({
  id: String(doc._id),
  name: doc.data?.name || doc.title || '',
  email: doc.data?.email || '',
  phone: doc.data?.phone || '',
  sessionToken,
});

/** Opaque session token stored on the traveller record (caps at 10 devices). */
async function issueTravellerSession(doc) {
  const token = crypto.randomBytes(24).toString('hex');
  const data = doc.data || {};
  const tokens = Array.isArray(data.sessionTokens) ? data.sessionTokens : [];
  tokens.push(token);
  data.sessionTokens = tokens.slice(-10);
  doc.data = data;
  doc.markModified('data');
  await doc.save();
  return token;
}

/**
 * POST /api/storefront/:storeId/traveller-auth — the storefront login/signup
 * used by the injected account panel on uploaded themes. Travellers are
 * SectorRecords on the tour_travel `travellers` entity, so every signup lands
 * directly in Tour & Travel > Travellers. `mode: 'signup'` creates (or resumes)
 * the traveller keyed by email; `mode: 'login'` verifies the stored password
 * hash. Only the hash is persisted — never the plaintext password.
 */
exports.travellerStorefrontAuth = async (req, res) => {
  try {
    const ctx = await resolveTravelContext(req);
    if (ctx.error) return res.status(ctx.error).json({ success: false, message: ctx.message });
    if (!ctx.enabled || !ctx.workspaceId) {
      return res.status(404).json({ success: false, message: 'Traveller sign-in is not available for this store' });
    }

    const body = req.body || {};
    const mode = String(body.mode || 'signup').toLowerCase();
    const email = String(body.email || '').trim().toLowerCase().slice(0, 254);
    const password = String(body.password || '');
    const name = String(body.name || '').trim().slice(0, 200);
    const phone = String(body.phone || '').trim().slice(0, 64);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
    }

    const filter = {
      workspace: ctx.workspaceId,
      industry: 'tour_travel',
      entity: 'travellers',
      'data.email': email,
    };
    const existing = await SectorRecord.findOne(filter);

    if (mode === 'login') {
      if (!existing) {
        return res.status(404).json({ success: false, message: 'No account found for this email — create one below' });
      }
      const ok = await bcrypt.compare(password, String(existing.data?.passwordHash || ''));
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
      const sessionToken = await issueTravellerSession(existing);
      return res.json({ success: true, data: { traveller: travellerPublic(existing, sessionToken) } });
    }

    // signup — resume an existing account when the password matches, else 409
    if (existing) {
      const ok = await bcrypt.compare(password, String(existing.data?.passwordHash || ''));
      if (ok) {
        const sessionToken = await issueTravellerSession(existing);
        return res.json({ success: true, data: { traveller: travellerPublic(existing, sessionToken) } });
      }
      return res.status(409).json({ success: false, message: 'An account with this email already exists — sign in instead' });
    }

    const resolvedName = name || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const passwordHash = await bcrypt.hash(password, 10);
    const newSessionToken = crypto.randomBytes(24).toString('hex');
    const travellerDef = entityFor('tour_travel', 'travellers');
    const data = {
      name: resolvedName,
      displayName: resolvedName,
      email,
      phone,
      passwordHash,
      sessionTokens: [newSessionToken],
      notes: 'Signed up via storefront login',
    };
    const contact = travellerDef
      ? await linkContactIfNeeded(travellerDef, data, ctx.workspaceId).catch(() => null)
      : null;
    const doc = await SectorRecord.create({
      workspace: ctx.workspaceId,
      industry: 'tour_travel',
      entity: 'travellers',
      title: resolvedName,
      status: 'active',
      contact,
      data,
    });

    res.status(201).json({ success: true, data: { traveller: travellerPublic(doc, newSessionToken) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const ENQUIRY_STATUS_LABELS = {
  new: 'Enquiry received', contacted: 'Contacted', qualified: 'Qualified',
  quotation_sent: 'Quote sent', converted: 'Converted to booking', lost: 'Closed',
};
const BOOKING_STATUS_LABELS = {
  draft: 'Draft', pending: 'Pending confirmation', confirmed: 'Confirmed',
  cancelled: 'Cancelled', completed: 'Completed', no_show: 'No show',
};

/**
 * GET /api/storefront/:storeId/traveller-trips — the signed-in traveller's
 * enquiries + bookings with live statuses. Auth: email + sessionToken issued
 * by traveller-auth (so booking data is never exposed by email alone).
 */
exports.listTravellerTrips = async (req, res) => {
  try {
    const ctx = await resolveTravelContext(req);
    if (ctx.error) {
      return res.status(ctx.error).json({ success: false, message: ctx.message });
    }
    if (!ctx.enabled || !ctx.workspaceId) {
      return res.status(404).json({ success: false, message: 'Not available for this store' });
    }

    const email = String(req.query.email || '').trim().toLowerCase();
    const token = String(req.query.token || req.headers['x-traveller-token'] || '').trim();
    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Email and session token are required' });
    }

    const traveller = await SectorRecord.findOne({
      workspace: ctx.workspaceId,
      industry: 'tour_travel',
      entity: 'travellers',
      'data.email': email,
      archived: { $ne: true },
    }).lean();
    const tokens = Array.isArray(traveller?.data?.sessionTokens) ? traveller.data.sessionTokens : [];
    if (!traveller || !tokens.includes(token)) {
      return res.status(401).json({ success: false, message: 'Session expired — please sign in again' });
    }

    const base = { workspace: ctx.workspaceId, industry: 'tour_travel', archived: { $ne: true } };
    const enquiries = await SectorRecord.find({
      ...base, entity: 'enquiries', 'data.email': email,
    }).sort({ createdAt: -1 }).limit(50).lean();

    const convertedIds = enquiries
      .map((e) => e.linkRefs?.convertedBookingId)
      .filter(Boolean);
    const bookings = await SectorRecord.find({
      ...base, entity: 'bookings',
      $or: [{ _id: { $in: convertedIds } }, { 'data.email': email }],
    }).sort({ createdAt: -1 }).limit(50).lean();

    const pkgIds = [...enquiries, ...bookings]
      .map((r) => String(r.linkRefs?.packageId || ''))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const pkgs = pkgIds.length
      ? await SectorRecord.find({ _id: { $in: [...new Set(pkgIds)] } }).select('title').lean()
      : [];
    const pkgTitle = Object.fromEntries(pkgs.map((p) => [String(p._id), p.title]));

    const trips = [
      ...enquiries.map((e) => ({
        kind: 'enquiry',
        ref: e.data?.enquiryRef || '',
        package: pkgTitle[String(e.linkRefs?.packageId)] || '',
        date: e.data?.travelDate || '',
        travellers: e.data?.paxCount || null,
        status: e.status,
        statusLabel: ENQUIRY_STATUS_LABELS[e.status] || e.status,
        createdAt: e.createdAt,
      })),
      ...bookings.map((b) => ({
        kind: 'booking',
        ref: b.data?.bookingRef || '',
        package: pkgTitle[String(b.linkRefs?.packageId)] || '',
        date: b.data?.departureDate || '',
        travellers: (b.data?.adults || 0) + (b.data?.children || 0) + (b.data?.infants || 0) || null,
        status: b.status,
        statusLabel: BOOKING_STATUS_LABELS[b.status] || b.status,
        createdAt: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: { trips } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
