import { getThemeConfigValue } from '@render-store/sdk';

function layoutSectionKeys(config: Record<string, unknown> | null): Set<string> {
  const sections = config?.sections as Record<string, unknown> | undefined;
  return new Set(sections ? Object.keys(sections) : []);
}

export function headerLayoutOrder(config: Record<string, unknown> | null): string[] {
  const keys = layoutSectionKeys(config);
  const order = getThemeConfigValue(config, 'layout_order.header');
  if (Array.isArray(order)) {
    return order.map((id) => String(id)).filter((id) => keys.has(id));
  }
  if (!keys.size) return ['announcement_bar', 'header'];
  const announcements = [...keys].filter((k) => k === 'announcement_bar' || k.startsWith('announcement_bar_'));
  const header = keys.has('header') ? ['header'] : [...keys].filter((k) => k === 'header' || k.startsWith('header_'));
  return [...announcements, ...header];
}

export function footerLayoutOrder(config: Record<string, unknown> | null): string[] {
  const keys = layoutSectionKeys(config);
  const order = getThemeConfigValue(config, 'layout_order.footer');
  if (Array.isArray(order)) {
    return order.map((id) => String(id)).filter((id) => keys.has(id));
  }
  if (!keys.size) return ['footer', 'footer_utilities'];
  const out: string[] = [];
  if (keys.has('footer')) out.push('footer');
  if (keys.has('footer_utilities')) out.push('footer_utilities');
  return out.length ? out : ['footer'];
}
