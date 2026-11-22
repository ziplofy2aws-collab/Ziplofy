const mongoose = require('mongoose');
const axios = require('axios');
const WebpanelStore = require('../models/WebpanelStore');
const { isInformaticThemeInstalled } = require('./webpanelInformaticInstalledThemeController');
const { fetchCatalogEditorPack } = require('../utils/webpanelInformaticThemeRuntime.util');
const { fetchStoreLivePackages } = require('../utils/informaticIndustryData.util');
const { readSavedConfig } = require('../utils/webpanelInformaticThemeRuntime.util');
const { requireCodiicCatalogApiBase } = require('../utils/codiicCatalogApi');

function codiicClient() {
  return axios.create({
    baseURL: requireCodiicCatalogApiBase(),
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });
}

function injectHtmlBaseHref(html, baseHref) {
  const base = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  const baseTag = `<base href="${base}">`;
  let out = html;
  out = out.replace(
    /\b(src|href|poster)=(["'])\/(?!\/)([^"']*)\2/gi,
    (_m, attr, q, p) => `${attr}=${q}${base}${p}${q}`
  );
  out = out.replace(
    /url\(\s*(['"]?)\/(?!\/)([^)"']+)\1\s*\)/gi,
    (_m, q, p) => `url(${q}${base}${p}${q})`
  );
  if (/<base\b[^>]*>/i.test(out)) {
    out = out.replace(/<base\b[^>]*>/i, baseTag);
  } else if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}\n    ${baseTag}`);
  } else {
    out = `${baseTag}\n${out}`;
  }
  return out;
}

const TRAVEL_THEME_RE =
  /tour|travel|trip|holiday|vacation|destination|adventure|trek|tourism|journey|voyage|getaway|expedition|safari|cruise|hotel|resort|stay|excursion|hospitality/i;
const OTHER_INDUSTRY_RE =
  /beauty|fashion|apparel|clothing|food|restaurant|grocery|electronic|gadget|jewel|cosmetic|salon|fitness|gym|pharma|medical|health|furniture|real[- ]?estate|education|automobile|pet|baby|toy|sport/i;

/**
 * Should this catalog theme receive live tour-package data?
 * Allowed when the theme looks travel-related (tags/name/desc), or when its
 * industry can't be determined. Blocked only when its tags clearly point at a
 * different industry — e.g. a beauty theme on a travel store gets no packages.
 */
function themeSupportsPackageSync(theme) {
  const tags = (Array.isArray(theme?.tags) ? theme.tags : []).map(String);
  const hay = [...tags, theme?.name, theme?.slug, theme?.description]
    .filter(Boolean)
    .join(' ');
  if (TRAVEL_THEME_RE.test(hay)) return true;
  if (tags.some((t) => OTHER_INDUSTRY_RE.test(t))) return false;
  return true;
}

/**
 * Resolve { store, themeId, defaultConfig } for the store's applied theme.
 * `themeIdParam` (from theme-scoped URLs) must match the applied theme.
 * Returns 'passthrough' when the param is not an ObjectId — the caller then
 * falls through to the legacy wildcard route for that path.
 */
async function resolveSiteContext(storeId, themeIdParam) {
  if (!mongoose.Types.ObjectId.isValid(storeId)) return null;
  if (themeIdParam && !mongoose.Types.ObjectId.isValid(themeIdParam)) return 'passthrough';
  const store = await WebpanelStore.findById(storeId).lean();
  if (!store || store.status === 'suspended') return null;
  const themeId = store.appliedTheme ? String(store.appliedTheme) : '';
  if (!themeId) return null;
  if (themeIdParam && themeIdParam !== themeId) return null;
  const installed = await isInformaticThemeInstalled(storeId, themeId);
  if (!installed) return null;
  const pack = await fetchCatalogEditorPack(themeId);
  const contentRoot = pack?.theme?.s3Assets?.contentRoot?.prefix;
  if (!contentRoot) return null;
  return {
    store,
    storeId: String(storeId),
    themeId,
    defaultConfig: pack.config || {},
    packageSync: themeSupportsPackageSync(pack.theme),
  };
}

function requestOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

function absolutizeUrl(url, origin) {
  const u = String(url || '').trim();
  if (!u) return u;
  if (/^(https?:)?\/\//i.test(u) || /^(data|blob):/i.test(u)) return u;
  return u.startsWith('/') ? `${origin}${u}` : `${origin}/${u}`;
}

/* ----------------- live data → theme data-file rewrite ----------------- */

// `window.X = [...]` / `globalThis.X = [...]` / `self.X = [...]`
const DATA_GLOBAL_RE = /(?:window|globalThis|self)\.([A-Za-z_$][\w$]*)\s*=\s*(\[)/g;
// `var|let|const X = [...]` — top-level or inside functions.
const DATA_DECL_RE = /(?:^|[\n;]\s*)(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(\[)/gm;
// `key: [...]` object properties — catches `window.DATA = { packages: [...] }`
// and option-object patterns.
const DATA_PROP_RE = /["']?([A-Za-z_$][\w$]*)["']?\s*:\s*(\[)/g;

/** Does an array literal's first object look like a package/product record? */
function looksLikeRecordArray(arraySrc) {
  const head = arraySrc.slice(0, 3000);
  const hits = ['title', 'name', 'price', 'img', 'image', 'days', 'nights', 'duration', 'destination', 'location', 'gallery']
    .filter((k) => new RegExp(`["']?${k}["']?\\s*:`, 'i').test(head));
  return hits.length >= 3;
}

/** Extract the first `{...}` object of an array literal (balanced braces). */
function firstObjectLiteral(arraySrc) {
  const start = arraySrc.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < arraySrc.length; i++) {
    const ch = arraySrc[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return arraySrc.slice(start, i + 1);
    }
  }
  return null;
}

function findMatchingBracket(src, openIdx) {
  let depth = 0;
  let inStr = null;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (ch === '\\') i++;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const slugify = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const titleCase = (s) =>
  String(s || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function recordPrice(d) {
  const listPrice =
    Number(d.basePrice) || Number(d.adultPrice) || Number(d.childPrice) || Number(d.infantPrice) || 0;
  const discounted = Number(d.discountedPrice) || 0;
  return discounted > 0 && discounted < listPrice ? discounted : listPrice;
}

/** Map one SectorRecord onto the shape of the theme's own data object. */
function recordToShape(rec, template, origin) {
  const d = rec.data || {};
  const days = Number(d.durationDays) || 0;
  const nights = Number(d.durationNights) || 0;
  const price = recordPrice(d);
  const cover = absolutizeUrl(
    d.coverImage || (Array.isArray(d.galleryImages) ? d.galleryImages[0] : ''),
    origin
  );
  const gallery = (Array.isArray(d.galleryImages) ? d.galleryImages : [d.coverImage])
    .filter(Boolean)
    .map((u) => absolutizeUrl(u, origin));
  const dest = String(
    d.destination || (Array.isArray(d.destinations) ? d.destinations[0] : '') || ''
  ).trim();
  const durLabel = [days && `${days}D`, nights && `${nights}N`].filter(Boolean).join(' ');
  const durText =
    [days && `${days} Days`, nights && `${nights} Nights`].filter(Boolean).join(' & ') || durLabel;
  const desc = String(d.shortDescription || d.description || '').trim();
  const id = String(rec.urlHandle || rec._id);
  const category = d.category ? String(d.category).replace(/_/g, ' ') : '';
  const includes = Array.isArray(d.inclusions) ? d.inclusions : [];
  const excludes = Array.isArray(d.exclusions) ? d.exclusions : [];

  const out = { ...template };
  for (const key of Object.keys(template)) {
    const k = key.toLowerCase();
    if (k === 'id' || k === 'slug' || k === 'handle' || k === 'urlhandle') out[key] = id;
    else if (k === 'title' || k === 'name') out[key] = rec.title || '';
    else if (/subtitle|tagline/.test(k)) out[key] = desc;
    else if (/^(summary|description|about|blurb|excerpt)$/.test(k)) out[key] = desc;
    else if (/^img$|^image$|imageurl|cover|thumbnail|photo$/.test(k)) out[key] = cover;
    else if (/^gallery$|^images$|photos$/.test(k)) out[key] = gallery;
    else if (/location|route|^destination$|^dest$/.test(k)) out[key] = dest;
    else if (k === 'destinations') {
      const raw = Array.isArray(d.destinations) ? d.destinations : [dest];
      out[key] = raw.map(slugify).filter(Boolean);
    }
    else if (k === 'days' || k === 'durationdays') out[key] = days;
    else if (k === 'nights' || k === 'durationnights') out[key] = nights;
    else if (/durationlabel|durationtext|^duration$/.test(k)) out[key] = durText || durLabel;
    else if (k === 'price' || /baseprice|adultprice/.test(k)) out[key] = price;
    else if (/pricewas|compareat|originalprice|oldprice|listprice/.test(k)) {
      const list = Number(d.basePrice) || Number(d.adultPrice) || 0;
      out[key] = list > price ? list : template[key];
    } else if (k === 'currency') out[key] = d.currency || 'INR';
    else if (/^badge$|badgelabel/.test(k)) out[key] = category ? category.replace(/\b\w/g, (c) => c.toUpperCase()) : template[key];
    else if (/^categories$|^types$/.test(k)) out[key] = category ? ['all', slugify(d.category)] : template[key];
    else if (/^category$/.test(k)) out[key] = d.category || '';
    else if (/includ/.test(k)) out[key] = includes.length ? includes : template[key];
    else if (/exclud/.test(k)) out[key] = excludes.length ? excludes : template[key];
    else if (/^url$|^href$|^link$/.test(k)) out[key] = '#';
    else if (/rating|reviews|photocount|features|seasons|offerlabel|offernote/.test(k)) {
      // keep template default — theme-specific presentation fields
    }
  }
  return out;
}

/**
 * Rewrite `window.X = [ ... ]` literals in a theme data JS file with live
 * SectorRecords, shaped like the file's own template object. Returns null
 * when nothing matched (caller should serve the original file).
 */
function rewriteDataJs(source, records, origin) {
  if (!records || !records.length) return null;
  let out = source;
  let changed = false;

  // Collect array-literal positions from every declaration style, dedupe by
  // the `[` position, then rewrite right-to-left so indexes stay valid.
  const seen = new Set();
  const matches = [];
  const collect = (re) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source))) {
      const arrayStart = m.index + m[0].length - 1;
      if (seen.has(arrayStart)) continue;
      seen.add(arrayStart);
      matches.push({ index: m.index, arrayStart });
    }
  };
  collect(DATA_GLOBAL_RE);
  collect(DATA_DECL_RE);
  collect(DATA_PROP_RE);
  matches.sort((a, b) => b.index - a.index);

  for (const { arrayStart } of matches) {
    const arrayEnd = findMatchingBracket(out, arrayStart);
    if (arrayEnd < 0) continue;
    const arraySrc = out.slice(arrayStart, arrayEnd + 1);
    if (!looksLikeRecordArray(arraySrc)) continue;
    const objSrc = firstObjectLiteral(arraySrc);
    let template = {};
    if (objSrc) {
      try {
        // eslint-disable-next-line no-new-func
        template = Function(`"use strict"; return (${objSrc});`)() || {};
      } catch {
        template = {};
      }
    }
    const mapped = records.map((rec) => recordToShape(rec, template, origin));
    out = `${out.slice(0, arrayStart)}${JSON.stringify(mapped)}${out.slice(arrayEnd + 1)}`;
    changed = true;
  }
  return changed ? out : null;
}

