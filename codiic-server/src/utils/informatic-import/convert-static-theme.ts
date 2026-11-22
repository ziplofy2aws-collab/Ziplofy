/**
 * Static HTML → Informatic theme-pack converter.
 *
 * Parses a pre-built static site (index.html + assets) and produces the
 * editor-compatible pack: theme.schema.json / theme.default-config.json /
 * theme.manifest.json / theme.css / theme.js.
 *
 * Rendering still happens through the shared Informatic contract bundle —
 * the converter maps each HTML block onto the closest contract section type
 * (hero, features-grid, stats-band, split-feature, testimonials,
 * media-gallery, cta-band, rich-text) and lifts text/image/color values into
 * config so they are editable in the Theme Editor.
 */
import fs from 'fs';
import path from 'path';
import {
  LiteNode,
  byTag,
  classOrIdMatches,
  classTokens,
  descriptor,
  find,
  findAll,
  normalizedText,
  parseHtml,
  textContent,
} from './html-lite-parser';
import skeletonSchema from './skeleton/theme.schema.json';
import skeletonConfig from './skeleton/theme.default-config.json';
import skeletonManifest from './skeleton/theme.manifest.json';

export interface ImportedThemeFile {
  /** Path relative to the theme content root (dir containing index.html). */
  relativePath: string;
  /** Absolute path on disk. */
  absolutePath: string;
}

export interface ConvertedInformaticPack {
  schemaJson: string;
  defaultConfigJson: string;
  manifestJson: string;
  themeJs: string;
  themeCss: string;
  /** Theme-file relative path chosen as thumbnail, if any. */
  thumbnailRelativePath: string | null;
  warnings: string[];
  /** Human-readable summary of what was mapped, for logs/UI. */
  report: { template: string; sections: { id: string; type: string; label: string }[] }[];
}

interface EditorFieldDef {
  path: string;
  type: string;
  label: string;
  group?: string;
  sidebar?: boolean;
  widget?: string;
}

interface ConvertedSection {
  id: string;
  type: string;
  label: string;
  settings: Record<string, unknown>;
  blocks: Record<string, { type: string; settings: Record<string, unknown> }>;
  blockOrder: string[];
  blockFieldDefs: Record<string, EditorFieldDef[]>;
}

const MAX_BLOCKS_PER_SECTION = 12;

/* ---------------------------------------------------------------- helpers */

type AssetUrlFn = (relativePath: string) => string;

