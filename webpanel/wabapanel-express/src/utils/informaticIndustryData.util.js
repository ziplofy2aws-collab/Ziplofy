/**
 * Industry-aware Informatic theme utilities.
 *
 * Two responsibilities:
 *  1. Catalog filtering — match theme `tags` (typed at upload time) against the
 *     canonical industry registry so a tagged theme is only offered to stores of
 *     that industry. Untagged themes stay visible to everyone.
 *  2. Runtime data sync — walk a resolved theme config and replace blocks of
 *     sections that are bound to a "dataSource" (explicit `settings.dataSource`,
 *     or an auto-detected destinations/packages-style section) with live
 *     SectorRecord data scoped to the store's workspace. Injected blocks are
 *     ephemeral runtime data — they never touch saved config.
 */

const SectorRecord = require('../models/SectorRecord');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { INDUSTRIES } = require('./industryConfig');

/* ---------------------------------- tags ---------------------------------- */

const TAG_STOPWORDS = new Set(['and', 'or', 'the', 'other', 'for', 'a', 'an', 'of', 'in', 'to']);

/** Curated aliases so a "part of the industry name" tag still resolves. */
const INDUSTRY_TAG_ALIASES = {
  tour_travel: ['travel', 'travels', 'tour', 'tours', 'tourism', 'trip', 'trips', 'vacation', 'holiday', 'holidays', 'getaway', 'trek', 'trekking'],
  healthcare: ['health', 'healthcare', 'medical', 'clinic', 'clinics', 'doctor', 'hospital', 'pharma', 'dental', 'wellness'],
  education: ['education', 'edtech', 'school', 'academy', 'learning', 'course', 'courses', 'coaching', 'institute', 'tuition'],
  real_estate: ['realestate', 'property', 'properties', 'housing', 'realty', 'estate', 'homes'],
  agency: ['agency', 'consulting', 'consultancy', 'marketing', 'creative'],
  legal: ['legal', 'law', 'lawyer', 'attorney', 'advocate'],
  hospitality: ['hospitality', 'hotel', 'hotels', 'resort', 'resorts', 'restaurant', 'cafe'],
  salon: ['salon', 'spa', 'parlour', 'parlor', 'barber', 'grooming'],
  fashion: ['fashion', 'apparel', 'clothing', 'boutique', 'wear', 'garments'],
  electronics: ['electronics', 'gadgets', 'appliances', 'tech'],
  beauty: ['beauty', 'cosmetics', 'skincare', 'makeup'],
  home: ['home', 'decor', 'furniture', 'interior', 'interiors', 'furnishing'],
  food: ['food', 'grocery', 'bakery', 'restaurant', 'kitchen', 'gourmet'],
  jewelry: ['jewelry', 'jewellery', 'ornaments', 'gems'],
  sports: ['sports', 'fitness', 'gym', 'athletics', 'outdoor'],
  retail: ['retail', 'shop', 'store', 'mart'],
};

function normalizeTagText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tagTokens(value) {
  const normalized = normalizeTagText(value);
  if (!normalized) return { phrase: '', tokens: [] };
  const tokens = normalized
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !TAG_STOPWORDS.has(t));
  return { phrase: normalized.replace(/\s+/g, ''), tokens };
}

const singular = (t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);

function industryTokenSet(industryKey) {
  const key = normalizeTagText(industryKey).replace(/\s+/g, '_');
  const meta = INDUSTRIES[industryKey] || {};
  const raw = new Set([
    key,
    ...normalizeTagText(industryKey).split(/[\s_]+/),
    ...tagTokens(meta.label).tokens,
    ...tagTokens(meta.sector).tokens,
    ...(INDUSTRY_TAG_ALIASES[industryKey] || []),
  ]);
  const tokens = new Set();
  for (const t of raw) {
    const n = normalizeTagText(t).replace(/\s+/g, '');
    if (n.length >= 3) {
      tokens.add(n);
      tokens.add(singular(n));
    }
  }
  return tokens;
}