/* ------- live data → theme demo-filter neutralization (HTML/JS) ------- */

/**
 * Budget bounds that cover every live package price (with a little headroom),
 * so a theme's demo price-range slider cannot hide real records.
 */
function liveBudgetBounds(records) {
  let min = Infinity;
  let max = 0;
  for (const rec of records) {
    const p = recordPrice((rec && rec.data) || {});
    if (p < min) min = p;
    if (p > max) max = p;
  }
  if (!Number.isFinite(min)) min = 0;
  const step = 1000;
  return {
    min: Math.max(0, Math.floor(min / step) * step),
    max: Math.ceil((Math.max(max, min) * 1.1 || step) / step) * step,
  };
}

/**
 * Rewrite `*BUDGET_MIN*` / `*BUDGET_MAX*` style numeric constants in theme JS
 * so demo price-range filters include live package prices.
 */
function patchBudgetConstants(js, bounds) {
  return js.replace(
    /\b(const|let|var)\s+(\w*BUDGET_(MIN|MAX)\w*)\s*=\s*\d+/g,
    (m, decl, name, which) => `${decl} ${name} = ${which === 'MIN' ? bounds.min : bounds.max}`
  );
}

/**
 * Live destinations (slug → display label) collected from records.
 */
function liveDestinations(records) {
  const map = new Map();
  for (const rec of records) {
    const d = (rec && rec.data) || {};
    const names = [
      ...(Array.isArray(d.destinations) ? d.destinations : []),
      d.destination,
    ].filter(Boolean);
    for (const n of names) {
      const slug = slugify(n);
      if (slug && !map.has(slug)) map.set(slug, titleCase(n));
    }
  }
  return map;
}

/**
 * When a store has live packages, the theme's own demo filter defaults would
 * hide them (pre-checked destination/season boxes, a narrow demo price range,
 * a hardcoded destination list). This rewrites the served HTML so live data
 * is visible: unchecks data-group filters, widens price/budget range inputs,
 * and appends the store's real destinations to the theme's destination list.
 */