function humanize(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function slugifyId(base: string, used: Set<string>): string {
  let id =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'section';
  let n = 2;
  while (used.has(id)) id = `${id}_${n++}`;
  used.add(id);
  return id;
}

function firstMatch(nodes: LiteNode[], re: RegExp): LiteNode | null {
  return nodes.find((n) => classOrIdMatches(n, re)) ?? null;
}

function firstImgSrc(node: LiteNode, assetUrl: AssetUrlFn): string {
  const img = find(node, byTag('img'));
  const src = img?.attrs.src || img?.attrs['data-src'] || '';
  return src ? assetUrl(src) : '';
}

function headingText(node: LiteNode, tags: string[] = ['h1', 'h2', 'h3']): string {
  for (const t of tags) {
    const el = find(node, byTag(t));
    const txt = normalizedText(el);
    if (txt) return txt;
  }
  return '';
}

function firstParagraphText(node: LiteNode): string {
  const p = find(node, byTag('p'));
  return normalizedText(p);
}

function linkItems(node: LiteNode): { label: string; url: string }[] {
  return findAll(node, byTag('a'))
    .map((a) => ({ label: normalizedText(a), url: (a.attrs.href || '').trim() }))
    .filter((l) => l.label || l.url);
}

/** Eyebrow / section-label / tagline — a short styled span before the heading. */
function eyebrowText(node: LiteNode): string {
  const el = firstMatch(findAll(node, (n) => ['span', 'p', 'div'].includes(n.tag)), /label|eyebrow|tagline|overline|kicker|badge/i);
  const txt = normalizedText(el);
  return txt && txt.length < 120 ? txt : '';
}

function buttonLikeLinks(node: LiteNode): { label: string; url: string }[] {
  const links = findAll(node, (n) => n.tag === 'a' && (classOrIdMatches(n, /btn|button|cta/i) || Boolean(find(n, byTag('button')))));
  return links
    .map((a) => ({ label: normalizedText(a), url: (a.attrs.href || '').trim() }))
    .filter((l) => l.label);
}

function primaryButtons(node: LiteNode): { label: string; url: string }[] {
  const btns = buttonLikeLinks(node);
  if (btns.length >= 2) return btns;
  // Fill remaining slots from any labeled link (href="#" is fine — editable).
  const extras = linkItems(node).filter((l) => l.label && !btns.some((b) => b.label === l.label));
  return [...btns, ...extras].slice(0, 2);
}

/**
 * Repeated sibling cards: same tag with similar class signature, each carrying
 * a heading or an image. Used for services / doctors / features / gallery.
 */
function cardNodes(node: LiteNode): LiteNode[] {
  const containers = findAll(
    node,
    (n) => ['div', 'ul', 'section'].includes(n.tag) && n.children.length >= 2
  );
  let best: LiteNode[] = [];
  for (const c of containers) {
    const groups = new Map<string, LiteNode[]>();
    for (const child of c.children) {
      if (child.tag === '#text') continue;
      const key = `${child.tag}|${classTokensSignature(child)}`;
      groups.set(key, [...(groups.get(key) ?? []), child]);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      const hasContent = group.filter((g) => find(g, byTag('img')) || headingText(g)).length;
      if (hasContent >= 2 && group.length > best.length) best = group;
    }
  }
  if (best.length) return best.slice(0, MAX_BLOCKS_PER_SECTION);
  // Fallback: top-level articles / list items anywhere in the block.
  const arts = findAll(node, (n) => ['article', 'li'].includes(n.tag));
  return arts.slice(0, MAX_BLOCKS_PER_SECTION);
}

function classTokensSignature(node: LiteNode): string {
  return classTokens(node).slice(0, 3).join('.');
}

/* ------------------------------------------------------- classification */

type SectionType =
  | 'hero' | 'stats-band' | 'features-grid' | 'split-feature'
  | 'testimonials' | 'media-gallery' | 'cta-band' | 'contact'
  | 'faq' | 'pricing' | 'logo-cloud' | 'lead-gen-form' | 'rich-text';

function classifyBlock(node: LiteNode, index: number): SectionType {
  const scores: Partial<Record<SectionType, number>> = {};
  const bump = (t: SectionType, n: number) => (scores[t] = (scores[t] ?? 0) + n);

  const imgCount = findAll(node, byTag('img')).length;
  const cards = cardNodes(node);
  const hasH1 = Boolean(find(node, byTag('h1')));
  const hasForm = Boolean(find(node, byTag('form')));
  const linkCount = findAll(node, byTag('a')).length;
  const textLen = normalizedText(node).length;

  if (index === 0 && hasH1) bump('hero', 4);
  if (hasH1) bump('hero', 2);
  if (classOrIdMatches(node, /hero|masthead|jumbotron|slider|banner-main/i)) bump('hero', 4);
  if (classOrIdMatches(node, /^cta$|cta|call-to-action|get-started|book/i)) bump('cta-band', 4);
  if (classOrIdMatches(node, /stat|counter|metric|number|achievement|milestone/i)) bump('stats-band', 5);
  if (classOrIdMatches(node, /testimonial|review|quote|feedback/i)) bump('testimonials', 5);
  if (find(node, (n) => n.tag === 'blockquote' || classOrIdMatches(n, /quote|testimonial/))) bump('testimonials', 2);
  if (classOrIdMatches(node, /gallery|portfolio|photo|our-work|showcase/i)) bump('media-gallery', 5);
  if (classOrIdMatches(node, /service|feature|benefit|why-?us|capabilit|doctor|team|staff|member|insight|specialt|departmen|solution|amenit|facilit/i)) bump('features-grid', 4);
  if (classOrIdMatches(node, /about|story|intro|who-?we|welcome|mission|vision/i)) bump('split-feature', 4);
  if (classOrIdMatches(node, /contact|get-?in-?touch|reach/i)) bump('contact', 5);
  if (classOrIdMatches(node, /faq|accordion|question/i)) bump('faq', 5);
  if (classOrIdMatches(node, /pricing|price|plan|package/i)) bump('pricing', 5);
  if (classOrIdMatches(node, /partner|client|logo|brand|trusted/i)) bump('logo-cloud', 3);
  if (classOrIdMatches(node, /subscribe|newsletter|lead|signup/i)) bump('lead-gen-form', 3);

  // Structural signals.
  if (cards.length >= 3 && imgCount >= 2) bump('features-grid', 3);
  if (cards.length >= 2) bump('features-grid', 1);
  if (imgCount >= 3 && textLen < 1500) bump('media-gallery', 2);
  if (hasForm) bump('contact', 2);
  if (index === 0) bump('hero', 1);
  if (imgCount === 1 && !cards.length && find(node, byTag('h2'))) bump('split-feature', 2);
  if (textLen < 220 && linkCount >= 1 && imgCount === 0) bump('cta-band', 3);

  // Stats pattern: several children each with a prominent number.
  const statLike = findAll(node, (n) =>
    /^\d+[\d,.]*\s*[%+kKmM]{0,3}$/.test(normalizedText(n)) && normalizedText(n).length <= 8
  ).length;
  if (statLike >= 3) bump('stats-band', 5);

  let best: SectionType = 'rich-text';
  let bestScore = 3; // rich-text needs to be beaten
  for (const [type, score] of Object.entries(scores) as [SectionType, number][]) {
    if (score > bestScore) {
      best = type;
      bestScore = score;
    }
  }
  return best;
}

/* ------------------------------------------------- per-type extraction */

/** Subheading — prefer lede/sub-styled text; skip eyebrow/badge/button paragraphs. */
function heroSubheading(node: LiteNode): string {
  const preferred = firstMatch(findAll(node, byTag('p')), /sub|lede|lead|text|desc|summary/i);
  const txt = normalizedText(preferred);
  if (txt) return txt;
  const p = findAll(node, byTag('p')).find(
    (n) => !classOrIdMatches(n, /label|eyebrow|tagline|overline|kicker|badge|btn|button/i)
  );
  return normalizedText(p);
}

/**
 * Background-style hero — an image meant to cover the section (`.hero__bg`,
 * `*-bg-image`, `background` classes) or an inline `background-image`, vs a
 * side-card image. Controls the contract's hero `variant`.
 */
function heroVariant(node: LiteNode): 'background' | 'split' {
  const imgs = findAll(node, byTag('img'));
  const bgImg = imgs.find((im) =>
    /(?:^|[\s_-])bg(?:[\s_-]|$)|__bg|background|backdrop|cover/i.test(
      `${im.attrs.class || ''} ${im.attrs.id || ''}`
    )
  );
  if (bgImg) return 'background';
  const bgDiv = find(node, (n) => /background(-image)?\s*:[^;]*url\(/i.test(n.attrs.style || ''));
  return bgDiv ? 'background' : 'split';
}

function extractHero(node: LiteNode, assetUrl: AssetUrlFn): ConvertedSection['settings'] {
  const btns = primaryButtons(node);
  const settings: Record<string, unknown> = {
    variant: heroVariant(node),
    eyebrow: eyebrowText(node),
    heading: headingText(node, ['h1', 'h2']),
    subheading: heroSubheading(node),
    primaryLabel: btns[0]?.label ?? '',
    primaryUrl: sanitizeUrl(btns[0]?.url),
    secondaryLabel: btns[1]?.label ?? '',
    secondaryUrl: sanitizeUrl(btns[1]?.url),
    mediaImageUrl: firstImgSrc(node, assetUrl),
  };
  return settings;
}

function extractStatsBand(node: LiteNode): { settings: Record<string, unknown>; blocks: ConvertedSection['blocks']; order: string[] } {
  const settings: Record<string, unknown> = { heading: headingText(node) };
  const blocks: ConvertedSection['blocks'] = {};
  const order: string[] = [];

  // Stat = a small element containing a numeric value + a label.
  const candidates = findAll(node, (n) => {
    if (!['div', 'li', 'article'].includes(n.tag)) return false;
    const txt = normalizedText(n);
    return /\d/.test(txt) && txt.length < 80;
  });
  const items = candidates
    .filter((c) => !candidates.some((o) => o !== c && isDescendant(o, c)))
    .slice(0, 8);

  items.forEach((item, i) => {
    const full = normalizedText(item);
    const valueNode = find(item, (n) =>
      /^\d+[\d,.]*\s*[%+kKmM]{0,3}$/.test(normalizedText(n)) && normalizedText(n).length <= 8
    );
    const value = normalizedText(valueNode);
    const label = full.replace(value, '').replace(/\s+/g, ' ').trim();
    const id = `s${i + 1}`;
    blocks[id] = { type: 'stat-item', settings: { value, label } };
    order.push(id);
  });
  return { settings, blocks, order };
}

function isDescendant(node: LiteNode, maybeAncestor: LiteNode): boolean {
  let cur = node.parent;
  while (cur) {
    if (cur === maybeAncestor) return true;
    cur = cur.parent;
  }
  return false;
}

function extractCardBlocks(
  node: LiteNode,
  assetUrl: AssetUrlFn,
  blockType: 'feature-item' | 'gallery-item' | 'testimonial' | 'logo-item'
): { blocks: ConvertedSection['blocks']; order: string[] } {
  const blocks: ConvertedSection['blocks'] = {};
  const order: string[] = [];
  const prefix = blockType === 'feature-item' ? 'f' : blockType === 'gallery-item' ? 'g' : blockType === 'testimonial' ? 't' : 'l';

  cardNodes(node).forEach((card, i) => {
    const id = `${prefix}${i + 1}`;
    let settings: Record<string, unknown>;
    if (blockType === 'feature-item') {
      const title = headingText(card, ['h3', 'h4', 'h5', 'h2', 'strong', 'span']);
      // Body: prefer <p>; otherwise remaining card text minus the title.
      let body = firstParagraphText(card);
      if (!body) {
        const rest = normalizedText(card).replace(title, '').replace(/\s+/g, ' ').trim();
        body = rest.slice(0, 220);
      }
      settings = { title, body, icon: '', mediaImageUrl: firstImgSrc(card, assetUrl) };
    } else if (blockType === 'gallery-item') {
      settings = {
        title: headingText(card, ['h3', 'h4', 'h5', 'figcaption', 'strong']),
        caption: firstParagraphText(card),
        mediaImageUrl: firstImgSrc(card, assetUrl),
      };
    } else if (blockType === 'testimonial') {
      const quote =
        normalizedText(find(card, (n) => n.tag === 'blockquote' || classOrIdMatches(n, /quote|t-text|review-text/i))) ||
        firstParagraphText(card);
      const name =
        normalizedText(find(card, (n) => classOrIdMatches(n, /name|author|t-name/i))) ||
        headingText(card, ['h4', 'h5', 'strong', 'cite']);
      const role = normalizedText(find(card, (n) => classOrIdMatches(n, /role|designation|title|t-role/i)));
      settings = { quote, name, role, avatarImageUrl: firstImgSrc(card, assetUrl) };
    } else {
      settings = { name: headingText(card) || normalizedText(card).slice(0, 60) };
    }
    blocks[id] = { type: blockType, settings };
    order.push(id);
  });
  return { blocks, order };
}

function extractSplitFeature(node: LiteNode, assetUrl: AssetUrlFn): ConvertedSection['settings'] {
  const points = findAll(node, byTag('li'))
    .map((li) => normalizedText(li))
    .filter(Boolean)
    .slice(0, 3);
  return {
    eyebrow: eyebrowText(node),
    heading: headingText(node),
    body: firstParagraphText(node),
    point1: points[0] ?? '',
    point2: points[1] ?? '',
    point3: points[2] ?? '',
    mediaImageUrl: firstImgSrc(node, assetUrl),
  };
}

function extractCta(node: LiteNode): ConvertedSection['settings'] {
  const btns = primaryButtons(node);
  return {
    eyebrow: eyebrowText(node),
    heading: headingText(node),
    subheading: firstParagraphText(node),
    primaryLabel: btns[0]?.label ?? '',
    primaryUrl: sanitizeUrl(btns[0]?.url),
    secondaryLabel: btns[1]?.label ?? '',
    secondaryUrl: sanitizeUrl(btns[1]?.url),
  };
}

function extractRichText(node: LiteNode): ConvertedSection['settings'] {
  const heading = headingText(node);
  // Body = all text minus the heading, capped to keep the blob usable.
  const body = normalizedText(node)
    .replace(heading, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000);
  return { heading, body };
}

function sanitizeUrl(url: string | undefined): string {
  const u = (url || '').trim();
  if (!u || u === '#') return '';
  if (/^javascript:/i.test(u)) return '';
  return u;
}

/* -------------------------------------------------- settings fields gen */

function fieldDefsFor(type: SectionType, basePath: string, keys: string[]): EditorFieldDef[] {
  const widgetFor = (key: string): { type: string; widget: string; group: string } => {
    if (/color/i.test(key)) return { type: 'color', widget: 'color', group: 'General' };
    if (/imageurl|image|avatar|media/i.test(key)) return { type: 'text', widget: 'image', group: 'Content' };
    if (/^primaryurl|secondaryurl|url|link/i.test(key)) return { type: 'text', widget: 'url', group: 'Content' };
    if (/cta|button/i.test(key)) return { type: 'text', widget: 'button', group: 'Content' };
    if (/body|subheading|description|quote|blurb/i.test(key)) return { type: 'text', widget: 'styled-text', group: 'Content' };
    return { type: 'text', widget: 'styled-text', group: 'Content' };
  };
  return keys.map((key) => {
    const meta = widgetFor(key);
    return {
      path: `${basePath}.settings.${key}`,
      type: meta.type,
      label: humanize(key),
      group: meta.group,
      sidebar: true,
      widget: meta.widget,
    };
  });
}

const BLOCK_FIELD_KEYS: Record<string, string[]> = {
  'feature-item': ['title', 'body', 'icon', 'mediaImageUrl'],
  'stat-item': ['value', 'label'],
  testimonial: ['quote', 'name', 'role', 'avatarImageUrl'],
  'gallery-item': ['title', 'caption', 'mediaImageUrl'],
  'logo-item': ['name'],
  'faq-item': ['question', 'answer'],
  'pricing-plan': ['name', 'price', 'features', 'ctaLabel', 'ctaUrl'],
};

/* ------------------------------------------------------------ css parse */

function extractCssVariables(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const rootMatch = /:root\s*\{([\s\S]*?)\}/.exec(css);
  const scope = rootMatch ? rootMatch[1] : '';
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(scope))) vars[m[1].toLowerCase()] = m[2].trim();
  return vars;
}