let cachedIndustryTokens = null;
function getIndustryTokenMap() {
  if (cachedIndustryTokens) return cachedIndustryTokens;
  cachedIndustryTokens = new Map();
  for (const key of Object.keys(INDUSTRIES || {})) {
    cachedIndustryTokens.set(key, industryTokenSet(key));
  }
  return cachedIndustryTokens;
}

/** Set of canonical industry keys matched by a theme's tags. Empty → untagged. */
function industriesForThemeTags(tags) {
  const matched = new Set();
  const list = Array.isArray(tags) ? tags : String(tags || '').split(',');
  if (!list.length) return matched;

  const tagPhrases = new Set();
  const tagToks = new Set();
  for (const raw of list) {
    const { phrase, tokens } = tagTokens(raw);
    if (phrase) tagPhrases.add(phrase);
    for (const t of tokens) {
      tagToks.add(t);
      tagToks.add(singular(t));
    }
  }
  if (!tagPhrases.size && !tagToks.size) return matched;

  for (const [key, industryToks] of getIndustryTokenMap()) {
    const keyPhrase = key.replace(/_/g, '');
    const keyTokens = key.split('_');
    for (const phrase of tagPhrases) {
      if (industryToks.has(phrase) || singular(phrase) === key || phrase === keyPhrase) {
        matched.add(key);
        break;
      }
      // "some part of that industry name" — tag contains a key token or vice-versa
      if (phrase.length >= 4 && keyPhrase.length >= 4 && (keyPhrase.includes(phrase) || phrase.includes(keyPhrase))) {
        matched.add(key);
        break;
      }
    }
    if (matched.has(key)) continue;
    for (const t of tagToks) {
      if (industryToks.has(t) || (keyTokens.includes(t) && t.length >= 3)) {
        matched.add(key);
        break;
      }
    }
  }
  return matched;
}

/**
 * Catalog visibility rule:
 *  - theme has no industry-matching tags → visible to everyone
 *  - theme has industry tags → visible only when `industry` matches one of them
 *  - empty `industry` (no store context) → no filtering
 */
function themeMatchesIndustry(tags, industry) {
  const key = String(industry || '').trim();
  if (!key) return true;
  const matched = industriesForThemeTags(tags);
  if (!matched.size) return true;
  return matched.has(key);
}

/* ------------------------------ data sources ------------------------------ */

const DATA_SOURCE_BLOCK_TYPES = {
  'features-grid': 'feature-item',
  'media-gallery': 'gallery-item',
  'logo-cloud': 'logo-item',
  pricing: 'pricing-item',
};

const PACKAGE_KEYWORDS = /destinations?|packages?|tours?|trips?|itinerar|getaways?|holidays?|vacations?|catalog/i;

const absolutizeUrl = (url, origin) => {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('blob:')) return u;
  const o = String(origin || '').replace(/\/$/, '');
  if (!o) return u;
  return u.startsWith('/') ? `${o}${u}` : `${o}/${u}`;
};

const slugifyText = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'package';

const escHtml = (s) =>
  String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function packageFacts(d) {
  const dest = String(d.destination || (Array.isArray(d.destinations) ? d.destinations[0] : '') || '').trim();
  const duration = [
    d.durationDays ? `${d.durationDays}D` : '',
    d.durationNights ? `${d.durationNights}N` : '',
  ].filter(Boolean).join(' / ');
  const listPrice =
    Number(d.basePrice) || Number(d.adultPrice) || Number(d.childPrice) || Number(d.infantPrice) || 0;
  const discounted = Number(d.discountedPrice) || 0;
  const price = discounted > 0 && discounted < listPrice ? discounted : listPrice;
  const currency = String(d.currency || 'INR').trim().toUpperCase();
  const symbol = currency === 'INR' ? '₹' : `${currency} `;
  const basis = d.priceBasis === 'per_group' ? 'per group' : 'per person';
  const priceText = price > 0 ? `${symbol}${Number(price).toLocaleString('en-IN')}` : '';
  const category = d.category ? String(d.category).replace(/_/g, ' ') : '';
  return { dest, duration, priceText, basis, category };
}

