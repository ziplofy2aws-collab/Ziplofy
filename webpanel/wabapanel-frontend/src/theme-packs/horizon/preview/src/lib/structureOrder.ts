import { getThemeConfigValue } from '@render-store/sdk';

/** Read ordered ids from config (section_order / block_order) with sensible fallbacks. */
export function orderedIds(
  config: Record<string, unknown> | null,
  orderPath: string,
  keysPath: string,
  fallback: string[]
): string[] {
  const order = getThemeConfigValue(config, orderPath);
  if (Array.isArray(order) && order.length > 0) {
    return order.map((id) => String(id));
  }
  const keys = getThemeConfigValue(config, keysPath);
  if (keys != null && typeof keys === 'object' && !Array.isArray(keys)) {
    return Object.keys(keys as Record<string, unknown>);
  }
  return fallback;
}

export function templateSectionOrder(
  config: Record<string, unknown> | null,
  templateId: string,
  fallback: string[]
): string[] {
  const sections = getThemeConfigValue(config, `templates.${templateId}.sections`);
  const sectionKeys =
    sections != null && typeof sections === 'object' && !Array.isArray(sections)
      ? new Set(Object.keys(sections as Record<string, unknown>))
      : new Set<string>();

  const orderRaw = getThemeConfigValue(config, `templates.${templateId}.section_order`);
  if (Array.isArray(orderRaw)) {
    return orderRaw.map((id) => String(id)).filter((id) => sectionKeys.has(id));
  }

  if (sectionKeys.size > 0) {
    const raw = orderedIds(
      config,
      `templates.${templateId}.section_order`,
      `templates.${templateId}.sections`,
      fallback
    );
    return raw.filter((id) => sectionKeys.has(id));
  }

  return fallback.filter((id) => sectionKeys.has(id));
}

export function layoutBlockOrder(
  config: Record<string, unknown> | null,
  layoutKey: string,
  fallback: string[]
): string[] {
  const raw = orderedIds(
    config,
    `sections.${layoutKey}.block_order`,
    `sections.${layoutKey}.blocks`,
    fallback
  );
  const blocks = getThemeConfigValue(config, `sections.${layoutKey}.blocks`);
  const blockMap =
    blocks != null && typeof blocks === 'object' && !Array.isArray(blocks)
      ? (blocks as Record<string, { enabled?: boolean }>)
      : {};
  return raw.filter((id) => blockMap[id]?.enabled !== false);
}

export function templateBlockOrder(
  config: Record<string, unknown> | null,
  templateId: string,
  sectionId: string,
  fallback: string[]
): string[] {
  const raw = orderedIds(
    config,
    `templates.${templateId}.sections.${sectionId}.block_order`,
    `templates.${templateId}.sections.${sectionId}.blocks`,
    fallback
  );
  const blocks = getThemeConfigValue(config, `templates.${templateId}.sections.${sectionId}.blocks`);
  const blockMap =
    blocks != null && typeof blocks === 'object' && !Array.isArray(blocks)
      ? (blocks as Record<string, { enabled?: boolean }>)
      : {};
  return raw.filter((id) => blockMap[id]?.enabled !== false);
}