function pickColorVar(vars: Record<string, string>, patterns: RegExp[]): string {
  for (const re of patterns) {
    for (const [name, value] of Object.entries(vars)) {
      if (re.test(name) && /^#|^rgb|^hsl/.test(value)) return value;
    }
  }
  return '';
}

function pickFontVar(vars: Record<string, string>, patterns: RegExp[]): string {
  for (const re of patterns) {
    for (const [name, value] of Object.entries(vars)) {
      // Keep the full stack verbatim ('Playfair Display', serif) — it is a
      // valid font-family value as-is.
      if (re.test(name) && /[a-z]/i.test(value)) return value;
    }
  }
  return '';
}

/* ------------------------------------------------------- block → section */

function convertBlock(
  node: LiteNode,
  type: SectionType,
  templateId: string,
  usedIds: Set<string>,
  assetUrl: AssetUrlFn,
  warnings: string[]
): ConvertedSection {
  let settings: Record<string, unknown> = {};
  let blocks: ConvertedSection['blocks'] = {};
  let blockOrder: string[] = [];
  let label = humanize(type.replace(/-/g, ' '));

  switch (type) {
    case 'hero':
      settings = extractHero(node, assetUrl);
      label = 'Hero';
      break;
    case 'stats-band': {
      const r = extractStatsBand(node);
      settings = r.settings;
      blocks = r.blocks;
      blockOrder = r.order;
      label = 'Stats band';
      if (!blockOrder.length) warnings.push(`stats-band: no stat items detected in ${descriptor(node)}`);
      break;
    }
    case 'features-grid': {
      settings = {
        eyebrow: eyebrowText(node),
        heading: headingText(node),
        subheading: firstParagraphText(node),
      };
      const r = extractCardBlocks(node, assetUrl, 'feature-item');
      blocks = r.blocks;
      blockOrder = r.order;
      label = 'Features grid';
      if (!blockOrder.length) warnings.push(`features-grid: no cards detected in ${descriptor(node)}`);
      break;
    }
    case 'split-feature':
      settings = extractSplitFeature(node, assetUrl);
      label = 'Image with text';
      break;
    case 'testimonials': {
      settings = {
        eyebrow: eyebrowText(node),
        heading: headingText(node),
        subheading: firstParagraphText(node),
      };
      const r = extractCardBlocks(node, assetUrl, 'testimonial');
      blocks = r.blocks;
      blockOrder = r.order;
      label = 'Testimonials';
      if (!blockOrder.length) warnings.push(`testimonials: no testimonial cards detected in ${descriptor(node)}`);
      break;
    }
    case 'media-gallery': {
      settings = {
        eyebrow: eyebrowText(node),
        heading: headingText(node),
        subheading: firstParagraphText(node),
      };
      const r = extractCardBlocks(node, assetUrl, 'gallery-item');
      blocks = r.blocks;
      blockOrder = r.order;
      label = 'Media gallery';
      break;
    }
    case 'logo-cloud': {
      settings = { eyebrow: eyebrowText(node) };
      const r = extractCardBlocks(node, assetUrl, 'logo-item');
      blocks = r.blocks;
      blockOrder = r.order;
      label = 'Logo cloud';
      break;
    }
    case 'cta-band':
      settings = extractCta(node);
      label = 'Call to action';
      break;
    case 'contact':
      settings = extractRichText(node);
      label = 'Contact';
      break;
    case 'faq': {
      settings = extractRichText(node);
      // FAQ items live as blocks when detectable.
      const items = findAll(node, (n) => ['details', 'li', 'div'].includes(n.tag) && classOrIdMatches(n, /faq|question|accordion|item/i))
        .slice(0, MAX_BLOCKS_PER_SECTION);
      items.forEach((item, i) => {
        const q = headingText(item, ['h3', 'h4', 'h5', 'summary', 'strong']) || normalizedText(item).split('?')[0] + '?';
        const a = firstParagraphText(item);
        const id = `q${i + 1}`;
        blocks[id] = { type: 'faq-item', settings: { question: q.slice(0, 160), answer: a } };
        blockOrder.push(id);
      });
      label = 'FAQ';
      break;
    }
    case 'pricing': {
      settings = {
        eyebrow: eyebrowText(node),
        heading: headingText(node),
        subheading: firstParagraphText(node),
      };
      const r = extractCardBlocks(node, assetUrl, 'feature-item');
      // pricing blocks: map cards → pricing-plan-ish feature items for editability.
      blocks = r.blocks;
      blockOrder = r.order;
      label = 'Pricing';
      break;
    }
    case 'lead-gen-form':
    case 'rich-text':
    default:
      settings = extractRichText(node);
      label = 'Rich text';
      break;
  }

  // Section id: prefer the HTML element's own class name for recognizability,
  // skipping generic wrapper classes.
  const GENERIC = new Set(['container', 'wrapper', 'row', 'grid', 'inner', 'content', 'section', 'col', 'main']);
  const clsBase = (
    classTokens(node).find((c) => !GENERIC.has(c)) ||
    node.attrs.id ||
    type
  ).replace(/[^a-z0-9]+/gi, '_');
  const id = slugifyId(clsBase, usedIds);

  // Always expose colors so customers can restyle the section.
  settings.backgroundColor = settings.backgroundColor ?? '';
  settings.textColor = settings.textColor ?? '';

  return {
    id,
    type,
    label,
    settings,
    blocks,
    blockOrder,
    blockFieldDefs: {},
  };
}

function schemaSectionFor(sec: ConvertedSection, templateId: string): Record<string, unknown> {
  const basePath = `templates.${templateId}.sections.${sec.id}`;
  const settingKeys = Object.keys(sec.settings);
  const settingsFields = fieldDefsFor(sec.type as SectionType, basePath, settingKeys);

  const blocks = Object.entries(sec.blocks).map(([blockId, block], idx) => {
    const keys = BLOCK_FIELD_KEYS[block.type] ?? Object.keys(block.settings);
    return {
      id: blockId,
      label: `${humanize(block.type.replace(/-/g, ' '))} ${idx + 1}`,
      settingsFields: keys.map((key) => {
        const defs = fieldDefsFor(sec.type as SectionType, `${basePath}.blocks.${blockId}`, [key]);
        return defs[0];
      }),
    };
  });

  return {
    id: sec.id,
    type: sec.type,
    label: sec.label,
    settingsFields,
    ...(blocks.length ? { blocks } : {}),
  };
}

/* ------------------------------------------------- top-level extraction */

const TOP_LEVEL_TAGS = new Set([
  'header', 'footer', 'section', 'main', 'nav', 'aside', 'article', 'div', 'form', 'ul',
]);

const PAGE_FILE_TO_TEMPLATE: Record<string, string> = {
  index: 'index',
  home: 'index',
  about: 'about',
  features: 'features',
  services: 'features',
  destinations: 'features',
  experiences: 'features',
  gallery: 'features',
  pricing: 'pricing',
  plans: 'pricing',
  packages: 'pricing',
  tours: 'pricing',
  contact: 'contact',
  faq: 'faq',
  blog: 'blog_list',
  '404': '404',
  search: 'search',
};

/** Informatic storefront route for each template id (mirrors InformaticStorefront routes). */
const TEMPLATE_TO_PATH: Record<string, string> = {
  index: '/',
  about: '/about',
  features: '/features',
  pricing: '/pricing',
  contact: '/contact',
  faq: '/faq',
  blog_list: '/blog',
  '404': '/404',
  search: '/search',
};

/**
 * Map an uploaded theme's href into a storefront route.
 * `packages.html` → `/pricing`, `about.html` → `/about`, `#x` → `/#x`,
 * tel:/mailto:/http(s): passthrough, unmapped `foo.html` → `/foo` (custom-page slug).
 */
export function navHrefToStorefront(href: string): string {
  const h = String(href || '').trim();
  if (!h) return '/';
  if (/^(tel:|mailto:|javascript:|https?:|data:)/i.test(h)) return h;
  if (h.startsWith('#')) return `/${h}`;
  if (h.startsWith('/')) return h;
  const html = h.match(/^([a-z0-9_-]+)\.html?(?:[?#].*)?$/i);
  if (html) {
    const base = html[1].toLowerCase();
    const tpl = PAGE_FILE_TO_TEMPLATE[base];
    if (tpl && TEMPLATE_TO_PATH[tpl]) return TEMPLATE_TO_PATH[tpl];
    return `/${base}`;
  }
  return `/${h.replace(/^\.?\//, '')}`;
}

function topLevelBlocks(body: LiteNode): { header: LiteNode | null; footer: LiteNode | null; blocks: LiteNode[] } {
  // Unwrap single-child main/div wrappers to find real top-level blocks.
  let scope = body;
  for (let depth = 0; depth < 3; depth++) {
    const els = scope.children.filter((c) => c.tag !== '#text');
    if (els.length === 1 && ['div', 'main', 'body'].includes(els[0].tag)) {
      scope = els[0];
    } else break;
  }

  let header: LiteNode | null = null;
  let footer: LiteNode | null = null;
  const blocks: LiteNode[] = [];

  for (const child of scope.children) {
    if (child.tag === '#text' || !TOP_LEVEL_TAGS.has(child.tag)) continue;
    if (child.tag === 'header' || (child.tag === 'div' && classOrIdMatches(child, /^header|site-header|topbar/))) {
      header = child;
      continue;
    }
    if (child.tag === 'footer' || (child.tag === 'div' && classOrIdMatches(child, /^footer|site-footer/))) {
      footer = child;
      continue;
    }
    // Skip nav-only fragments, empty divs, fixed overlays.
    if (child.tag === 'nav' && !normalizedText(child)) continue;
    if (classOrIdMatches(child, /modal|popup|overlay|preloader|cursor|scroll-to-top|back-to-top/)) continue;
    if (!normalizedText(child) && !find(child, byTag('img'))) continue;
    blocks.push(child);
  }
  return { header, footer, blocks };
}

/* ------------------------------------------------------- global settings */

function extractGlobalSettings(
  doc: LiteNode,
  header: LiteNode | null,
  footer: LiteNode | null,
  cssText: string,
  warnings: string[]
): Record<string, unknown> {
  const settings: Record<string, unknown> = {};

  const vars = extractCssVariables(cssText);
  const colors: Record<string, string> = {
    primary: pickColorVar(vars, [/primary/, /brand/, /main/, /maroon/, /accent/]),
    accent: pickColorVar(vars, [/accent/, /secondary/, /highlight/]),
    background: pickColorVar(vars, [/bg$/, /background/, /cream/, /surface/]),
    text: pickColorVar(vars, [/text/, /ink/, /fg$/, /foreground/, /body-color/]),
    surface: pickColorVar(vars, [/surface/, /card/, /panel/]),
    muted: pickColorVar(vars, [/muted/, /gray/, /grey/, /subtle/, /secondary-text/]),
  };
  // Fill gaps with sensible fallbacks from any hex vars.
  const anyColor = Object.values(vars).find((v) => /^#([0-9a-f]{3,8})$/i.test(v)) ?? '';
  for (const k of Object.keys(colors)) if (!colors[k]) colors[k] = k === 'primary' ? anyColor : '';
  if (!colors.accent && colors.primary) colors.accent = colors.primary;
  settings.colors = colors;

  // Buttons inherit the theme palette when we extracted one.
  if (colors.primary || colors.accent) {
    const btn = colors.accent || colors.primary;
    settings.buttons = {
      primary: {
        background: btn,
        text: '#ffffff',
        border: btn,
        borderThickness: 0,
        cornerRadius: 10,
        font: 'body',
        textCase: 'default',
      },
      secondary: {
        background: 'transparent',
        text: colors.primary || colors.text || '#0f172a',
        border: colors.primary || colors.text || '#0f172a',
        borderThickness: 1,
        cornerRadius: 10,
        font: 'body',
        textCase: 'default',
      },
    };
  }

  const fontHeading = pickFontVar(vars, [/serif/, /heading/, /title/, /display/]);
  const fontBody = pickFontVar(vars, [/sans/, /body/, /text/, /base/]);
  settings.typography = {
    fontFamily: fontHeading || '"Poppins", system-ui, sans-serif',
    fontFamilyBody: fontBody || fontHeading || '"Inter", system-ui, sans-serif',
  };

  // Google Fonts → keep the full stylesheet URL so the contract can actually
  // load the fonts, and prefer the first family for headings if vars missing.
  const fontsHref = findAll(doc, byTag('link')).find((l) =>
    /fonts\.googleapis\.com\/css/.test(l.attrs.href || '')
  )?.attrs.href;
  if (fontsHref) {
    (settings.typography as Record<string, unknown>).googleFontsUrl = fontsHref;
  }
  if (!fontHeading) {
    const fam = /family=([^:&"]+)/.exec(fontsHref || '')?.[1];
    if (fam) settings.typography = { ...settings.typography as object, fontFamily: `'${decodeURIComponent(fam).replace(/\+/g, ' ')}', system-ui, sans-serif` };
  }

  // Logo text from header.
  const logoEl = header ? find(header, (n) => classOrIdMatches(n, /logo|brand/i)) ?? find(header, byTag('a')) : null;
  const logoImg = header ? find(header, byTag('img')) : null;
  const logoText = normalizedText(logoEl).split(/\s{2,}/)[0]?.slice(0, 60) || '';
  settings.logo = { defaultUrl: '', faviconUrl: '', desktopHeight: 36, mobileHeight: 28 };
  if (logoImg?.attrs.src && !/\.(svg)$/i.test(logoImg.attrs.src)) {
    (settings.logo as Record<string, unknown>).defaultUrl = logoImg.attrs.src;
  }

  // Contact details from tel/mailto links + address-looking text.
  const scope = footer ?? doc;
  const email = /mailto:([^"'>\s]+)/i.exec(stringifyAttrs(scope))?.[1] || '';
  const phone = /tel:([^"'>\s]+)/i.exec(stringifyAttrs(scope))?.[1] || '';
  const title = normalizedText(find(doc, byTag('title'))) || '';
  settings.contact = {
    title: 'Contact Us',
    email: decodeURIComponent(email).trim(),
    phone: decodeURIComponent(phone).replace(/[^\d+()\-\s]/g, '').trim(),
    address: '',
  };

  // Social links — by brand icon class or known domains.
  const social: Record<string, string> = {};
  for (const a of findAll(scope, byTag('a'))) {
    const href = a.attrs.href || '';
    const sig = `${a.attrs.class || ''} ${a.attrs['aria-label'] || ''} ${href}`.toLowerCase();
    if (/facebook/.test(sig)) social.facebook = href;
    else if (/instagram/.test(sig)) social.instagram = href;
    else if (/youtube/.test(sig)) social.youtube = href;
    else if (/linkedin/.test(sig)) social.linkedin = href;
    else if (/twitter|x\.com|fa-x-twitter/.test(sig)) social.twitter = href;
  }
  settings.socialLinks = {
    facebook: social.facebook ?? '',
    twitter: social.twitter ?? '',
    instagram: social.instagram ?? '',
    linkedin: social.linkedin ?? '',
    youtube: social.youtube ?? '',
  };

  settings.siteTitle = title;
  return settings;
}

function stringifyAttrs(node: LiteNode): string {
  const parts: string[] = [];
  const walk = (n: LiteNode) => {
    for (const v of Object.values(n.attrs)) parts.push(String(v));
    n.children.forEach(walk);
  };
  walk(node);
  return parts.join(' ');
}

/**
 * Sections that can be bound to live industry records at storefront runtime.
 * `settings.dataSource` is a hint consumed by the webpanel runtime injector —
 * it stays declarative config (no behavior change in the editor contract).
 */
const DATA_SOURCE_SECTION_TYPES = new Set(['features-grid', 'media-gallery', 'logo-cloud', 'pricing']);
const SECTION_DATA_SOURCE_HINTS: Array<{ re: RegExp; source: string }> = [
  {
    re: /destinations?|packages?|tours?|trips?|itinerar|getaways?|holidays?|vacations?/i,
    source: 'tour_travel:packages',
  },
];

interface NavMenuItem {
  label: string;
  href: string;
}

/**
 * Nav/footer link extraction: anchors inside `scope`, skipping tel/mailto,
 * button-styled anchors (those become the header CTA), and dupes.
 */
export function extractMenuItems(navScope: LiteNode | null, fallbackScope: LiteNode): NavMenuItem[] {
  const scope = navScope ?? fallbackScope;
  const anchors = findAll(scope, byTag('a'));
  const seen = new Set<string>();
  const items: NavMenuItem[] = [];
  for (const a of anchors) {
    // Skip brand/logo anchors — they're the site identity, not menu items.
    let brandAncestor = false;
    for (let p: LiteNode | null = a.parent; p; p = p.parent) {
      if (classOrIdMatches(p, /logo|brand/i)) { brandAncestor = true; break; }
      if (['nav', 'ul', 'section', 'footer', 'header', 'body'].includes(p.tag)) break;
    }
    if (brandAncestor) continue;
    const label = normalizedText(a).replace(/\s+/g, ' ').slice(0, 40).trim();
    const href = String(a.attrs?.href || '').trim();
    if (!label || label.length < 2) continue;
    if (/^(tel:|mailto:|javascript:)/i.test(href)) continue;
    if (classOrIdMatches(a, /btn|cta|plan|quote|book/i)) continue;
    const key = `${label}→${href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ label, href: navHrefToStorefront(href || '#') });
    if (items.length >= 10) break;
  }
  return items;
}

/** Header CTA — first button-styled anchor (e.g. "Plan My Trip", "Book now"). */
export function extractHeaderCta(headerNode: LiteNode): { label: string; href: string } | null {
  const a = find(
    headerNode,
    (n) => n.tag === 'a' && classOrIdMatches(n, /btn|cta|plan|quote|book/i)
  );
  if (!a) return null;
  const label = normalizedText(a).replace(/\s+/g, ' ').slice(0, 30).trim();
  if (!label) return null;
  const href = String(a.attrs?.href || '').trim();
  return { label, href: navHrefToStorefront(href || '#') };
}

/** Topbar tagline + first non-contact link → announcement-bar block settings. */
export function extractTopbarAnnouncement(
  root: LiteNode | null
): { text: string; link?: string; linkLabel?: string } | null {
  if (!root) return null;
  const topbar = find(root, (n) => classOrIdMatches(n, /topbar|top-bar|header-top|info-bar/i));
  if (!topbar) return null;
  const tagline =
    normalizedText(find(topbar, (n) => classOrIdMatches(n, /tagline|slogan|message|text/i))) ||
    normalizedText(find(topbar, byTag('p')));
  const link = find(
    topbar,
    (n) => n.tag === 'a' && !/^(tel:|mailto:)/i.test(String(n.attrs?.href || ''))
  );
  const out: { text: string; link?: string; linkLabel?: string } = { text: tagline.slice(0, 160) };
  if (link) {
    const l = normalizedText(link).replace(/\s+/g, ' ').slice(0, 40).trim();
    if (l) {
      out.linkLabel = l;
      out.link = navHrefToStorefront(String(link.attrs?.href || '#'));
    }
  }
  return out.text ? out : null;
}

/** Footer link columns → menu + legal item lists for the footer contract blocks. */
export function extractFooterMenus(footerNode: LiteNode): { menu: NavMenuItem[]; legal: NavMenuItem[] } {
  const all = extractMenuItems(null, footerNode);
  const legal = all.filter((i) => /privacy|terms|refund|policy|cookie|disclaimer/i.test(`${i.label} ${i.href}`));
  const menu = all.filter((i) => !legal.includes(i)).slice(0, 8);
  return { menu, legal };
}

function annotateSectionDataSources(config: Record<string, any>): void {
  const templates = config?.templates;
  if (!templates || typeof templates !== 'object') return;
  for (const template of Object.values<any>(templates)) {
    const sections = template?.sections;
    if (!sections || typeof sections !== 'object') continue;
    for (const section of Object.values<any>(sections)) {
      if (!section || !DATA_SOURCE_SECTION_TYPES.has(String(section.type || ''))) continue;
      const s = section.settings || {};
      const text = [s.eyebrow, s.heading, s.subheading].map((v) => String(v || '')).join(' ');
      const hint = SECTION_DATA_SOURCE_HINTS.find((h) => h.re.test(text));
      if (hint && !s.dataSource) {
        section.settings = { ...s, dataSource: hint.source };
      }
    }
  }
}

/* -------------------------------------------------------------- public */

export interface ConvertOptions {
  themeId: string;
  themeName: string;
  /** Files under the theme content root. */
  files: ImportedThemeFile[];
  /** Resolve a theme-relative asset path to a public URL. */
  assetUrl: AssetUrlFn;
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export function convertStaticThemeToInformaticPack(opts: ConvertOptions): ConvertedInformaticPack {
  const warnings: string[] = [];
  const { files, assetUrl } = opts;

  const htmlFiles = files
    .filter((f) => /\.html?$/i.test(f.relativePath))
    .sort((a, b) => {
      const ai = /^index\.html?$/i.test(path.posix.basename(a.relativePath)) ? 0 : 1;
      const bi = /^index\.html?$/i.test(path.posix.basename(b.relativePath)) ? 0 : 1;
      return ai - bi || a.relativePath.localeCompare(b.relativePath);
    });

  if (!htmlFiles.length) {
    throw new Error('No .html file found at the theme root — cannot convert.');
  }

  const cssText = files
    .filter((f) => /\.css$/i.test(f.relativePath))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    .map((f) => `/* ==== ${f.relativePath} ==== */\n${safeRead(f.absolutePath)}`)
    .join('\n\n');

  const jsFiles = files.filter((f) => /\.js$/i.test(f.relativePath));

  // ---- Parse pages → converted template sections
  const usedSectionIds = new Set<string>();
  const templateSections: Record<string, ConvertedSection[]> = {};
  let headerNode: LiteNode | null = null;
  let footerNode: LiteNode | null = null;
  let firstDoc: LiteNode | null = null;

  for (const htmlFile of htmlFiles) {
    const base = path.posix.basename(htmlFile.relativePath).replace(/\.html?$/i, '').toLowerCase();
    const templateId = PAGE_FILE_TO_TEMPLATE[base];
    if (!templateId) {
      warnings.push(`Skipped unmapped page ${htmlFile.relativePath} (no matching template).`);
      continue;
    }
    const doc = parseHtml(safeRead(htmlFile.absolutePath));
    if (!firstDoc) firstDoc = doc;
    const body = find(doc, byTag('body')) ?? doc;
    const { header, footer, blocks } = topLevelBlocks(body);
    if (!headerNode && header) headerNode = header;
    if (!footerNode && footer) footerNode = footer;

    const converted: ConvertedSection[] = [];
    blocks.forEach((block, i) => {
      const type = classifyBlock(block, i);
      const sec = convertBlock(block, type, templateId, usedSectionIds, assetUrl, warnings);
      converted.push(sec);

      // Nested CTA detection — preserve a banner trapped inside a bigger section.
      if (type !== 'cta-band') {
        const nested = find(block, (n) =>
          n !== block && classOrIdMatches(n, /cta-banner|cta_band|call-to-action/) &&
          Boolean(find(n, byTag('a')))
        );
        if (nested) {
          const cta = convertBlock(nested, 'cta-band', templateId, usedSectionIds, assetUrl, warnings);
          cta.id = slugifyId('cta_band', usedSectionIds);
          converted.push(cta);
        }
      }
    });

    templateSections[templateId] = converted;
    if (!converted.length) {
      warnings.push(`No convertible sections found in ${htmlFile.relativePath}.`);
    }
  }

  // ---- Global settings
  const globalSettings = extractGlobalSettings(firstDoc ?? parseHtml(''), headerNode, footerNode, cssText, warnings);

  // ---- Build schema: skeleton + generated index template
  const schema = JSON.parse(JSON.stringify(skeletonSchema)) as Record<string, any>;
  schema.themeId = opts.themeId;
  schema.description = `${opts.themeName} — imported static theme (auto-converted).`;

  // Merge extracted global defaults into schema defaults so the settings
  // sheet shows the theme's real colors/fonts instead of informatic's.
  try {
    const gs = (globalSettings as any);
    const schemaColors = schema.globalSettings?.settings?.colors?.settings;
    if (schemaColors && gs.colors) {
      for (const [k, v] of Object.entries(gs.colors as Record<string, string>)) {
        if (schemaColors[k] && v) schemaColors[k].default = v;
      }
    }
    const schemaTypo = schema.globalSettings?.settings?.typography?.settings;
    if (schemaTypo && gs.typography) {
      const t = gs.typography as Record<string, string>;
      if (schemaTypo.fontFamily && t.fontFamily) schemaTypo.fontFamily.default = t.fontFamily;
      if (schemaTypo.fontFamilyBody && t.fontFamilyBody) schemaTypo.fontFamilyBody.default = t.fontFamilyBody;
    }
    const schemaSocial = schema.globalSettings?.settings?.socialLinks?.settings;
    if (schemaSocial && gs.socialLinks) {
      for (const [k, v] of Object.entries(gs.socialLinks as Record<string, string>)) {
        if (schemaSocial[k] && v) schemaSocial[k].default = v;
      }
    }
    const schemaContact = schema.globalSettings?.settings?.contact?.settings;
    if (schemaContact && gs.contact) {
      for (const [k, v] of Object.entries(gs.contact as Record<string, string>)) {
        if (schemaContact[k] && v) schemaContact[k].default = v;
      }
    }
  } catch {
    warnings.push('Could not merge extracted global settings into schema defaults.');
  }

  const templates = (schema.templates ?? []) as any[];
  for (const [templateId, sections] of Object.entries(templateSections)) {
    const tpl = templates.find((t) => t.id === templateId);
    const generated = sections.map((sec) => schemaSectionFor(sec, templateId));
    if (tpl) {
      tpl.sections = generated;
    } else {
      templates.push({ id: templateId, label: humanize(templateId), sections: generated });
    }
  }

  // ---- Build config: skeleton + extracted settings + converted templates
  const config = JSON.parse(JSON.stringify(skeletonConfig)) as Record<string, any>;

  // Global settings merge — only override keys we actually extracted.
  const cfgSettings = (config.settings ??= {});
  for (const [group, value] of Object.entries(globalSettings)) {
    if (group === 'siteTitle') continue;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      cfgSettings[group] = { ...(cfgSettings[group] ?? {}), ...value };
    } else {
      cfgSettings[group] = value;
    }
  }

  // Header nav/footer structure from extracted header/footer nodes — keeps the
  // uploaded theme's real menu, CTA, topbar announcement, and footer links
  // instead of the skeleton defaults.
  if (headerNode) {
    (config.sections ??= {}).header ??= { type: 'header', enabled: true, settings: {}, blocks: {} };
    const h = config.sections.header as Record<string, any>;
    h.settings ??= {};
    h.blocks ??= {};
    const logoText =
      normalizedText(find(headerNode, (n) => classOrIdMatches(n, /logo-text|brand|logo\b/i))) ||
      normalizedText(find(headerNode, byTag('a'))).split(' ')[0];
    h.blocks.logo ??= { type: 'logo', settings: {} };
    h.blocks.logo.settings = {
      ...(h.blocks.logo.settings ?? {}),
      ...(logoText ? { text: logoText.slice(0, 60) } : {}),
    };
    const logoImg = find(headerNode, byTag('img'));
    const logoSrc = String(logoImg?.attrs?.src || '').trim();
    if (logoSrc) {
      h.blocks.logo.settings.imageUrl = assetUrl(logoSrc);
    }

    const navNode =
      find(headerNode, byTag('nav')) ??
      find(headerNode, (n) => classOrIdMatches(n, /\bnav\b|nav__|menu|links/i));
    const items = extractMenuItems(navNode, headerNode);
    if (items.length) {
      h.blocks.menu ??= { type: 'menu', settings: {} };
      h.blocks.menu.settings = { ...(h.blocks.menu.settings ?? {}), items };
    }

    const cta = extractHeaderCta(headerNode);
    if (cta) {
      h.settings.ctaLabel = cta.label;
      h.settings.ctaUrl = cta.href;
    }

    const ann = extractTopbarAnnouncement(headerNode) ?? extractTopbarAnnouncement(
      find(firstDoc ?? parseHtml(''), byTag('body')) ?? firstDoc
    );
    if (ann?.text) {
      (config.sections ??= {}).announcement_bar ??= {
        type: 'announcement-bar',
        enabled: true,
        settings: { enabled: true },
        blocks: {},
      };
      const ab = config.sections.announcement_bar as Record<string, any>;
      ab.blocks ??= {};
      ab.blocks.announcement ??= { type: 'announcement', settings: {} };
      ab.blocks.announcement.settings = {
        ...(ab.blocks.announcement.settings ?? {}),
        ...ann,
      };
    }
  }
  if (footerNode) {
    const brandTitle =
      normalizedText(find(footerNode, (n) => classOrIdMatches(n, /logo|brand/))) || '';
    const blurb = firstParagraphText(find(footerNode, (n) => classOrIdMatches(n, /tagline|about|blurb/)) ?? footerNode).slice(0, 240);
    (config.sections ??= {}).footer ??= { type: 'footer', enabled: true, blocks: {} };
    const f = config.sections.footer as Record<string, any>;
    f.blocks ??= {};
    f.blocks.brand ??= { type: 'brand', settings: {} };
    f.blocks.brand.settings = {
      ...(f.blocks.brand.settings ?? {}),
      ...(brandTitle ? { title: brandTitle.slice(0, 60) } : {}),
      ...(blurb ? { blurb } : {}),
    };
    const socials = (globalSettings.socialLinks ?? {}) as Record<string, string>;
    f.blocks.social ??= { type: 'social', settings: {} };
    f.blocks.social.settings = { ...(f.blocks.social.settings ?? {}), ...socials };
    const { menu: footerMenu, legal: footerLegal } = extractFooterMenus(footerNode);
    if (footerMenu.length) {
      f.blocks.menu ??= { type: 'menu', settings: {} };
      f.blocks.menu.settings = { ...(f.blocks.menu.settings ?? {}), items: footerMenu };
    }
    if (footerLegal.length) {
      f.blocks.legal ??= { type: 'menu', settings: {} };
      f.blocks.legal.settings = { ...(f.blocks.legal.settings ?? {}), items: footerLegal };
    }
  }

  config.templates ??= {};
  for (const [templateId, sections] of Object.entries(templateSections)) {
    const tplSections: Record<string, unknown> = {};
    const order: string[] = [];
    for (const sec of sections) {
      tplSections[sec.id] = {
        id: sec.id,
        type: sec.type,
        enabled: true,
        settings: sec.settings,
        ...(Object.keys(sec.blocks).length ? { blocks: sec.blocks, block_order: sec.blockOrder } : {}),
      };
      order.push(sec.id);
    }
    config.templates[templateId] = { sections: tplSections, section_order: order };
  }
  annotateSectionDataSources(config);

  // ---- Manifest: skeleton shape with the new identity
  const manifest = JSON.parse(JSON.stringify(skeletonManifest)) as Record<string, any>;
  manifest.id = opts.themeId;
  manifest.name = opts.themeName;
  manifest.description = `${opts.themeName} — imported and auto-converted for the Informatic theme editor.`;

  // ---- theme.js (inert today — the informatic runtime renders via the
  // bundled contract — but required by the catalog format)
  const themeJs = [
    `/**`,
    ` * ${opts.themeName} — auto-converted static theme.`,
    ` * The Informatic runtime renders catalog themes through the shared`,
    ` * contract bundle; this file exists to satisfy the catalog format.`,
    ` * Original JS files from the upload remain inside the theme/ folder.`,
    ` */`,
    `export default {};`,
    ``,
  ].join('\n');

  // ---- Thumbnail: prefer hero/cover/screenshot images
  const images = files.filter((f) => IMAGE_EXTS.has(path.posix.extname(f.relativePath).toLowerCase()));
  const preferred = images.find((f) => /hero|cover|thumb|screenshot|preview|banner/i.test(f.relativePath));
  const thumbnailRelativePath = (preferred ?? images[0])?.relativePath ?? null;
  if (!thumbnailRelativePath) warnings.push('No image found in the theme — a placeholder thumbnail will be used.');

  const report = Object.entries(templateSections).map(([template, sections]) => ({
    template,
    sections: sections.map((s) => ({ id: s.id, type: s.type, label: s.label })),
  }));

  return {
    schemaJson: JSON.stringify(schema, null, 2),
    defaultConfigJson: JSON.stringify(config, null, 2),
    manifestJson: JSON.stringify(manifest, null, 2),
    themeJs,
    themeCss: cssText || '/* no css files found in upload */\n',
    thumbnailRelativePath,
    warnings,
    report,
  };
}

function safeRead(p: string): string {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}