function packageToBlock(rec, origin, blockType) {
  const d = rec.data || {};
  const { dest, duration, priceText, basis, category } = packageFacts(d);
  const image = absolutizeUrl(
    d.coverImage || (Array.isArray(d.galleryImages) ? d.galleryImages[0] : ''),
    origin
  );

  if (blockType === 'pricing-item') {
    const blurbParts = [
      d.shortDescription ? `<p>${escHtml(d.shortDescription)}</p>` : '',
      `<p><em>${escHtml([dest, duration].filter(Boolean).join(' · '))}</em></p>`,
    ];
    return {
      type: blockType,
      enabled: true,
      settings: {
        name: rec.title || 'Package',
        price: priceText,
        blurb: blurbParts.join(''),
        ctaLabel: 'Enquire now',
        ctaUrl: '/contact',
      },
    };
  }

  const body = [dest, duration, priceText && `${priceText} ${basis}`, category]
    .filter(Boolean)
    .join(' · ');
  return {
    type: blockType,
    enabled: true,
    settings: {
      title: rec.title || 'Package',
      body,
      caption: dest || body,
      mediaImageUrl: image,
      icon: '',
    },
  };
}

async function fetchTourTravelPackages(workspaceId, origin, blockType) {
  const rows = await SectorRecord.find({
    workspace: workspaceId,
    industry: 'tour_travel',
    entity: 'packages',
    status: 'active',
    archived: { $ne: true },
  })
    .sort({ startsAt: 1, createdAt: -1 })
    .limit(24)
    .lean();
  return rows.map((r) => packageToBlock(r, origin, blockType));
}

/**
 * Registry of bindable data sources, keyed `<industry>:<entity>`.
 * `industries` — store.industry values the source activates for.
 * `keywords`   — heading match used for auto-detection when a section lacks
 *                an explicit settings.dataSource.
 * `fetch`      — returns block objects or null to keep static content.
 */
const SECTION_DATA_SOURCES = {
  'tour_travel:packages': {
    industries: ['tour_travel'],
    keywords: PACKAGE_KEYWORDS,
    fetch: (workspaceId, origin, blockType) => fetchTourTravelPackages(workspaceId, origin, blockType),
  },
};

/**
 * Resolve the workspace that owns this store's sector records.
 * store.workspace → owner.currentWorkspace → owner's first workspace.
 */
async function resolveStoreRecordsWorkspaceId(store, owner) {
  const direct = store?.workspace?._id || store?.workspace;
  if (direct) return direct;
  if (owner?.currentWorkspace) return owner.currentWorkspace;
  const userId = store?.userId;
  if (!userId) return null;
  const ws = await Workspace.findOne({
    $or: [{ owner: userId }, { 'members.user': userId }],
  })
    .select('_id')
    .lean();
  return ws?._id || null;
}

function sectionBindsToSource(section, sourceKey, source, ctx = {}) {
  const type = String(section?.type || '').trim();
  if (!DATA_SOURCE_BLOCK_TYPES[type]) return false;
  const declared = String(section?.settings?.dataSource || '').trim();
  if (declared === 'none' || declared === 'static') return false;
  if (declared) return declared === sourceKey;
  // The pricing template is the packages/plans page — bind its grids directly
  // (uploaded listing pages often render cards via JS, leaving only a filter
  // shell that keyword matching can't detect).
  if (ctx.templateId === 'pricing') return true;
  const s = section.settings || {};
  const headingText = [s.eyebrow, s.heading, s.subheading, ctx.sectionId]
    .map((v) => String(v || ''))
    .join(' ');
  return source.keywords.test(headingText);
}

