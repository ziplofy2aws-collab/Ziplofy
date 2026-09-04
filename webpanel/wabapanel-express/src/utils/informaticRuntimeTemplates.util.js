const path = require('path');
const fs = require('fs');

const DYNAMIC_SECTION_TYPES = new Set(['custom-page', 'blog-post', 'blog-list', 'store-policy']);

/** Templates that load CMS / store content at runtime (not static rich-text). */
const RUNTIME_TEMPLATE_IDS = [
  'page',
  'blog_list',
  'blog_post',
  'privacy',
  'terms',
  'return_refund',
  'contact_info',
];

let cachedReferenceConfig = null;

function loadReferencePackConfig() {
  if (cachedReferenceConfig) return cachedReferenceConfig;
  try {
    const configPath = path.resolve(
      __dirname,
      '../../../../remote-themes/informatic/theme.default-config.json'
    );
    const raw = fs.readFileSync(configPath, 'utf8');
    cachedReferenceConfig = JSON.parse(raw);
    return cachedReferenceConfig;
  } catch {
    return null;
  }
}

/**
 * Ensure dynamic Informatic templates (custom page, blog post, policies) exist and use
 * runtime section types. Catalog packs and older saved configs may still use rich-text
 * placeholders or omit the page template entirely.
 */
function patchInformaticRuntimeTemplates(config, referenceConfig) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return config;
  }
  const reference = referenceConfig || loadReferencePackConfig();
  const refTemplates = reference?.templates;
  if (!refTemplates || typeof refTemplates !== 'object') {
    return config;
  }

  const out = config;
  const templates = { ...(out.templates || {}) };

  for (const templateId of RUNTIME_TEMPLATE_IDS) {
    const refTpl = refTemplates[templateId];
    if (!refTpl || typeof refTpl !== 'object') continue;

    const current = templates[templateId];
    if (!current || typeof current !== 'object') {
      templates[templateId] = structuredClone(refTpl);
      continue;
    }

    const refSections = refTpl.sections && typeof refTpl.sections === 'object' ? refTpl.sections : {};
    const curSections =
      current.sections && typeof current.sections === 'object' ? { ...current.sections } : {};

    for (const [sectionId, refSection] of Object.entries(refSections)) {
      if (!refSection || typeof refSection !== 'object') continue;
      const refType = String(refSection.type || '').trim();
      if (!DYNAMIC_SECTION_TYPES.has(refType)) continue;

      const curSection = curSections[sectionId];
      const curType = String(curSection?.type || '').trim();
      if (curType === refType) continue;

      curSections[sectionId] = {
        ...structuredClone(refSection),
        ...(curSection && typeof curSection === 'object' ? curSection : null),
        type: refType,
        settings: {
          ...(refSection.settings && typeof refSection.settings === 'object' ? refSection.settings : {}),
          ...(curSection?.settings && typeof curSection.settings === 'object' ? curSection.settings : {}),
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

  out.templates = templates;
  return out;
}

function patchInformaticEditorPack(pack) {
  if (!pack || typeof pack !== 'object') return pack;
  const reference = loadReferencePackConfig();
  if (!reference) return pack;

  const next = { ...pack };
  if (pack.config && typeof pack.config === 'object') {
    next.config = patchInformaticRuntimeTemplates(structuredClone(pack.config), reference);
  }
  if (pack.schema && reference && !pack.schema.templates?.some?.((t) => t.id === 'page')) {
    try {
      const schemaPath = path.resolve(
        __dirname,
        '../../../../remote-themes/informatic/theme.schema.json'
      );
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      if (schema?.templates) next.schema = schema;
    } catch {
      /* keep catalog schema */
    }
  }
  return next;
}

module.exports = {
  RUNTIME_TEMPLATE_IDS,
  loadReferencePackConfig,
  patchInformaticRuntimeTemplates,
  patchInformaticEditorPack,
};
