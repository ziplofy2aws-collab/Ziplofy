/** Alternate page templates stored under `config.templates` (Shopify-style `pages.{slug}` keys). */

export const PAGE_TEMPLATE_ORDER_KEY = 'page_template_order';
export const DEFAULT_PAGE_TEMPLATE_ID = 'pages';

export type PageTemplateEntry = {
  id: string;
  name: string;
  isDefault: boolean;
  basedOn?: string;
  assignedPageCount: number;
};

function templatesRecord(config: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const raw = config.templates;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as Record<string, Record<string, unknown>>;
}

export function isPageTemplateKey(templateId: string): boolean {
  return templateId === DEFAULT_PAGE_TEMPLATE_ID || templateId.startsWith('pages.');
}

export function pageTemplateSlugFromKey(templateId: string): string | null {
  if (templateId === DEFAULT_PAGE_TEMPLATE_ID) return null;
  if (!templateId.startsWith('pages.')) return null;
  return templateId.slice('pages.'.length);
}

/** Preview page id: `pages` or `pages:my-template`. */
export function pageTemplatePreviewPage(templateId: string): string {
  const slug = pageTemplateSlugFromKey(templateId);
  return slug ? `pages:${slug}` : DEFAULT_PAGE_TEMPLATE_ID;
}

export function pageTemplateIdFromPreviewPage(page: string): string | null {
  if (page === DEFAULT_PAGE_TEMPLATE_ID) return DEFAULT_PAGE_TEMPLATE_ID;
  if (page.startsWith('pages:')) {
    const slug = page.slice('pages:'.length).trim();
    return slug ? `pages.${slug}` : DEFAULT_PAGE_TEMPLATE_ID;
  }
  return null;
}

export function isPageTemplatePreviewPage(page: string): boolean {
  return pageTemplateIdFromPreviewPage(page) !== null;
}

function readTemplateName(tpl: Record<string, unknown> | undefined, fallback: string): string {
  const name = tpl?.name;
  return typeof name === 'string' && name.trim() ? name.trim() : fallback;
}

function readAssignedCount(tpl: Record<string, unknown> | undefined): number {
  const n = tpl?.assignedPageCount;
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function listPageTemplateOrder(config: Record<string, unknown> | null): string[] {
  if (!config) return [DEFAULT_PAGE_TEMPLATE_ID];
  const order = config[PAGE_TEMPLATE_ORDER_KEY];
  const templates = templatesRecord(config);
  const ids = Array.isArray(order)
    ? (order as string[]).filter((id) => isPageTemplateKey(id) && templates[id])
    : [];
  if (!ids.includes(DEFAULT_PAGE_TEMPLATE_ID) && templates[DEFAULT_PAGE_TEMPLATE_ID]) {
    ids.unshift(DEFAULT_PAGE_TEMPLATE_ID);
  }
  if (!ids.length && templates[DEFAULT_PAGE_TEMPLATE_ID]) {
    return [DEFAULT_PAGE_TEMPLATE_ID];
  }
  return ids.length ? ids : [DEFAULT_PAGE_TEMPLATE_ID];
}

export function listPageTemplates(config: Record<string, unknown> | null): PageTemplateEntry[] {
  const templates = templatesRecord(config ?? {});
  return listPageTemplateOrder(config).map((id) => {
    const tpl = templates[id];
    const isDefault = id === DEFAULT_PAGE_TEMPLATE_ID;
    const fallbackName = isDefault ? 'Default page' : id.replace(/^pages\./, '');
    return {
      id,
      name: isDefault ? 'Default page' : readTemplateName(tpl, fallbackName),
      isDefault,
      basedOn: typeof tpl?.basedOn === 'string' ? tpl.basedOn : undefined,
      assignedPageCount: readAssignedCount(tpl),
    };
  });
}

export function pageTemplateDisplayName(
  config: Record<string, unknown> | null,
  previewPage: string
): string | null {
  const templateId = pageTemplateIdFromPreviewPage(previewPage);
  if (!templateId) return null;
  if (templateId === DEFAULT_PAGE_TEMPLATE_ID) return 'Default page';
  const entry = listPageTemplates(config).find((t) => t.id === templateId);
  return entry?.name ?? null;
}

export function slugifyPageTemplateName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 25);
}

export function pageTemplateKeyFromName(name: string): string {
  const slug = slugifyPageTemplateName(name);
  return slug ? `pages.${slug}` : '';
}

export function ensurePageTemplateRegistry(config: Record<string, unknown>): void {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  if (!templates[DEFAULT_PAGE_TEMPLATE_ID]) {
    templates[DEFAULT_PAGE_TEMPLATE_ID] = {
      name: 'Default page',
      sections: {},
      section_order: [],
    };
  } else {
    templates[DEFAULT_PAGE_TEMPLATE_ID].name = 'Default page';
  }

  const order = listPageTemplateOrder(config);
  for (const id of Object.keys(templates)) {
    if (isPageTemplateKey(id) && !order.includes(id)) {
      order.push(id);
    }
  }
  config[PAGE_TEMPLATE_ORDER_KEY] = order;
}

export type CreatePageTemplateResult =
  | { ok: true; templateId: string; previewPage: string }
  | { ok: false; error: string };

/** Clone a page template bucket and register it in theme config (in-memory until save). */
export function createPageTemplateInConfig(
  config: Record<string, unknown>,
  name: string,
  basedOnTemplateId: string
): CreatePageTemplateResult {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'Name is required' };
  if (trimmed.length > 25) return { ok: false, error: 'Name must be 25 characters or less' };

  const templateKey = pageTemplateKeyFromName(trimmed);
  if (!templateKey) return { ok: false, error: 'Enter a valid template name' };

  ensurePageTemplateRegistry(config);
  const templates = templatesRecord(config);
  if (templates[templateKey]) {
    return { ok: false, error: 'A template with this name already exists' };
  }

  const sourceId = isPageTemplateKey(basedOnTemplateId)
    ? basedOnTemplateId
    : DEFAULT_PAGE_TEMPLATE_ID;
  const source = templates[sourceId];
  if (!source) return { ok: false, error: 'Base template not found' };

  templates[templateKey] = {
    ...JSON.parse(JSON.stringify(source)),
    name: trimmed,
    basedOn: sourceId,
    assignedPageCount: 0,
  };

  const order = listPageTemplateOrder(config);
  if (!order.includes(templateKey)) {
    order.push(templateKey);
  }
  config[PAGE_TEMPLATE_ORDER_KEY] = order;

  return {
    ok: true,
    templateId: templateKey,
    previewPage: pageTemplatePreviewPage(templateKey),
  };
}
