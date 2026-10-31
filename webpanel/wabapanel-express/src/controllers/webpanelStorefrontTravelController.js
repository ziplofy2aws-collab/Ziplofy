const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const User = require('../models/User');
const SectorRecord = require('../models/SectorRecord');
const { entityFor } = require('../utils/industryConfig');
const { nextRef, linkContactIfNeeded, pushStatusHistory } = require('./sectorController');

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
  try {
    const owner = await User.findById(store.userId).select('featureOverrides').lean();
    if (owner?.featureOverrides?.travel === true) travelEnabled = true;
  } catch { /* noop */ }
  if (!travelEnabled) return { enabled: false, store };
  return { enabled: true, store, workspaceId: store.workspace };
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
