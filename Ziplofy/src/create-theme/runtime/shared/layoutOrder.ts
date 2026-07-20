import { getThemeConfigValue } from '@render-store/sdk';

function layoutSectionKeys(config: Record<string, unknown> | null): Set<string> {
  const sections = config?.sections as Record<string, unknown> | undefined;
  return new Set(sections ? Object.keys(sections) : []);
}

function footerIdsFromSectionKeys(keys: Set<string>): string[] {
  const out: string[] = [];
  if (keys.has('footer')) out.push('footer');
  if (keys.has('footer_utilities')) out.push('footer_utilities');
  for (const id of keys) {
    if (id === 'footer' || id === 'footer_utilities') continue;
    if (id.startsWith('footer_')) out.push(id);
  }
  return out;
}

export function headerLayoutOrder(config: Record<string, unknown> | null): string[] {
  const keys = layoutSectionKeys(config);
  if (!keys.size) return [];
  const order = getThemeConfigValue(config, 'layout_order.header');
  if (Array.isArray(order)) {
    return order.map((id) => String(id)).filter((id) => keys.has(id));
  }
  const announcements = [...keys].filter((k) => k === 'announcement_bar' || k.startsWith('announcement_bar_'));
  const header = keys.has('header') ? ['header'] : [...keys].filter((k) => k === 'header' || k.startsWith('header_'));
  return [...announcements, ...header];
}

/** Only layout section ids listed in layout_order (or legacy fallback when order is missing). */
export function footerLayoutOrder(config: Record<string, unknown> | null): string[] {
  const keys = layoutSectionKeys(config);
  if (!keys.size) return [];
  const order = getThemeConfigValue(config, 'layout_order.footer');
  if (Array.isArray(order)) {
    return order.map((id) => String(id)).filter((id) => keys.has(id));
  }
  return footerIdsFromSectionKeys(keys);
}