function neutralizeDemoFilters(html, records) {
  if (!records || !records.length) return html;
  let out = html;
  let isFilterPage = false;

  // 1) uncheck every pre-checked data-group filter input
  out = out.replace(/<input\b[^>]*\bdata-group="[^"]*"[^>]*>/gi, (tag) => {
    isFilterPage = true;
    return tag.replace(/\s+checked(?:="[^"]*")?/i, '');
  });
  if (!isFilterPage) return out;

  // 2) widen price/budget range inputs to cover live prices
  const bounds = liveBudgetBounds(records);
  out = out.replace(/<input\b[^>]*\btype="range"[^>]*>/gi, (tag) => {
    const meta =
      (tag.match(/\b(?:id|name|class|aria-label)="[^"]*"/gi) || []).join(' ');
    if (!/(price|budget)/i.test(meta)) return tag;
    const isMax = /max/i.test(meta);
    let t = tag
      .replace(/(\bmin=")\d+/i, `$1${bounds.min}`)
      .replace(/(\bmax=")\d+/i, `$1${bounds.max}`);
    if (/\bvalue="\d+"/i.test(t)) {
      t = t.replace(/(\bvalue=")\d+/i, `$1${isMax ? bounds.max : bounds.min}`);
    }
    return t;
  });

  // 3) append live destinations to the theme's destination checkbox list
  const listed = new Set();
  out.replace(/<input\b[^>]*\bdata-group="dest"[^>]*>/gi, (tag) => {
    const v = tag.match(/\bvalue="([^"]*)"/i);
    if (v) listed.add(v[1].toLowerCase());
    return tag;
  });
  const missing = [...liveDestinations(records)].filter(([slug]) => !listed.has(slug));
  if (missing.length) {
    const firstItem = out.search(/data-dest-item/i);
    if (firstItem >= 0) {
      const ulEnd = out.indexOf('</ul>', firstItem);
      if (ulEnd > 0) {
        const items = missing
          .map(
            ([slug, label]) =>
              `<li data-dest-item>\n              <label><input type="checkbox" data-group="dest" value="${slug}"><span>${label} <em data-count="dest:${slug}">(0)</em></span></label>\n            </li>`
          )
          .join('\n');
        out = `${out.slice(0, ulEnd)}${items}\n          ${out.slice(ulEnd)}`;
      }
    }
  }
  return out;
}

/* ------- live data → hard-coded card lists (single-page HTML themes) ------- */

// Container/card identity hints that mark a repeated list as package/destination
// content (worth swapping for live records) vs unrelated repeated markup.
const CARD_LIST_CONTEXT_RE =
  /dest|tour|packag|trip|travel|stay|holid|experien|cruise|safari|trek|journey|voyage|itinerar|getaway|resort|hotel|excursion|adventure|vacation|offer|deal|room|suite|villa|cabin|listing|package|product/i;
const CARD_LIST_EXCLUDE_RE =
  /stor(y|ies)|testimonial|review|blog|news|journal|team|partner|faq|brand|client|logo|instagram|subscriber|newsletter|footer|header|nav|social|avatar|quote|comment|step|service|feature|benefit|counter|stat/i;
const CARDISH_CLASS_RE =
  /card|tour|pack|packag|dest|trip|stay|slide|tile|post|entry|product|offer|deal|room|suite|villa|listing|item/i;

/** Balanced-tag scan: bounds of the element whose open tag starts at `start`. */
function extractElementBounds(html, start) {
  const m = /^<([a-zA-Z][\w-]*)\b/.exec(html.slice(start, start + 64));
  if (!m) return null;
  const tag = m[1].toLowerCase();
  const re = new RegExp(`<${tag}\\b[^>]*>|<\\/${tag}\\s*>`, 'gi');
  re.lastIndex = start;
  let depth = 0;
  let t;
  while ((t = re.exec(html))) {
    if (/^<\//.test(t[0])) {
      depth--;
      if (depth === 0) return { end: re.lastIndex };
    } else if (!/\/>$/.test(t[0])) {
      depth++;
    }
  }
  return null;
}

/** tag + class signature used to detect repeated sibling cards. */
function cardSignature(openTag) {
  const tag = (/^<([a-zA-Z][\w-]*)/.exec(openTag) || [])[1] || '';
  const cls = (/class\s*=\s*"([^"]*)"/i.exec(openTag) || [])[1] || '';
  return `${tag.toLowerCase()}:${cls.trim().toLowerCase().replace(/\s+/g, ' ')}`;
}

const isSiblingGap = (gap) => /^(\s|<!--[\s\S]*?-->)*$/.test(gap);

/**
 * Find runs of >=3 consecutive same-shape sibling elements that each contain
 * an <img> — the classic hard-coded "cards" pattern (article.dest-card ×4 …).
 */
function findCardRuns(html) {
  const runs = [];
  const openRe = /<(article|li|figure|div|a|section)\b[^>]*>/gi;
  let m;
  while ((m = openRe.exec(html))) {
    const tag = m[1].toLowerCase();
    const isDivLike = tag === 'div' || tag === 'a' || tag === 'section';
    if (isDivLike && !CARDISH_CLASS_RE.test(m[0])) continue; // plain layout divs
    const bounds = extractElementBounds(html, m.index);
    if (!bounds) continue;
    const body = html.slice(m.index, bounds.end);
    if (!/<img\b/i.test(body)) {
      openRe.lastIndex = bounds.end;
      continue;
    }
    // A div-ish element that wraps article/li/figure children is a container,
    // not a card — let its children be scanned instead.
    if (isDivLike && /<(article|li|figure)\b/i.test(body)) continue;
    const sig = cardSignature(m[0]);
    const prev = runs[runs.length - 1];
    if (prev && prev.sig === sig && isSiblingGap(html.slice(prev.end, m.index))) {
      prev.elems.push({ start: m.index, end: bounds.end });
      prev.end = bounds.end;
    } else {
      runs.push({ sig, start: m.index, end: bounds.end, elems: [{ start: m.index, end: bounds.end }] });
    }
    openRe.lastIndex = bounds.end; // never treat children of a card as cards
  }
  return runs.filter((r) => r.elems.length >= 3);
}

/**
 * Does the markup around a card run look like package/destination content?
 * Checks the card signature first, then nearby container/section attrs and
 * headings. Explicitly excludes story/testimonial/etc regions.
 */
function contextAllowsCardList(html, run) {
  if (CARD_LIST_EXCLUDE_RE.test(run.sig)) return false;
  if (CARD_LIST_CONTEXT_RE.test(run.sig)) return true;
  const ctx = html.slice(Math.max(0, run.start - 2500), run.start);
  const opens = (ctx.match(/<(section|div|ul|ol|header|aside)\b[^>]*>/gi) || []).slice(-3).join(' ');
  const headings = (ctx.match(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi) || []).slice(-2).join(' ');
  const hay = `${opens} ${headings}`;
  if (CARD_LIST_EXCLUDE_RE.test(opens) && !CARD_LIST_CONTEXT_RE.test(opens)) return false;
  return CARD_LIST_CONTEXT_RE.test(hay);
}

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

/** Clone-field mapping: write one live record into a card's markup. */
function mapCardToRecord(cardHtml, rec, origin) {
  const d = (rec && rec.data) || {};
  const days = Number(d.durationDays) || 0;
  const nights = Number(d.durationNights) || 0;
  const price = recordPrice(d);
  const cover = absolutizeUrl(
    d.coverImage || (Array.isArray(d.galleryImages) ? d.galleryImages[0] : ''),
    origin
  );
  const dest = String(
    d.destination || (Array.isArray(d.destinations) ? d.destinations[0] : '') || ''
  ).trim();
  const title = String(rec.title || '').trim();
  const durText = [
    days && `${days} Day${days === 1 ? '' : 's'}`,
    nights && `${nights} Night${nights === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(' & ');
  let out = cardHtml;

  // image: swap src/srcset/alt of the first <img>
  if (cover) {
    out = out.replace(/(<img\b[^>]*?)\bsrc=(["'])[^"']*\2/i, `$1src=$2${cover}$2`);
    out = out.replace(/(<img\b[^>]*?)\bsrcset=(["'])[^"']*\2/i, `$1srcset=$2${cover}$2`);
    if (title) {
      out = out.replace(/(<img\b[^>]*?)\balt=(["'])[^"']*\2/i, `$1alt=$2${title.replace(/"/g, '&quot;')}$2`);
    }
  }

  // title: first heading, else a name/title-classed element
  if (title) {
    const oldHeading = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(cardHtml);
    const oldTitle = oldHeading ? oldHeading[1].replace(/<[^>]+>/g, '').trim() : '';
    const esc = escapeHtmlText(title);
    let done = false;
    out = out.replace(/(<h[1-6]\b[^>]*>)([\s\S]*?)(<\/h[1-6]>)/i, (m, open) => {
      if (done) return m;
      done = true;
      return `${open}${esc}</h${(open.match(/h([1-6])/i) || [])[1]}>`;
    });
    // leftover demo-title mentions (aria-labels, alts, captions) stay consistent
    if (oldTitle && oldTitle !== title) out = out.split(oldTitle).join(esc);
    if (!done) {
      out = out.replace(
        /(<[^>]+\bclass="[^"]*(?:name|title|heading)[^"]*"[^>]*>)[^<]*/i,
        `$1${esc}`
      );
    }
  }

  // location: element with a place-ish class, else the parent of a pin icon —
  // keep inner markup (icons), drop text nodes, append the destination.
  if (dest) {
    const esc = escapeHtmlText(dest);
    const LOC_TAGS = 'p|div|span|small|li|em|strong|address|td|figcaption';
    const locRe = new RegExp(
      `(<(${LOC_TAGS})\\b[^>]*\\bclass="[^"]*(?:place|location|country|region|locale|map|where)[^"]*"[^>]*>)([\\s\\S]*?)(<\\/\\2\\s*>)`,
      'i'
    );
    const pinRe = new RegExp(
      `(<(${LOC_TAGS})\\b[^>]*>)([\\s\\S]*?<i\\b[^>]*class="[^"]*(?:location|map-marker|map-pin|globe|compass|pin)[^"]*"[^>]*>[\\s\\S]*?)(<\\/\\2\\s*>)`,
      'i'
    );
    const stripText = (inner) =>
      inner
        .replace(/^[^<]*[A-Za-z][^<]*</g, '<')
        .replace(/>[^<]*[A-Za-z][^<]*</g, '><')
        .replace(/>[^<]*$/, '>');
    if (locRe.test(out)) {
      out = out.replace(
        locRe,
        (m, open, _t, inner, close) => `${open}${stripText(inner)} ${esc}${close}`
      );
    } else if (pinRe.test(out)) {
      out = out.replace(
        pinRe,
        (m, open, _t, inner, close) => `${open}${stripText(inner)} ${esc}${close}`
      );
    }
  }

  // price: replace the digits in the first currency-amount text (literal symbol
  // or HTML entity), keeping the card's own symbol; else fill a price element.
  if (price) {
    const sym = CURRENCY_SYMBOLS[String(d.currency || 'INR').toUpperCase()] || '₹';
    const formatted = Number(price).toLocaleString('en-IN');
    const AMOUNT_RE =
      /(₹|&#8377;|&#x20b9;|\$|&#36;|&dollar;|€|&euro;|&#8364;|£|&pound;|&#163;|¥|&yen;|&#165;)\s*[\d,]+(\.\d+)?/i;
    if (AMOUNT_RE.test(out)) {
      out = out.replace(AMOUNT_RE, `$1${formatted}`);
    } else {
      const leafPrice =
        /(<(p|span|strong|em|small|b|i|h[1-6]|a|td)\b[^>]*\bclass="[^"]*(?:price|cost|amount|rate|tariff)[^"]*"[^>]*>)[^<]*/i;
      if (leafPrice.test(out)) {
        out = out.replace(leafPrice, `$1${sym}${formatted} `);
      } else {
        out = out.replace(
          /(<[^>]+\bclass="[^"]*(?:price|cost|amount|rate|tariff)[^"]*"[^>]*>)[^<]+/i,
          `$1${sym}${formatted} `
        );
      }
    }
  }

  // duration: "5 Days & 4 Nights", "7D/6N", "10 Days" style text
  if (durText) {
    if (/\d+\s*Days?\s*(?:&|\/|and|-)\s*\d+\s*Nights?/i.test(out)) {
      out = out.replace(/\d+\s*Days?\s*(?:&|\/|and|-)\s*\d+\s*Nights?/i, durText);
    } else if (/\b\d+\s*D\s*\/\s*\d+\s*N\b/i.test(out)) {
      out = out.replace(/\b\d+\s*D\s*\/\s*\d+\s*N\b/i, `${days}D/${nights}N`);
    } else if (/\b\d+\s*Days?\b/i.test(out)) {
      out = out.replace(/\b\d+\s*Days?\b/i, days ? `${days} Days` : durText);
    }
  }

  // deep links: repoint the card's own ?id= links / data-pkg-id at the live
  // record so detail pages + enquiry wiring resolve the real package.
  const rid = String((rec && rec._id) || '');
  if (rid) {
    out = out.replace(/(\bdata-pkg-id\s*=\s*["'])[^"']*(["'])/gi, `$1${rid}$2`);
    out = out.replace(/(\bhref\s*=\s*["'][^"']*?[?&]id=)[^&"']*/gi, `$1${rid}`);
  }

  return out;
}

/**
 * Replace hard-coded demo card lists (destinations/stays/tours rendered as
 * static markup in themes without JS data files) with clones of the theme's
 * own card template filled from live package records.
 */
function injectLivePackageCards(html, records, origin) {
  if (!records || !records.length) return html;
  const runs = findCardRuns(html);
  let out = html;
  for (const run of runs.slice().reverse()) {
    if (!contextAllowsCardList(out, run)) continue;
    const template = out.slice(run.elems[0].start, run.elems[0].end);
    const sep =
      run.elems.length > 1 ? out.slice(run.elems[0].end, run.elems[1].start) : '\n';
    const cards = records.map((rec) => mapCardToRecord(template, rec, origin));
    out = `${out.slice(0, run.start)}${cards.join(sep)}${out.slice(run.end)}`;
  }
  return out;
}

/**
 * `?id=`/`?pkg=` param resolving to a live record — used to sync fully-static
 * package detail pages (no JS data layer) served for detail-ish filenames.
 */
function detailPageRecord(records, query, rel) {
  if (!records || !records.length) return null;
  if (!/detail|package|product|tour|trip|itinerar/i.test(String(rel || ''))) return null;
  const want = String(query?.id || query?.pkg || '').trim();
  if (!want) return null;
  return (
    records.find(
      (r) => String(r._id) === want || String(r.data?.slug || '') === want
    ) || null
  );
}

/* ------------- saved-config → content (text/image) overrides ------------- */

const TEXT_SETTING_KEYS = new Set([
  'heading', 'title', 'subheading', 'eyebrow', 'name', 'label', 'ctalabel',
  'linklabel', 'buttonlabel', 'text', 'body', 'summary', 'blurb', 'tagline',
  'subtitle', 'announcement', 'description', 'placeholder',
]);
const IMAGE_SETTING_RE = /image|img|photo|picture|avatar|logo|poster|media/i;
const looksLikeImageRef = (v) =>
  /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(String(v || '')) ||
  /^https?:\/\//i.test(String(v || ''));

/**
 * Diff saved config against the pack defaults and collect content edits the
 * user made in the editor (headings/titles/labels + swapped images).
 */
function collectContentOverrides(defaultCfg, saved) {
  const out = { texts: [], images: [] };
  if (!saved) return out;
  const seen = new Set();
  const visit = (dObj, sObj) => {
    if (!dObj || !sObj) return;
    for (const [k, sv] of Object.entries(sObj)) {
      if (typeof sv !== 'string' || !sv.trim()) continue;
      const dv = dObj[k];
      if (typeof dv !== 'string' || !dv.trim() || dv === sv) continue;
      const key = k.toLowerCase();
      const sig = `${key}:${dv}`;
      if (TEXT_SETTING_KEYS.has(key) && !seen.has(`t:${sig}`)) {
        seen.add(`t:${sig}`);
        out.texts.push({ match: dv, text: sv });
      } else if (IMAGE_SETTING_RE.test(key) && looksLikeImageRef(sv) && looksLikeImageRef(dv)) {
        if (!seen.has(`i:${sig}`)) {
          seen.add(`i:${sig}`);
          out.images.push({ match: dv, src: sv });
        }
      }
    }
  };
  const walkSections = (dSecs, sSecs) => {
    if (!dSecs || !sSecs) return;
    for (const [sid, sSec] of Object.entries(sSecs)) {
      const dSec = dSecs[sid];
      if (!dSec) continue;
      visit(dSec.settings || {}, sSec.settings || {});
      const dBlocks = dSec.blocks || {};
      const sBlocks = sSec.blocks || {};
      for (const [bid, sBlock] of Object.entries(sBlocks)) {
        visit(dBlocks[bid]?.settings || {}, sBlock.settings || {});
      }
    }
  };
  const dTpl = defaultCfg?.templates || {};
  const sTpl = saved.templates || {};
  for (const [tid, sT] of Object.entries(sTpl)) {
    walkSections(dTpl[tid]?.sections || {}, sT.sections || {});
  }
  walkSections(defaultCfg?.sections || {}, saved.sections || {});
  // Layout blocks can also sit directly under layout settings in some packs.
  return out;
}

const escapeHtmlText = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'source', 'track', 'wbr',
]);

/**
 * Find `words` (match split on whitespace) appearing as consecutive text
 * inside one element — separated only by inline markup (`<br>`, `<span>`,
 * entities). Walks tokens with a tag stack so the region never swallows the
 * parent's own tags or leaves orphaned closers. Returns `{start, end}` where
 * `start` is the `>` of the enclosing tag and `end` is the boundary `<`.
 */
function findSplitTextRegion(html, words) {
  if (!words.length) return null;
  const firstRe = new RegExp(`>\\s*${escapeRegExp(words[0])}`, 'g');
  let m;
  while ((m = firstRe.exec(html))) {
    const start = m.index;
    let pos = m.index + m[0].length;
    let wi = 1;
    let ok = true;
    let end = -1;
    const stack = [];
    while (pos < html.length) {
      const rest = html.slice(pos);
      const ws = rest.match(/^\s+/);
      if (ws) { pos += ws[0].length; continue; }
      if (rest[0] === '<') {
        const tag = rest.match(/^<[^>]*>/);
        if (!tag) { ok = false; break; }
        const t = tag[0];
        const name = ((t.match(/^<\/?\s*([a-zA-Z0-9]+)/) || [])[1] || '').toLowerCase();
        if (wi >= words.length) {
          // All words consumed: pop matching closers, then stop at the
          // first tag that doesn't close something opened inside the region.
          if (/^<\//.test(t) && name === stack[stack.length - 1]) {
            stack.pop(); pos += t.length; continue;
          }
          end = pos;
          break;
        }
        if (/^<\//.test(t)) {
          if (name === stack[stack.length - 1]) stack.pop();
          pos += t.length;
          continue;
        }
        if (!/\/>$/.test(t) && !VOID_TAGS.has(name)) stack.push(name);
        pos += t.length;
        continue;
      }
      const ent = rest.match(/^&(?:[a-zA-Z]+|#\d+);/);
      if (ent) {
        if (wi >= words.length) { ok = false; break; } // trailing text — don't split mid-text
        pos += ent[0].length;
        continue;
      }
      if (wi >= words.length) { ok = false; break; }
      const w = words[wi];
      if (!rest.startsWith(w)) { ok = false; break; }
      pos += w.length;
      wi++;
    }
    if (ok && wi >= words.length && end > 0) return { start, end };
  }
  return null;
}

/**
 * Apply content overrides to served HTML: text swaps happen inside `>…<`
 * text-node boundaries (first occurrence, whitespace-tolerant); image swaps
 * rewrite src/href/poster attributes whose value shares the old file basename.
 */
function applyContentOverrides(html, overrides) {
  let out = html;
  for (const { match, text } of overrides.texts) {
    const escNew = escapeHtmlText(text);
    let replaced = false;
    for (const needle of [match, escapeHtmlText(match)]) {
      if (replaced || !needle) continue;
      const re = new RegExp(`>(\\s*)${escapeRegExp(needle)}(\\s*)<`);
      if (re.test(out)) {
        out = out.replace(re, (_m, w1, w2) => `>${w1}${escNew}${w2}<`);
        replaced = true;
      }
    }
    if (!replaced) {
      // Fallback: the original text may be split across inline markup
      // (`<br>`, `<span class="…-accent">Awaits</span>`). Scan for the words
      // in order inside one element and swap the whole region — keeps the
      // parent's tags balanced.
      for (const variant of [match, escapeHtmlText(match)]) {
        if (replaced || !variant) continue;
        const words = String(variant).trim().split(/\s+/).filter(Boolean);
        if (words.length < 2) continue;
        const region = findSplitTextRegion(out, words);
        if (region) {
          out = out.slice(0, region.start + 1) + escNew + out.slice(region.end);
          replaced = true;
        }
      }
    }
  }
  for (const { match, src } of overrides.images) {
    const base = String(match).split('?')[0].split('/').pop();
    if (!base) continue;
    const re = new RegExp(`(\\b(?:src|poster|href|data-src)=["'])[^"']*${escapeRegExp(base)}([^"']*["'])`, 'i');
    if (re.test(out)) out = out.replace(re, `$1${toStoreMediaProxyUrl(src)}$2`);
  }
  return out;
}

/**
 * S3 objects are private — rewrite stored S3 media URLs (older saves) to the
 * public store-media proxy path so images render on the storefront.
 */
function toStoreMediaProxyUrl(src) {
  const m = String(src || '').match(
    /^https?:\/\/[^/]*\.amazonaws\.com\/(webpanel-stores\/([^/]+)\/media\/.+)$/i
  );
  if (!m) return src;
  return `/api/stores/${m[2]}/media/file/${encodeURIComponent(m[1])}`;
}

/* ------------- saved-config → theme CSS variable overrides ------------- */

const themeVarCache = new Map(); // themeId → { at, vars: {name:value} }
const THEME_VARS_TTL_MS = 300_000;

const COLOR_SLOT_REGEXES = {
  primary: [/primary/, /brand/, /main/, /maroon/, /accent/, /navy/, /dark/, /ocean/, /deep/],
  accent: [/accent/, /secondary/, /highlight/, /gold/, /tan/, /sunset/],
  background: [/bg$/, /background/, /cream/, /surface/, /paper/, /canvas/],
  text: [/text/, /ink/, /fg$/, /foreground/, /body-color/],
  surface: [/surface/, /card/, /panel/],
  muted: [/muted/, /gray/, /grey/, /subtle/, /secondary-text/],
};
const FONT_HEADING_REGEXES = [/serif/, /heading/, /title/, /display/];
const FONT_BODY_REGEXES = [/sans/, /body/, /text/, /base/];

function pickVarName(varNames, regexes, taken) {
  for (const re of regexes) {
    const hit = varNames.find((n) => re.test(n) && !taken.has(n));
    if (hit) return hit;
  }
  return null;
}

/** Parse `:root { --x: v }` variables out of a stylesheet. */
function parseCssRootVars(css) {
  const vars = {};
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  const block = rootMatch ? rootMatch[1] : '';
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) vars[m[1]] = m[2].trim();
  return vars;
}

/**
 * Find the theme's own stylesheet (first relative css link in the HTML),
 * fetch it via codiic, and cache its :root variable map.
 */
async function fetchThemeCssVars(themeId, html) {
  const hit = themeVarCache.get(themeId);
  if (hit && Date.now() - hit.at < THEME_VARS_TTL_MS) return hit.vars;
  const hrefs = [...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"[^>]*>/gi)]
    .map((m) => m[1])
    .filter((h) => !/^https?:|^\/\//.test(h));
  const vars = {};
  for (const href of hrefs.slice(0, 3)) {
    const rel = href.replace(/^\.?\//, '').split('?')[0];
    try {
      const res = await codiicClient().get(
        `/informatic-themes/file/${themeId}/theme/${rel.split('/').map(encodeURIComponent).join('/')}`,
        { responseType: 'text' }
      );
      Object.assign(vars, parseCssRootVars(String(res.data || '')));
    } catch { /* stylesheet missing — skip */ }
    if (Object.keys(vars).length) break;
  }
  themeVarCache.set(themeId, { at: Date.now(), vars });
  return vars;
}

function googleFontsUrlFrom(families) {
  const fams = families
    .map((f) => String(f || '').replace(/["']/g, '').split(',')[0].trim())
    .filter((f) => f && !/^(system-ui|sans-serif|serif|monospace|georgia|times|arial|helvetica)/i.test(f));
  if (!fams.length) return '';
  const q = fams.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@300;400;500;600;700`).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/**
 * Build a <style>/<link> override snippet mapping saved config colors/fonts
 * onto the theme's OWN css variables — editor changes land on the live site.
 * Only values that differ from the pack defaults are applied: extracted
 * defaults can be imperfect (e.g. white picked as primary), so re-applying
 * them unchanged would risk corrupting the original design.
 */
async function buildConfigOverrides(ctx, html, saved) {
  if (!saved) return '';
  const defaults = ctx.defaultConfig?.settings || {};
  const colors = saved.settings?.colors || {};
  const defaultColors = defaults.colors || {};
  const typo = saved.settings?.typography || {};
  const defaultTypo = defaults.typography || {};
  const vars = await fetchThemeCssVars(ctx.themeId, html).catch(() => ({}));
  const names = Object.keys(vars);
  const taken = new Set();
  const overrides = [];

  for (const [slot, regexes] of Object.entries(COLOR_SLOT_REGEXES)) {
    const value = colors[slot];
    if (!value || value === defaultColors[slot]) continue; // unchanged — keep theme's own var
    const varName = pickVarName(names, regexes, taken);
    if (varName) {
      taken.add(varName);
      overrides.push(`${varName}: ${value};`);
    }
  }

  const headingVar = pickVarName(names, FONT_HEADING_REGEXES, taken);
  const bodyVar = pickVarName(names, FONT_BODY_REGEXES, taken);
  const headingFont = typo.fontFamily !== defaultTypo.fontFamily ? typo.fontFamily : null;
  const bodyFont = typo.fontFamilyBody !== defaultTypo.fontFamilyBody ? typo.fontFamilyBody : null;
  if (headingVar && headingFont) overrides.push(`${headingVar}: ${headingFont};`);
  if (bodyVar && bodyFont) overrides.push(`${bodyVar}: ${bodyFont};`);

  let fontsLink = '';
  const fontsUrl = typo.googleFontsUrl || (headingFont || bodyFont
    ? googleFontsUrlFrom([headingFont, bodyFont].filter(Boolean))
    : '');
  if (fontsUrl && fontsUrl !== defaultTypo.googleFontsUrl && !html.includes(fontsUrl)) {
    fontsLink = `<link rel="stylesheet" href="${fontsUrl}">`;
  }
  if (!overrides.length && !fontsLink) return '';
  return `${fontsLink}<style id="inf-theme-overrides">:root{${overrides.join('')}}</style>`;
}

async function injectHeadSnippet(html, snippet) {
  if (!snippet) return html;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${snippet}</head>`);
  return `${snippet}${html}`;
}

/* ------------------------------ handlers ------------------------------ */

/**
 * Editor bridge: lets the theme-editor drive a static-site iframe over
 * postMessage — report the page's .html siblings, reveal a section when the
 * sidebar selects it, and (while inspector mode is enabled by the editor)
 * turn link clicks into section selections instead of navigation. Inert on
 * the real storefront: nothing arrives with `__informaticEditor` there.
 */
const EDITOR_BRIDGE_SNIPPET = `<script>(function(){
if (window.__informaticSiteBridge) return; window.__informaticSiteBridge = true;
var inspector = false;
function post(m){ try { window.parent && window.parent.postMessage(Object.assign({__informaticSite:true}, m), '*'); } catch (e) {} }
function norm(s){ return String(s||'').replace(/\\s+/g,' ').trim(); }
function fileName(){ return location.pathname.split('/').pop() || 'index.html'; }
function sectionOf(el){
  var n = el;
  while (n && n !== document.body && n !== document.documentElement) {
    var tag = n.tagName ? n.tagName.toLowerCase() : '';
    if (/^(section|header|footer|main|nav|article|aside|form|ul|table)$/.test(tag)) return n;
    if (n.id && !/^(root|app|main-menu|menu)$/i.test(n.id)) return n;
    n = n.parentElement;
  }
  return null;
}
function headingOf(el){
  var h = el && el.querySelector ? el.querySelector('h1,h2,h3,h4,[class*="title"],[class*="heading"]') : null;
  return norm((h && h.textContent) || (el && el.textContent) || '').slice(0, 160);
}
var outlined = null;
function highlight(el){
  if (outlined) { outlined.style.outline=''; outlined.style.outlineOffset=''; outlined=null; }
  if (el) { el.style.outline='2px solid #005bd3'; el.style.outlineOffset='-2px';
    try { el.scrollIntoView({behavior:'smooth',block:'center'}); } catch (e) { el.scrollIntoView(); } outlined = el; }
}
function findByText(text){
  var t = norm(text).toLowerCase(); if (!t) return null;
  var cand = document.querySelectorAll('h1,h2,h3,h4,h5,[class*="title"],[class*="heading"],p,span,a,li,button,label,div');
  var best = null;
  for (var i=0;i<cand.length;i++) {
    var tc = norm(cand[i].textContent).toLowerCase(); if (!tc) continue;
    if (tc === t) { best = cand[i]; break; }
    if (!best && tc.indexOf(t) === 0 && tc.length < t.length + 60) best = cand[i];
    else if (!best && tc.indexOf(t) >= 0 && tc.length < t.length * 4 + 80) best = cand[i];
  }
  return best;
}
function collectPages(){
  var set = {}; set[fileName()] = 1;
  var links = document.querySelectorAll('a[href]');
  for (var i=0;i<links.length;i++) {
    var h = links[i].getAttribute('href') || '';
    var m = h.match(/([^\\/#?]+\\.html?)/i); if (m) set[m[1]] = 1;
  }
  return Object.keys(set);
}
window.addEventListener('message', function(ev){
  var d = ev.data || {};
  if (!d || d.__informaticEditor !== true) return;
  if (d.type === 'inspector') { inspector = !!d.enabled; if (!inspector) highlight(null); }
  else if (d.type === 'reveal') {
    var el = (d.id && document.getElementById(d.id)) ||
             (d.tag && document.getElementsByTagName(d.tag)[0]) ||
             findByText(d.text);
    highlight(el ? (sectionOf(el) || el) : null);
  }
  else if (d.type === 'list-pages') { post({type:'pages', pages:collectPages(), file:fileName()}); }
  else if (d.type === 'set-text') {
    var el2 = findByText(d.match);
    if (el2) el2.textContent = d.text;
  }
  else if (d.type === 'apply-texts') {
    (d.items || []).forEach(function(it){
      var el3 = findByText(it.match);
      if (el3) el3.textContent = it.text;
    });
  }
  else if (d.type === 'set-image') {
    var want = String(d.match || '').split('?')[0].split('/').pop();
    if (want) {
      var imgs = document.querySelectorAll('img[src]');
      for (var i = 0; i < imgs.length; i++) {
        if (String(imgs[i].src).split('?')[0].split('/').pop() === want) {
          imgs[i].src = d.src; break;
        }
      }
    }
  }
});
document.addEventListener('click', function(ev){
  if (!inspector) return;
  var t = ev.target;
  var a = t && t.closest ? t.closest('a[href]') : null;
  var sec = t && t.closest ? sectionOf(t) : null;
  if (a) { ev.preventDefault(); ev.stopPropagation(); }
  if (sec) {
    highlight(sec);
    post({type:'select', text:headingOf(sec), id:sec.id || '', tag:(sec.tagName||'').toLowerCase()});
  }
}, true);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ post({type:'ready', file:fileName()}); });
} else { post({type:'ready', file:fileName()}); }
})();</script>`;

function injectEditorBridge(html) {
  return /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, `${EDITOR_BRIDGE_SNIPPET}\n</body>`)
    : `${html}\n${EDITOR_BRIDGE_SNIPPET}`;
}

/* ------------- storefront traveller login (tour & travel themes) ------------- */

/**
 * Injects a self-contained account widget — floating sign-in button plus a
 * modal panel styled after the header account popover — that posts to the
 * public /traveller-auth endpoint. Signups land in Tour & Travel > Travellers.
 * Rendered only on travel-industry themes (ctx.packageSync); also rewires any
 * nav link that already reads "sign in / login / account".
 */
function storefrontLoginSnippet(storeId) {
  return `<script>(function(){
if (window.__informaticTravellerAuth) return;
window.__informaticTravellerAuth = true;
var STORE_ID = ${JSON.stringify(String(storeId))};
var API = '/api/storefront/' + STORE_ID + '/traveller-auth';
var LS_KEY = 'informatic-traveller:' + STORE_ID;
var ACCENT = '#FBBF24';   // codiic brand yellow
var INK = '#1a1a1a';      // text on yellow / dark text on light
var SURFACE = '#fafafa';  // panel background
var CARD = '#ffffff';     // inputs / trip cards
var LINE = '#e6e6e6';     // borders
var MUTED = '#6b7280';
var traveller = null;
try { traveller = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) {}

var css = [
'#inf-trav-fab{position:fixed;bottom:22px;right:22px;z-index:99998;display:flex;align-items:center;gap:8px;',
'border:none;border-radius:999px;background:' + ACCENT + ';color:' + INK + ';font:600 14px/1 system-ui,-apple-system,sans-serif;',
'padding:12px 18px;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.35)}',
'#inf-trav-fab:hover{background:#f59e0b}',
'#inf-trav-overlay{position:fixed;inset:0;z-index:99999;background:rgba(17,24,39,.45);backdrop-filter:blur(3px);display:none}',
'#inf-trav-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;width:380px;max-width:calc(100vw - 24px);',
'max-height:90vh;overflow:auto;background:' + SURFACE + ';border:1px solid ' + LINE + ';border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.2);display:none;',
'font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a}',
'#inf-trav-panel .inf-trav-field{width:100%;box-sizing:border-box;padding:13px 14px;border-radius:10px;border:1px solid ' + LINE + ';',
'background:' + CARD + ';font-size:15px;color:#1a1a1a;outline:none}',
'#inf-trav-panel .inf-trav-field::placeholder{color:#9ca3af}',
'#inf-trav-panel .inf-trav-field:focus{border-color:' + ACCENT + ';box-shadow:0 0 0 3px rgba(251,191,36,.15)}',
'#inf-trav-panel .inf-trav-btn{width:100%;margin-top:14px;padding:13px 16px;border-radius:10px;border:none;background:' + ACCENT + ';',
'color:' + INK + ';font-size:15px;font-weight:700;cursor:pointer}',
'#inf-trav-panel .inf-trav-btn:hover{background:#f59e0b}',
'#inf-trav-panel .inf-trav-btn:disabled{opacity:.6;cursor:wait}',
'#inf-trav-panel .inf-trav-btn-ghost{background:transparent;color:#1a1a1a;border:1px solid ' + LINE + '}',
'#inf-trav-panel .inf-trav-btn-ghost:hover{background:#f4f4f5;border-color:#d4d4d4}',
'#inf-trav-panel .inf-trav-link{color:#b45309;font-size:13px;cursor:pointer;background:none;border:none;padding:0;font-weight:600}',
'#inf-trav-panel .inf-trav-link:hover{text-decoration:underline}',
'#inf-trav-panel .inf-trav-close{border:1px solid ' + LINE + ';background:' + CARD + ';color:#6b7280;width:32px;height:32px;',
'border-radius:999px;cursor:pointer;font-size:13px;flex-shrink:0;line-height:1}',
'#inf-trav-panel .inf-trav-close:hover{color:#1a1a1a;border-color:#d4d4d4}',
'#inf-trav-panel .inf-trav-err{padding:10px 12px;border-radius:10px;background:rgba(239,68,68,.12);',
'color:#b91c1c;font-size:13px;border:1px solid rgba(239,68,68,.3)}',
'#inf-trav-panel .inf-trav-badge{flex-shrink:0;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap}',
'#inf-trav-panel .inf-trav-kind{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:' + MUTED + '}',
// Logged-in account view — full-page profile layout
'#inf-trav-panel.inf-trav-wide{top:0;right:0;bottom:0;left:0;transform:none;width:100%;height:100%;',
'max-width:none;max-height:none;border-radius:0;border:none;overflow-y:auto;',
'scrollbar-width:thin;scrollbar-color:#d4d4d4 transparent}',
'#inf-trav-panel .inf-trav-cover{position:relative;height:170px;',
'background:linear-gradient(115deg,#00896F 0%,#059669 55%,#047857 100%)}',
'#inf-trav-panel .inf-trav-cover:after{content:"";position:absolute;inset:0;',
'background:radial-gradient(240px 120px at 82% 18%,rgba(255,255,255,.35),transparent 70%),',
'radial-gradient(300px 160px at 12% 110%,rgba(0,0,0,.18),transparent 70%),',
'repeating-linear-gradient(115deg,rgba(255,255,255,.06) 0 2px,transparent 2px 28px)}',
'#inf-trav-panel .inf-trav-eyebrow{margin:14px 0 2px;font-size:11px;font-weight:700;',
'letter-spacing:.16em;text-transform:uppercase;color:#b45309}',
'#inf-trav-panel .inf-trav-cover .inf-trav-close{position:absolute;top:18px;right:18px;z-index:2;',
'border-color:rgba(0,0,0,.15);background:rgba(0,0,0,.25);color:#fff}',
'#inf-trav-panel .inf-trav-cover .inf-trav-close:hover{background:rgba(0,0,0,.45);color:#fff}',
'#inf-trav-panel .inf-trav-cover .inf-trav-outbtn{position:absolute;top:18px;right:62px;z-index:2;',
'display:flex;align-items:center;gap:7px;padding:7px 15px;border-radius:999px;',
'border:1px solid rgba(255,255,255,.28);background:rgba(0,0,0,.25);color:#fff;',
'font:600 12.5px/1 system-ui,-apple-system,sans-serif;cursor:pointer}',
'#inf-trav-panel .inf-trav-cover .inf-trav-outbtn:hover{background:rgba(0,0,0,.45)}',
'#inf-trav-panel .inf-trav-acct{max-width:1180px;margin:0 auto;padding:0 28px 56px}',
'#inf-trav-panel .inf-trav-head{padding:0 12px;text-align:center}',
'#inf-trav-panel .inf-trav-avatar{width:88px;height:88px;border-radius:999px;background:' + ACCENT + ';color:' + INK + ';',
'display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;',
'margin:-44px auto 0;border:4px solid ' + SURFACE + ';position:relative;z-index:1}',
'#inf-trav-panel .inf-trav-headname{margin:4px 0 3px;font-size:24px;font-weight:700;color:#1a1a1a;',
'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'#inf-trav-panel .inf-trav-headmail{margin:0 0 20px;font-size:14px;color:' + MUTED + ';',
'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'#inf-trav-panel .inf-trav-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;',
'max-width:640px;margin:0 auto 24px;padding-bottom:24px;border-bottom:1px solid ' + LINE + '}',
'#inf-trav-panel .inf-trav-stat{background:' + CARD + ';border:1px solid ' + LINE + ';border-radius:12px;padding:14px 8px;text-align:center}',
'#inf-trav-panel .inf-trav-stat b{display:block;font-size:22px;font-weight:800;color:#1a1a1a;line-height:1.2}',
'#inf-trav-panel .inf-trav-stat span{display:block;margin-top:3px;font-size:10.5px;font-weight:600;letter-spacing:.07em;',
'text-transform:uppercase;color:' + MUTED + '}',
'#inf-trav-panel .inf-trav-account-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,1fr);gap:18px;align-items:start}',
'@media (max-width:860px){#inf-trav-panel .inf-trav-account-grid{grid-template-columns:1fr}}',
'#inf-trav-panel .inf-trav-sec{border:1px solid ' + LINE + ';border-radius:18px;padding:20px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,.04)}',
'#inf-trav-panel .inf-trav-sechead{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}',
'#inf-trav-panel .inf-trav-sechead p{margin:0;font-size:15px;font-weight:700;color:#1a1a1a;display:flex;align-items:center;gap:8px}',
'#inf-trav-panel .inf-trav-sechead p:before{content:"";width:3px;height:16px;border-radius:2px;background:' + ACCENT + '}',
'#inf-trav-panel .inf-trav-trip{display:flex;gap:12px;align-items:flex-start;background:' + CARD + ';',
'border:1px solid ' + LINE + ';border-radius:14px;padding:14px;margin-bottom:10px}',
'#inf-trav-panel .inf-trav-trip:hover{border-color:#d4d4d4}',
'#inf-trav-panel .inf-trav-tripicon{width:40px;height:40px;border-radius:11px;flex-shrink:0;',
'display:flex;align-items:center;justify-content:center}',
'#inf-trav-panel .inf-trav-tripmain{min-width:0;flex:1}',
'#inf-trav-panel .inf-trav-triptitle{font-size:14.5px;font-weight:650;color:#1a1a1a;line-height:1.35}',
'#inf-trav-panel .inf-trav-tripmeta{margin:5px 0 0;font-size:12px;color:' + MUTED + ';',
'display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
// Booking calendar — month grid with event pills
'#inf-trav-panel .inf-trav-calhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}',
'#inf-trav-panel .inf-trav-calhead p{margin:0;font-size:15px;font-weight:700;color:#1a1a1a}',
'#inf-trav-panel .inf-trav-calnav{width:32px;height:32px;border-radius:999px;border:1px solid ' + LINE + ';',
'background:' + CARD + ';color:#1a1a1a;cursor:pointer;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center}',
'#inf-trav-panel .inf-trav-calnav:hover{border-color:' + ACCENT + ';color:' + ACCENT + '}',
'#inf-trav-panel .inf-trav-calgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}',
'#inf-trav-panel .inf-trav-caldow{text-align:center;font-size:10.5px;font-weight:700;letter-spacing:.08em;',
'color:' + MUTED + ';padding:2px 0 8px;text-transform:uppercase}',
'#inf-trav-panel .inf-trav-calcell{min-height:96px;border:1px solid #e8e8e8;border-radius:10px;padding:6px;',
'background:#fafafa;display:flex;flex-direction:column;gap:3px;overflow:hidden;transition:border-color .15s}',
'#inf-trav-panel .inf-trav-calcell:hover{border-color:#d4d4d4}',
'#inf-trav-panel .inf-trav-calempty{background:transparent;border-color:transparent}',
'#inf-trav-panel .inf-trav-calday{font-size:11.5px;font-weight:600;color:#6b7280;line-height:1;padding:2px 3px}',
'#inf-trav-panel .inf-trav-caltoday .inf-trav-calday{background:' + ACCENT + ';color:' + INK + ';',
'border-radius:999px;align-self:flex-start;min-width:19px;text-align:center}',
'#inf-trav-panel .inf-trav-calhas{border-color:rgba(251,191,36,.45)}',
'#inf-trav-panel .inf-trav-calevt{display:block;font-size:10.5px;font-weight:600;line-height:1.35;padding:3px 6px;',
'border-radius:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default}',
'#inf-trav-panel .inf-trav-calmore{font-size:9.5px;color:' + MUTED + ';padding:0 4px}'
].join('');
var style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

var overlay = document.createElement('div'); overlay.id = 'inf-trav-overlay';
var panel = document.createElement('div'); panel.id = 'inf-trav-panel';
var fab = document.createElement('button'); fab.id = 'inf-trav-fab'; fab.type = 'button';
document.body.appendChild(overlay);
document.body.appendChild(panel);
document.body.appendChild(fab);

function esc(s){ return String(s||'').replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function firstName(n){ return String(n||'').split(' ')[0] || 'Account'; }

function renderFab(){
  fab.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="' + INK + '" stroke-width="1.75"/><path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="' + INK + '" stroke-width="1.75" stroke-linecap="round"/></svg>' +
    '<span>' + (traveller ? esc(firstName(traveller.name)) : 'Sign in') + '</span>';
}

function initials(n){
  return String(n || '').trim().split(/\s+/).slice(0, 2).map(function(w){ return w[0] || ''; }).join('').toUpperCase() || 'U';
}

var TRIPS_API = '/api/storefront/' + STORE_ID + '/traveller-trips';
var STATUS_COLORS = {
  confirmed: ['rgba(34,197,94,.16)', '#15803d'], pending: ['rgba(251,191,36,.3)', '#92400e'],
  draft: ['rgba(0,0,0,.06)', '#9ca3af'], cancelled: ['rgba(239,68,68,.16)', '#b91c1c'],
  completed: ['rgba(96,165,250,.16)', '#2563eb'], no_show: ['rgba(239,68,68,.16)', '#b91c1c'],
  'new': ['rgba(96,165,250,.16)', '#2563eb'], contacted: ['rgba(56,189,248,.16)', '#0369a1'],
  qualified: ['rgba(56,189,248,.16)', '#0369a1'], quotation_sent: ['rgba(251,191,36,.3)', '#92400e'],
  converted: ['rgba(34,197,94,.16)', '#15803d'], lost: ['rgba(0,0,0,.06)', '#9ca3af'],
};

var ICONS = {
  booking: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5V8z" stroke="' + INK + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M13.5 7v2m0 4v2m0 4v2" stroke="' + INK + '" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="1 3"/></svg>',
  enquiry: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke="#2563eb" stroke-width="1.7"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5" stroke="#2563eb" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function tripIcon(kind){
  if (kind === 'booking')
    return '<div class="inf-trav-tripicon" style="background:' + ACCENT + '">' + ICONS.booking + '</div>';
  return '<div class="inf-trav-tripicon" style="background:rgba(96,165,250,.14)">' + ICONS.enquiry + '</div>';
}

function tripRow(t){
  var c = STATUS_COLORS[t.status] || ['rgba(0,0,0,.06)', '#9ca3af'];
  var meta = ['<span class="inf-trav-kind">' + (t.kind === 'booking' ? 'Booking' : 'Enquiry') + '</span>'];
  if (t.ref) meta.push(esc(t.ref));
  if (t.date) { try { meta.push(new Date(t.date).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' })); } catch(e){ meta.push(esc(t.date)); } }
  if (t.travellers) meta.push(esc(t.travellers) + ' traveller' + (t.travellers > 1 ? 's' : ''));
  return '<div class="inf-trav-trip">' + tripIcon(t.kind) +
    '<div class="inf-trav-tripmain">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<span class="inf-trav-triptitle">' + esc(t.package || (t.kind === 'booking' ? 'Booking' : 'Enquiry')) + '</span>' +
    '<span class="inf-trav-badge" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(t.statusLabel || t.status) + '</span></div>' +
    '<p class="inf-trav-tripmeta">' + meta.join('<span>·</span>') + '</p>' +
    '</div></div>';
}

function tripStats(trips){
  var bookings = 0, enquiries = 0;
  for (var i = 0; i < trips.length; i++) {
    if (trips[i].kind === 'booking') bookings++; else enquiries++;
  }
  var el = panel.querySelector('#inf-trav-stats');
  if (el) el.innerHTML =
    '<div class="inf-trav-stat"><b>' + trips.length + '</b><span>Trips</span></div>' +
    '<div class="inf-trav-stat"><b>' + bookings + '</b><span>Bookings</span></div>' +
    '<div class="inf-trav-stat"><b>' + enquiries + '</b><span>Enquiries</span></div>';
}

var tripsCache = [];
var calCursor = null;  // first-of-month Date currently displayed

function renderCalendar(){
  var box = panel.querySelector('#inf-trav-cal');
  if (!box) return;
  // Only real bookings land on the calendar (enquiries stay in the list below).
  var events = {};
  tripsCache.forEach(function(t){
    if (t.kind !== 'booking' || !t.date) return;
    var d = new Date(t.date);
    if (isNaN(d)) return;
    var key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
    (events[key] = events[key] || []).push(t);
  });
  if (!calCursor) {
    // Open on the earliest upcoming booking's month, else the current month.
    var upcoming = tripsCache
      .filter(function(t){ return t.kind === 'booking' && t.date && !isNaN(new Date(t.date)); })
      .sort(function(a, b){ return new Date(a.date) - new Date(b.date); });
    var ref = upcoming.length ? new Date(upcoming[0].date) : new Date();
    calCursor = new Date(ref.getFullYear(), ref.getMonth(), 1);
  }
  var y = calCursor.getFullYear(), m = calCursor.getMonth();
  var startDay = new Date(y, m, 1).getDay();
  var daysInMonth = new Date(y, m + 1, 0).getDate();
  var today = new Date();
  var html =
    '<div class="inf-trav-calhead">' +
    '<button type="button" class="inf-trav-calnav" id="inf-cal-prev" aria-label="Previous month">‹</button>' +
    '<p>' + new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) + '</p>' +
    '<button type="button" class="inf-trav-calnav" id="inf-cal-next" aria-label="Next month">›</button></div>' +
    '<div class="inf-trav-calgrid">' +
    ['S','M','T','W','T','F','S'].map(function(d){ return '<span class="inf-trav-caldow">' + d + '</span>'; }).join('');
  for (var i = 0; i < startDay; i++) html += '<span class="inf-trav-calcell inf-trav-calempty"></span>';
  for (var day = 1; day <= daysInMonth; day++) {
    var evs = events[y + '-' + m + '-' + day] || [];
    var isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === day;
    html += '<div class="inf-trav-calcell' + (isToday ? ' inf-trav-caltoday' : '') + (evs.length ? ' inf-trav-calhas' : '') + '">' +
      '<span class="inf-trav-calday">' + day + '</span>';
    evs.slice(0, 2).forEach(function(t){
      var c = STATUS_COLORS[t.status] || ['rgba(0,0,0,.06)', '#9ca3af'];
      var label = t.package || t.ref || 'Booking';
      html += '<span class="inf-trav-calevt" title="' + esc(label) + (t.ref ? ' · ' + esc(t.ref) : '') + '" ' +
        'style="background:' + c[0] + ';color:' + c[1] + '">' + esc(label) + '</span>';
    });
    if (evs.length > 2) html += '<span class="inf-trav-calmore">+' + (evs.length - 2) + ' more</span>';
    html += '</div>';
  }
  box.innerHTML = html + '</div>';
  box.querySelector('#inf-cal-prev').onclick = function(){ calCursor = new Date(y, m - 1, 1); renderCalendar(); };
  box.querySelector('#inf-cal-next').onclick = function(){ calCursor = new Date(y, m + 1, 1); renderCalendar(); };
}

async function loadTrips(){
  var box = panel.querySelector('#inf-trav-trips');
  if (!box) return;
  if (!traveller.sessionToken) {
    box.innerHTML = '<p style="margin:0;font-size:13px;color:' + MUTED + '">Sign in again to see your trips.</p>';
    return;
  }
  try {
    var res = await fetch(TRIPS_API + '?email=' + encodeURIComponent(traveller.email) + '&token=' + encodeURIComponent(traveller.sessionToken));
    var json = await res.json();
    if (res.status === 401) {
      box.innerHTML = '<p style="margin:0;font-size:13px;color:#b91c1c">Session expired — please sign in again.</p>';
      return;
    }
    var trips = (json && json.data && json.data.trips) || [];
    tripsCache = trips;
    tripStats(trips);
    renderCalendar();
    box.innerHTML = trips.length
      ? trips.map(tripRow).join('')
      : '<p style="margin:0;font-size:13px;color:' + MUTED + '">No trips yet — your enquiries and bookings will appear here.</p>';
  } catch (e) {
    box.innerHTML = '<p style="margin:0;font-size:13px;color:' + MUTED + '">Could not load trips.</p>';
  }
}

var mode = 'login';
function render(){
  if (traveller) {
    panel.classList.add('inf-trav-wide');
    panel.innerHTML =
      '<div class="inf-trav-cover">' +
      '<button type="button" id="inf-trav-close" class="inf-trav-close" aria-label="Close">✕</button>' +
      '<button type="button" id="inf-trav-out" class="inf-trav-outbtn">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><path d="m15 8 4 4-4 4M19 12h-9.5" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      'Sign out</button></div>' +
      '<div class="inf-trav-acct">' +
      '<div class="inf-trav-head">' +
      '<div class="inf-trav-avatar">' + esc(initials(traveller.name)) + '</div>' +
      '<p class="inf-trav-eyebrow">My account</p>' +
      '<h2 class="inf-trav-headname">' + esc(traveller.name) + '</h2>' +
      '<p class="inf-trav-headmail">' + esc(traveller.email) + '</p></div>' +
      '<div class="inf-trav-stats" id="inf-trav-stats">' +
      '<div class="inf-trav-stat"><b>—</b><span>Trips</span></div>' +
      '<div class="inf-trav-stat"><b>—</b><span>Bookings</span></div>' +
      '<div class="inf-trav-stat"><b>—</b><span>Enquiries</span></div></div>' +
      '<div class="inf-trav-account-grid">' +
      '<section class="inf-trav-sec">' +
      '<div class="inf-trav-sechead"><p>Booking calendar</p></div>' +
      '<div id="inf-trav-cal"></div></section>' +
      '<section class="inf-trav-sec">' +
      '<div class="inf-trav-sechead"><p>My trips</p>' +
      '<button type="button" id="inf-trav-refresh" class="inf-trav-link">Refresh</button></div>' +
      '<div id="inf-trav-trips"><p style="margin:0;font-size:13px;color:' + MUTED + '">Loading…</p></div></section>' +
      '</div></div>';
    panel.querySelector('#inf-trav-close').onclick = close;
    panel.querySelector('#inf-trav-refresh').onclick = loadTrips;
    panel.querySelector('#inf-trav-out').onclick = function(){ traveller=null; tripsCache=[]; calCursor=null; try{localStorage.removeItem(LS_KEY);}catch(e){} renderFab(); render(); };
    loadTrips();
    return;
  }
  panel.classList.remove('inf-trav-wide');
  var isLogin = mode === 'login';
  panel.innerHTML =
    '<div style="padding:22px 22px 20px">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px">' +
    '<h2 style="margin:0;font-size:18px;font-weight:700;line-height:1.3;color:#1a1a1a">' + (isLogin ? 'Sign in' : 'Create account') + '</h2>' +
    '<button type="button" id="inf-trav-close" class="inf-trav-close" aria-label="Close">✕</button></div>' +
    '<form id="inf-trav-form"><div style="display:grid;gap:12px">' +
    (isLogin ? '' :
      '<input class="inf-trav-field" name="name" type="text" placeholder="Full name" autocomplete="name" required/>' +
      '<input class="inf-trav-field" name="phone" type="tel" placeholder="Phone" autocomplete="tel"/>') +
    '<input class="inf-trav-field" name="email" type="email" placeholder="Email" autocomplete="email" required/>' +
    '<input class="inf-trav-field" name="password" type="password" placeholder="Password" autocomplete="' + (isLogin ? 'current-password' : 'new-password') + '" required minlength="4"/>' +
    '</div>' +
    '<div id="inf-trav-err" class="inf-trav-err" style="display:none;margin-top:12px"></div>' +
    '<button type="submit" class="inf-trav-btn">' + (isLogin ? 'Sign in' : 'Create account') + '</button>' +
    '<p style="margin:14px 0 0;text-align:center;font-size:14px;color:' + MUTED + '">' +
    (isLogin ? 'Don\\'t have an account? <button type="button" class="inf-trav-link" id="inf-trav-mode">Create account</button>'
             : 'Already have an account? <button type="button" class="inf-trav-link" id="inf-trav-mode">Sign in</button>') +
    '</p></form></div>';
  panel.querySelector('#inf-trav-close').onclick = close;
  panel.querySelector('#inf-trav-mode').onclick = function(){ mode = isLogin ? 'signup' : 'login'; render(); };
  panel.querySelector('#inf-trav-form').onsubmit = submit;
}

function open(){ overlay.style.display='block'; panel.style.display='block'; document.body.style.overflow='hidden'; render(); }
function close(){ overlay.style.display='none'; panel.style.display='none'; document.body.style.overflow=''; }
overlay.onclick = close;
fab.onclick = open;
// Other injected widgets (enquiry/booking) can open the login panel and listen
// for the auth event to continue a pending submission.
window.__informaticOpenLogin = open;

// Hook existing theme "sign in / login / account" links so they open the panel.
var links = document.querySelectorAll('a');
for (var i = 0; i < links.length; i++) {
  var txt = (links[i].textContent || '').trim();
  if (/^(sign\\s*in|log\\s*in|log\\s*on|sign\\s*up|my\\s*account|account)$/i.test(txt)) {
    (function(a){ a.addEventListener('click', function(ev){ ev.preventDefault(); open(); }); })(links[i]);
  }
}

async function submit(ev){
  ev.preventDefault();
  var f = ev.target, err = panel.querySelector('#inf-trav-err');
  var btn = f.querySelector('.inf-trav-btn');
  err.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Please wait…';
  try {
    var res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: mode,
        name: (f.name && f.name.value) || '',
        phone: (f.phone && f.phone.value) || '',
        email: f.email.value,
        password: f.password.value,
      }),
    });
    var json = await res.json().catch(function(){ return {}; });
    if (!res.ok || !json.success) throw new Error((json && json.message) || 'Sign-in failed');
    traveller = json.data.traveller;
    try { localStorage.setItem(LS_KEY, JSON.stringify(traveller)); } catch (e) {}
    renderFab(); render();
    try { document.dispatchEvent(new CustomEvent('informatic-traveller-auth')); } catch (e) {}
  } catch (e) {
    err.textContent = e.message || 'Sign-in failed';
    err.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = mode === 'login' ? 'Sign in' : 'Create account';
  }
}

renderFab();
})();</script>`;
}

function injectStorefrontLogin(html, storeId) {
  const snippet = storefrontLoginSnippet(storeId);
  return /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, `${snippet}\n</body>`)
    : `${html}\n${snippet}`;
}

/* ------------- storefront package enquiry ("Check availability") ------------- */

/**
 * Wires a theme's own booking CTA ("Check availability", "Book now", "Enquire"…)
 * to the public travel-packages enquiry endpoint. Reads the theme's traveler
 * counter and departure-date input from the button's booking container,
 * requires the user to be signed in (opens the traveller login panel first,
 * then auto-continues), resolves the package from the card/URL context, and
 * shows a confirmation with the enquiry reference.
 */
function storefrontEnquirySnippet(storeId) {
  return `<script>(function(){
if (window.__informaticEnquiry) return;
window.__informaticEnquiry = true;
var STORE_ID = ${JSON.stringify(String(storeId))};
var LS_KEY = 'informatic-traveller:' + STORE_ID;
var CTA_RE = /check availability|book now|book this|book package|reserve|enquire|enquiry|send enquiry|request (a )?(call ?back|quote)|get (a )?quote/i;

function getTraveller(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; } }

var toast = null;
function showMsg(text, ok){
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'inf-enq-msg';
    toast.style.cssText = 'position:fixed;bottom:88px;left:50%;transform:translateX(-50%);z-index:100001;' +
      'padding:12px 18px;border-radius:10px;font:500 14px/1.4 system-ui,sans-serif;' +
      'background:#ffffff;border:1px solid #e6e6e6;color:#1a1a1a;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.15);max-width:90vw;display:none';
    document.body.appendChild(toast);
  }
  toast.style.borderColor = ok ? 'rgba(34,197,94,.55)' : 'rgba(239,68,68,.55)';
  toast.style.color = ok ? '#15803d' : '#b91c1c';
  toast.textContent = text;
  toast.style.display = 'block';
  clearTimeout(toast._t);
  toast._t = setTimeout(function(){ toast.style.display = 'none'; }, 5000);
}

// The nearest ancestor that looks like the booking widget holding this CTA.
function bookingRoot(el){
  var n = el;
  for (var i = 0; i < 8 && n; i++) {
    n = n.parentElement;
    if (!n) break;
    if (n.querySelector && n.querySelector('input[type="date"], input[name*="date" i], input[id*="date" i]')) return n;
    if (/book|availab|enquiry|reserve|sidebar|aside|pricing|checkout/i.test(n.className || '')) return n;
  }
  return el.closest('form') || document.body;
}

// A number displayed between +/- stepper buttons (theme's traveler counter).
function readTravelers(root){
  var els = root.querySelectorAll('span, div, input');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var v = el.tagName === 'INPUT' ? el.value : (el.textContent || '').trim();
    if (/^\\d{1,2}$/.test(v) && el.children.length === 0) {
      var p = el.parentElement;
      if (p && p.querySelectorAll('button').length >= 2) return parseInt(v, 10);
    }
  }
  var inp = root.querySelector(
    'input[type="number"], input[name*="traveller" i], input[name*="traveler" i], input[name*="pax" i], ' +
    'input[name*="guest" i], input[name*="adult" i], input[name*="passenger" i], ' +
    'select[name*="traveller" i], select[name*="traveler" i], select[name*="pax" i], ' +
    'select[name*="guest" i], select[name*="adult" i], select[name*="passenger" i]'
  );
  if (inp && inp.value) return Math.max(1, parseInt(inp.value, 10) || 1);
  return null;
}

function readDateInput(root){
  return root.querySelector('input[type="date"], input[name*="date" i], input[id*="date" i], input[placeholder*="date" i]');
}

function packageIdFor(btn){
  var card = btn.closest && btn.closest('[data-pkg-id]');
  if (card) return card.getAttribute('data-pkg-id');
  try {
    var id = new URLSearchParams(location.search).get('id') || new URLSearchParams(location.search).get('pkg');
    if (id) return id;
  } catch (e) {}
  try {
    var s = JSON.parse(sessionStorage.getItem('traveloraSelectedPackage') || 'null');
    if (s && s.id) return s.id;
  } catch (e) {}
  var el = document.querySelector('[data-pkg-id]');
  if (el) return el.getAttribute('data-pkg-id');
  if (window.TRAVELORA_PACKAGES && window.TRAVELORA_PACKAGES[0]) return window.TRAVELORA_PACKAGES[0].id;
  return '';
}

async function submit(btn){
  var root = bookingRoot(btn);
  var dateInput = readDateInput(root);
  if (dateInput && !dateInput.value) {
    dateInput.style.outline = '2px solid #dc2626';
    showMsg('Please select a departure date first', false);
    dateInput.focus();
    setTimeout(function(){ dateInput.style.outline = ''; }, 3000);
    return;
  }
  var pkgId = packageIdFor(btn);
  if (!pkgId) { showMsg('Could not determine the package for this enquiry', false); return; }

  var t = getTraveller();
  if (!t) {
    showMsg('Sign in to send your enquiry', false);
    if (window.__informaticOpenLogin) {
      window.__informaticOpenLogin();
      var once = function(){
        document.removeEventListener('informatic-traveller-auth', once);
        setTimeout(function(){ submit(btn); }, 300);
      };
      document.addEventListener('informatic-traveller-auth', once);
    }
    return;
  }

  var travelers = readTravelers(root);
  var origText = btn.textContent;
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    var res = await fetch('/api/storefront/' + STORE_ID + '/travel-packages/' + encodeURIComponent(pkgId) + '/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: t.name,
        email: t.email,
        phone: t.phone || '',
        travellers: travelers || 1,
        travelDate: dateInput ? dateInput.value : undefined,
        message: '',
      }),
    });
    var json = await res.json().catch(function(){ return {}; });
    if (!res.ok || !json.success) throw new Error((json && json.message) || 'Failed to send enquiry');
    var ref = (json.data && json.data.enquiryRef) || '';
    showMsg('Enquiry sent' + (ref ? ' — ' + ref : '') + '. Our travel team will contact you shortly.', true);
  } catch (e) {
    showMsg(e.message || 'Failed to send enquiry', false);
  } finally {
    btn.disabled = false; btn.textContent = origText;
  }
}

document.addEventListener('click', function(ev){
  var el = ev.target && ev.target.closest ? ev.target.closest('button, a') : null;
  if (!el) return;
  if (el.closest('#inf-trav-panel, #inf-trav-fab, #inf-enq-msg')) return;
  var txt = (el.textContent || '').trim();
  if (txt.length > 48 || !CTA_RE.test(txt)) return;
  ev.preventDefault();
  ev.stopPropagation();
  submit(el);
}, true);
})();</script>`;
}

function injectStorefrontEnquiry(html, storeId) {
  const snippet = storefrontEnquirySnippet(storeId);
  return /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, `${snippet}\n</body>`)
    : `${html}\n${snippet}`;
}

const sendSiteHtml = (res, html) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.send(html);
};

/**
 * GET /api/storefront/:storeId/theme-site
 * Serves the applied uploaded theme's original index.html — the storefront
 * renders the real uploaded design (its own CSS/JS/routing) in an iframe.
 */
const siteBase = (req) =>
  `/api/storefront/${req.params.storeId}/theme-site/${
    req.params.themeId ? `${req.params.themeId}/` : ''
  }`;

const getStorefrontThemeSite = async (req, res, next) => {
  try {
    const { storeId, themeId } = req.params;
    const ctx = await resolveSiteContext(storeId, themeId);
    if (ctx === 'passthrough') return next();
    if (!ctx) {
      return res.status(404).json({ success: false, message: 'No static theme site for this store' });
    }
    const upstream = await codiicClient().get(
      `/informatic-themes/file/${ctx.themeId}/theme/index.html`,
      { responseType: 'text' }
    );
    const baseHref = siteBase(req);
    let withBase = injectHtmlBaseHref(upstream.data, baseHref);
    const records = ctx.packageSync
      ? await fetchStoreLivePackages(ctx.store).catch(() => null)
      : null;
    withBase = neutralizeDemoFilters(withBase, records);
    withBase = injectLivePackageCards(withBase, records, requestOrigin(req));
    const saved = await readSavedConfig(ctx.storeId, ctx.themeId).catch(() => null);
    withBase = applyContentOverrides(withBase, collectContentOverrides(ctx.defaultConfig, saved));
    const overrides = await buildConfigOverrides(ctx, withBase, saved);
    let out = injectEditorBridge(await injectHeadSnippet(withBase, overrides));
    if (ctx.packageSync) { out = injectStorefrontLogin(out, ctx.storeId); out = injectStorefrontEnquiry(out, ctx.storeId); }
    return sendSiteHtml(res, out);
  } catch (error) {
    const status = error.response?.status;
    return res.status(status && status < 500 ? status : error.statusCode || 500).json({
      success: false,
      message: status === 404 ? 'Theme site index not found' : error.message,
    });
  }
};

/**
 * GET /api/storefront/:storeId/theme-site/*path
 * Streams the theme's original files. `.html` gets the same base injection;
 * `*-data.js` files get live store records injected so the theme's own cards
 * render real packages in the original design.
 */
const getStorefrontThemeSiteFile = async (req, res, next) => {
  try {
    const { storeId, themeId } = req.params;
    const rawPath = req.params.path;
    const rel = (Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || req.params[0] || ''))
      .replace(/^\/+/, '')
      .replace(/\\/g, '/');
    if (!rel || rel.split('/').includes('..')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const ctx = await resolveSiteContext(storeId, themeId);
    if (ctx === 'passthrough') return next();
    if (!ctx) {
      return res.status(404).json({ success: false, message: 'No static theme site for this store' });
    }

    const wantsText = /\.(html?|js)$/i.test(rel);
    const upstream = await codiicClient().get(
      `/informatic-themes/file/${ctx.themeId}/theme/${rel.split('/').map(encodeURIComponent).join('/')}`,
      { responseType: wantsText ? 'text' : 'stream' }
    );

    if (/\.html?$/i.test(rel)) {
      const baseHref = siteBase(req);
      let withBase = injectHtmlBaseHref(upstream.data, baseHref);
      const records = ctx.packageSync
        ? await fetchStoreLivePackages(ctx.store).catch(() => null)
        : null;
      withBase = neutralizeDemoFilters(withBase, records);
      const detailRec = detailPageRecord(records, req.query, rel);
      if (detailRec) withBase = mapCardToRecord(withBase, detailRec, requestOrigin(req));
      withBase = injectLivePackageCards(withBase, records, requestOrigin(req));
      const saved = await readSavedConfig(ctx.storeId, ctx.themeId).catch(() => null);
      withBase = applyContentOverrides(withBase, collectContentOverrides(ctx.defaultConfig, saved));
      const overrides = await buildConfigOverrides(ctx, withBase, saved);
      let out = injectEditorBridge(await injectHeadSnippet(withBase, overrides));
      if (ctx.packageSync) { out = injectStorefrontLogin(out, ctx.storeId); out = injectStorefrontEnquiry(out, ctx.storeId); }
      return sendSiteHtml(res, out);
    }

    if (/\.js$/i.test(rel)) {
      let body = upstream.data;
      const records = ctx.packageSync
        ? await fetchStoreLivePackages(ctx.store).catch(() => null)
        : null;
      const rewritten = rewriteDataJs(body, records, requestOrigin(req));
      if (rewritten) body = rewritten;
      if (records && records.length) {
        body = patchBudgetConstants(body, liveBudgetBounds(records));
      }
      res.setHeader('Content-Type', upstream.headers['content-type'] || 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(body);
    }

    if (upstream.headers['content-type']) {
      res.setHeader('Content-Type', upstream.headers['content-type']);
    }
    if (upstream.headers['content-length']) {
      res.setHeader('Content-Length', upstream.headers['content-length']);
    }
    // Theme-scoped URLs make theme switches cache-safe; cap anyway so in-place
    // theme patches propagate within minutes.
    res.setHeader('Cache-Control', 'public, max-age=300');
    // Destroy the upstream stream if the client disconnects — otherwise the
    // socket leaks and eventually stalls the outbound connection pool.
    res.on('close', () => {
      if (!res.writableEnded) upstream.data.destroy();
    });
    upstream.data.on('error', () => {
      if (!res.writableEnded) res.end();
    });
    upstream.data.pipe(res);
  } catch (error) {
    const status = error.response?.status;
    return res.status(status && status < 500 ? status : error.statusCode || 500).json({
      success: false,
      message: status === 404 ? 'File not found' : error.message,
    });
  }
};

module.exports = {
  getStorefrontThemeSite,
  getStorefrontThemeSiteFile,
};