/**
 * Fetch raw active package records for a store (same scoping rules as
 * injectInformaticDataSources): industry gate → workspace cascade →
 * active, non-archived SectorRecords. Returns null when the source doesn't
 * apply to this store.
 */
async function fetchStoreLivePackages(store) {
  if (!store) return null;
  const industry = String(store.industry || '').trim();
  let owner = null;
  try {
    if (store.userId) {
      owner = await User.findById(store.userId)
        .select('currentWorkspace featureOverrides')
        .lean();
    }
  } catch { /* noop */ }
  const enabled =
    industry === 'tour_travel' ||
    owner?.featureOverrides?.travel === true ||
    owner?.featureOverrides?.industry === 'tour_travel';
  if (!enabled) return null;
  const workspaceId = await resolveStoreRecordsWorkspaceId(store, owner);
  if (!workspaceId) return null;
  return SectorRecord.find({
    workspace: workspaceId,
    industry: 'tour_travel',
    entity: 'packages',
    status: 'active',
    archived: { $ne: true },
  })
    .sort({ startsAt: 1, createdAt: -1 })
    .limit(48)
    .lean();
}

/**
 * Walk config.templates → sections and replace blocks of data-bound sections
 * with live workspace records. Only applies when the store's industry enables a
 * source (or the owner has the travel feature override) and the workspace has
 * active records — otherwise the section's static content is preserved.
 */
async function injectInformaticDataSources(config, { store, origin } = {}) {
  if (!config || typeof config !== 'object' || !config.templates || !store) {
    return config;
  }

  const industry = String(store.industry || '').trim();
  let owner = null;
  try {
    if (store.userId) {
      owner = await User.findById(store.userId).select('currentWorkspace featureOverrides').lean();
    }
  } catch { /* noop */ }

  const activeSources = Object.entries(SECTION_DATA_SOURCES).filter(([key, source]) => {
    if (source.industries.includes(industry)) return true;
    if (key === 'tour_travel:packages' && owner?.featureOverrides?.travel === true) return true;
    if (key === 'tour_travel:packages' && owner?.featureOverrides?.industry === 'tour_travel') return true;
    return false;
  });
  if (!activeSources.length) return config;

  const workspaceId = await resolveStoreRecordsWorkspaceId(store, owner);
  if (!workspaceId) return config;

  const blocksCache = new Map();
  const blocksFor = async (key, source, blockType) => {
    const cacheKey = `${key}:${blockType}`;
    if (!blocksCache.has(cacheKey)) {
      try {
        blocksCache.set(cacheKey, await source.fetch(workspaceId, origin, blockType));
      } catch {
        blocksCache.set(cacheKey, []);
      }
    }
    return blocksCache.get(cacheKey);
  };

  for (const [templateId, template] of Object.entries(config.templates)) {
    const sections = template?.sections;
    if (!sections || typeof sections !== 'object') continue;
    for (const [sectionId, section] of Object.entries(sections)) {
      for (const [key, source] of activeSources) {
        if (!sectionBindsToSource(section, key, source, { templateId, sectionId })) continue;
        const blockType = DATA_SOURCE_BLOCK_TYPES[String(section.type)];
        const blocks = await blocksFor(key, source, blockType);
        if (!blocks || !blocks.length) continue;
        const nextBlocks = {};
        const order = [];
        blocks.forEach((b, i) => {
          const id = `live_${key.replace(/[^a-z0-9]/gi, '_')}_${i}`;
          nextBlocks[id] = b;
          order.push(id);
        });
        section.blocks = nextBlocks;
        section.block_order = order;
        break;
      }
    }
  }
  return config;
}

module.exports = {
  industriesForThemeTags,
  themeMatchesIndustry,
  injectInformaticDataSources,
  fetchStoreLivePackages,
  resolveStoreRecordsWorkspaceId,
};
