/**
 * Shared helpers for reading informatic theme config paths and translating
 * settings into styles. Config shape (theme.default-config.json):
 *
 *   settings.{colors,typography,buttons,logo,contact,socialLinks,whatsappWidget}
 *   layout_order.{header:[],footer:[]}
 *   sections.{announcement_bar,header,footer}.{settings,blocks,block_order}
 *   templates.<id>.{section_order:[], sections.<sid>.{type,enabled,settings,blocks,block_order}}
 */
import { getThemeConfigValue, type ThemeConfig } from '@render-store/sdk';
import type { CSSProperties } from 'react';

export type Section = {
  type?: string;
  enabled?: boolean;
  settings?: Record<string, unknown>;
  blocks?: Record<string, Section>;
  block_order?: string[];
  [key: string]: unknown;
};

export function cfg<T = unknown>(config: ThemeConfig, path: string, fallback: T): T {
  return getThemeConfigValue<unknown>(config, path, fallback) as T;
}

export function cfgStr(config: ThemeConfig, path: string): string {
  const v = getThemeConfigValue<unknown>(config, path, '');
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

export function getSection(config: ThemeConfig, templateId: string, sectionId: string): Section | null {
  const s = getThemeConfigValue<Section>(config, `templates.${templateId}.sections.${sectionId}`, null as unknown as Section);
  return s && typeof s === 'object' ? s : null;
}

export function getLayoutSection(config: ThemeConfig, sectionId: string): Section | null {
  const s = getThemeConfigValue<Section>(config, `sections.${sectionId}`, null as unknown as Section);
  return s && typeof s === 'object' ? s : null;
}

/** Ordered, enabled block entries of a section: [blockId, block][]. */
export function orderedBlocks(section: Section | null | undefined): Array<[string, Section]> {
  const blocks = section?.blocks;
  if (!blocks || typeof blocks !== 'object') return [];
  const ids = Array.isArray(section?.block_order) && section!.block_order!.length
    ? (section!.block_order as string[])
    : Object.keys(blocks);
  return ids
    .filter((id) => blocks[id] && typeof blocks[id] === 'object')
    .map((id) => [id, blocks[id]] as [string, Section])
    .filter(([, b]) => b.enabled !== false);
}

/** Ordered, enabled section ids for a template. */
export function orderedSectionIds(config: ThemeConfig, templateId: string): string[] {
  const sections = getThemeConfigValue<Record<string, Section>>(config, `templates.${templateId}.sections`, {});
  if (!sections || typeof sections !== 'object') return [];
  const order = getThemeConfigValue<string[]>(config, `templates.${templateId}.section_order`, []);
  const ids = Array.isArray(order) && order.length ? order : Object.keys(sections);
  return ids.filter((id) => sections[id] && typeof sections[id] === 'object');
}

export function sectionStyle(section: Section | null | undefined): CSSProperties {
  const s = section?.settings ?? {};
  const style: CSSProperties = {};
  if (typeof s.backgroundColor === 'string' && s.backgroundColor) style.background = s.backgroundColor;
  if (typeof s.textColor === 'string' && s.textColor) style.color = s.textColor;
  return style;
}

export type ButtonKind = 'primary' | 'secondary';

const CTA_PREFIX: Record<ButtonKind, string> = { primary: 'primaryCta', secondary: 'secondaryCta' };

/**
 * Button style from settings.buttons.<kind> plus optional per-CTA overrides
 * stored as flat section settings (e.g. `primaryCtaBackground`). Pricing-plan
 * blocks use the `cta`-prefixed variants (ctaBackground, ctaText, …).
 */
export function buttonStyle(
  config: ThemeConfig,
  kind: ButtonKind,
  overrides?: Record<string, unknown> | null,
  overridePrefix?: string
): CSSProperties {
  const base = cfg<Record<string, unknown>>(config, `settings.buttons.${kind}`, {});
  const prefix = overridePrefix ?? CTA_PREFIX[kind];
  const bg = overrides?.[`${prefix}Background`] ?? base.background;
  const text = overrides?.[`${prefix}Text`] ?? base.text;
  const border = overrides?.[`${prefix}Border`] ?? base.border;
  const borderThickness = overrides?.[`${prefix}BorderThickness`] ?? base.borderThickness;
  const cornerRadius = overrides?.[`${prefix}CornerRadius`] ?? base.cornerRadius;
  const font = overrides?.[`${prefix}Font`] ?? base.font;
  const textCase = overrides?.[`${prefix}TextCase`] ?? base.textCase;
  const style: CSSProperties = {};
  if (typeof bg === 'string' && bg) style.background = bg;
  if (typeof text === 'string' && text) style.color = text;
  const bw = Number(borderThickness) || 0;
  style.border = bw > 0 ? `${bw}px solid ${typeof border === 'string' ? border : 'currentColor'}` : 'none';
  if (cornerRadius != null && cornerRadius !== '') style.borderRadius = Number(cornerRadius) || 0;
  if (font === 'heading') style.fontFamily = 'var(--inf-font-head)';
  if (font === 'body') style.fontFamily = 'var(--inf-font-body)';
  if (textCase === 'uppercase') style.textTransform = 'uppercase';
  if (textCase === 'lowercase') style.textTransform = 'lowercase';
  if (textCase === 'capitalize') style.textTransform = 'capitalize';
  return style;
}

/** True when a value looks like HTML markup rather than plain text. */
export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function humanize(id: string): string {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Root CSS custom properties driven by settings.colors/typography. */
export function themeVars(config: ThemeConfig): CSSProperties {
  const colors = cfg<Record<string, string>>(config, 'settings.colors', {});
  const typo = cfg<Record<string, string>>(config, 'settings.typography', {});
  return {
    ['--inf-primary' as string]: colors.primary || '#0f172a',
    ['--inf-accent' as string]: colors.accent || '#2563eb',
    ['--inf-bg' as string]: colors.background || '#ffffff',
    ['--inf-surface' as string]: colors.surface || '#f8fafc',
    ['--inf-text' as string]: colors.text || '#0f172a',
    ['--inf-muted' as string]: colors.muted || '#64748b',
    ['--inf-font-head' as string]: typo.fontFamily || 'system-ui, sans-serif',
    ['--inf-font-body' as string]: typo.fontFamilyBody || typo.fontFamily || 'system-ui, sans-serif',
  } as CSSProperties;
}

const GENERIC_FONT = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-|-apple-|blinkmacsystemfont|georgia|times new roman|arial|helvetica|helvetica neue|segoe ui|verdana|tahoma|trebuchet ms|courier|inherit|initial|unset)/i;

function firstFontFamily(stack: string): string {
  return (stack.split(',')[0] || '').trim().replace(/^["']|["']$/g, '');
}

/**
 * Google Fonts stylesheet URL for the theme's configured families. Prefers an
 * explicit `settings.typography.googleFontsUrl`; otherwise builds one from the
 * heading/body stacks (skipping generic system families).
 */
export function googleFontsUrl(config: ThemeConfig): string {
  const direct = cfgStr(config, 'settings.typography.googleFontsUrl');
  // Must look like an actual stylesheet URL, not a bare preconnect host.
  if (direct && /^https?:\/\//i.test(direct) && /css|family=/i.test(direct)) return direct;
  const fams = new Set<string>();
  for (const path of ['settings.typography.fontFamily', 'settings.typography.fontFamilyBody']) {
    const first = firstFontFamily(cfgStr(config, path));
    if (first && !GENERIC_FONT.test(first)) fams.add(first);
  }
  if (!fams.size) return '';
  const q = [...fams]
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
