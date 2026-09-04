import defaultConfig from '@/theme-packs/informatic/theme.default-config.json';

const DYNAMIC_SECTION_TYPES = new Set(['custom-page', 'blog-post', 'blog-list', 'store-policy']);

const RUNTIME_TEMPLATE_IDS = [
  'page',
  'blog_list',
  'blog_post',
  'privacy',
  'terms',
  'return_refund',
  'contact_info',
] as const;

type TemplateBlock = {
  sections?: Record<string, { type?: string; enabled?: boolean; settings?: Record<string, unknown> }>;
  section_order?: string[];
};

/**
 * Ensure dynamic Informatic templates exist and use runtime section types.
 * Catalog editor packs and older saved configs may omit `page` or still use rich-text.
 */
export function patchInformaticRuntimeTemplates(
  config: Record<string, unknown>,
  referenceConfig: Record<string, unknown> = defaultConfig as Record<string, unknown>
): Record<string, unknown> {
  const refTemplates = (referenceConfig.templates ?? {}) as Record<string, TemplateBlock>;
  if (!refTemplates || typeof refTemplates !== 'object') return config;

  const templates = { ...((config.templates ?? {}) as Record<string, TemplateBlock>) };

  for (const templateId of RUNTIME_TEMPLATE_IDS) {
    const refTpl = refTemplates[templateId];
    if (!refTpl) continue;

    const current = templates[templateId];
    if (!current) {
      templates[templateId] = structuredClone(refTpl);
      continue;
    }

    const refSections = refTpl.sections ?? {};
    const curSections = { ...(current.sections ?? {}) };

    for (const [sectionId, refSection] of Object.entries(refSections)) {
      const refType = String(refSection?.type ?? '').trim();
      if (!DYNAMIC_SECTION_TYPES.has(refType)) continue;

      const curSection = curSections[sectionId];
      const curType = String(curSection?.type ?? '').trim();
      if (curType === refType) continue;

      curSections[sectionId] = {
        ...structuredClone(refSection),
        ...curSection,
        type: refType,
        settings: {
          ...(refSection.settings ?? {}),
          ...(curSection?.settings ?? {}),
        },
        enabled: curSection?.enabled !== false,
      };
    }

    const sectionOrder = Array.isArray(current.section_order)
      ? current.section_order.filter((id) => typeof id === 'string' && id.trim())
      : [];
    const refOrder = Array.isArray(refTpl.section_order)
      ? refTpl.section_order.filter((id) => typeof id === 'string' && id.trim())
      : [];

    templates[templateId] = {
      ...current,
      sections: curSections,
      section_order: sectionOrder.length ? sectionOrder : refOrder,
    };
  }

  return { ...config, templates };
}
