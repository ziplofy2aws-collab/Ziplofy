/** Alternate collection templates stored under `config.templates` (Shopify-style `collection.{slug}` keys). */

export const COLLECTION_TEMPLATE_ORDER_KEY = 'collection_template_order';
/** urlHandle → stored themeTemplate (`default` | `collection.{slug}`). */
export const COLLECTION_TEMPLATE_ASSIGNMENTS_KEY = 'collection_template_assignments';
export const DEFAULT_COLLECTION_TEMPLATE_ID = 'collection';

export type CollectionTemplateEntry = {
  id: string;
  name: string;
  isDefault: boolean;
  basedOn?: string;
  assignedCollectionCount: number;
};

function templatesRecord(config: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const raw = config.templates;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as Record<string, Record<string, unknown>>;
}

export function isCollectionTemplateKey(templateId: string): boolean {
  return templateId === DEFAULT_COLLECTION_TEMPLATE_ID || templateId.startsWith('collection.');
}

export function collectionTemplateSlugFromKey(templateId: string): string | null {
  if (templateId === DEFAULT_COLLECTION_TEMPLATE_ID) return null;
  if (!templateId.startsWith('collection.')) return null;
  return templateId.slice('collection.'.length);
}

/** Preview page id: `collection` or `collection:my-template`. */
export function collectionTemplatePreviewPage(templateId: string): string {
  const slug = collectionTemplateSlugFromKey(templateId);
  return slug ? `collection:${slug}` : DEFAULT_COLLECTION_TEMPLATE_ID;
}

export function collectionTemplateIdFromPreviewPage(page: string): string | null {
  if (page === DEFAULT_COLLECTION_TEMPLATE_ID) return DEFAULT_COLLECTION_TEMPLATE_ID;
  if (page.startsWith('collection:')) {
    const slug = page.slice('collection:'.length).trim();
    return slug ? `collection.${slug}` : DEFAULT_COLLECTION_TEMPLATE_ID;
  }
  return null;
}

export function isCollectionTemplatePreviewPage(page: string): boolean {
  return collectionTemplateIdFromPreviewPage(page) !== null;
}

/** Map stored themeTemplate (`default` / `collection.foo`) to a config template key. */
export function collectionThemeTemplateToConfigId(themeTemplate?: string | null): string {
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (!normalized || normalized === 'default' || normalized === DEFAULT_COLLECTION_TEMPLATE_ID) {
    return DEFAULT_COLLECTION_TEMPLATE_ID;
  }
  if (normalized.startsWith(`${DEFAULT_COLLECTION_TEMPLATE_ID}.`)) return normalized;
  return DEFAULT_COLLECTION_TEMPLATE_ID;
}

/** Read collection urlHandle → themeTemplate assignments from theme JSON. */
export function readCollectionTemplateAssignments(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  if (!config) return {};
  const raw = config[COLLECTION_TEMPLATE_ASSIGNMENTS_KEY];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const out: Record<string, string> = {};
  for (const [handle, value] of Object.entries(raw as Record<string, unknown>)) {
    const key = handle.trim().toLowerCase();
    if (!key || typeof value !== 'string') continue;
    const normalized = value.trim().toLowerCase();
    if (normalized) out[key] = normalized;
  }
  return out;
}

/** Replace collection assignments in theme JSON and refresh assignment counts. */
export function writeCollectionTemplateAssignments(
  config: Record<string, unknown>,
  assignments: Record<string, string>
): void {
  ensureCollectionTemplateRegistry(config);
  const cleaned: Record<string, string> = {};
  for (const [handle, value] of Object.entries(assignments)) {
    const key = handle.trim().toLowerCase();
    if (!key) continue;
    const normalized = (value ?? 'default').trim().toLowerCase() || 'default';
    cleaned[key] = normalized === DEFAULT_COLLECTION_TEMPLATE_ID ? 'default' : normalized;
  }
  config[COLLECTION_TEMPLATE_ASSIGNMENTS_KEY] = cleaned;

  const counts: Record<string, number> = {};
  for (const value of Object.values(cleaned)) {
    const id = collectionThemeTemplateToConfigId(value);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const templates = templatesRecord(config);
  for (const id of listCollectionTemplateOrder(config)) {
    if (templates[id]) templates[id].assignedCollectionCount = counts[id] ?? 0;
  }
}

/** Resolve a collection template locally from the already-loaded theme JSON. */
export function resolveCollectionTemplateIdFromThemeConfig(
  config: Record<string, unknown> | null | undefined,
  urlHandle?: string | null
): string {
  const handle = (urlHandle ?? '').trim().toLowerCase();
  if (!handle || handle === 'preview') return DEFAULT_COLLECTION_TEMPLATE_ID;

  const assignments = readCollectionTemplateAssignments(config);
  const requested = collectionThemeTemplateToConfigId(assignments[handle]);
  const templates = templatesRecord(config ?? {});
  if (requested !== DEFAULT_COLLECTION_TEMPLATE_ID && templates[requested]) return requested;
  return DEFAULT_COLLECTION_TEMPLATE_ID;
}

function readTemplateName(tpl: Record<string, unknown> | undefined, fallback: string): string {
  const name = tpl?.name;
  return typeof name === 'string' && name.trim() ? name.trim() : fallback;
}

function readAssignedCount(tpl: Record<string, unknown> | undefined): number {
  const n = tpl?.assignedCollectionCount;
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function listCollectionTemplateOrder(config: Record<string, unknown> | null): string[] {
  if (!config) return [DEFAULT_COLLECTION_TEMPLATE_ID];
  const order = config[COLLECTION_TEMPLATE_ORDER_KEY];
  const templates = templatesRecord(config);
  const ids = Array.isArray(order)
    ? (order as string[]).filter((id) => isCollectionTemplateKey(id) && templates[id])
    : [];
  if (!ids.includes(DEFAULT_COLLECTION_TEMPLATE_ID) && templates[DEFAULT_COLLECTION_TEMPLATE_ID]) {
    ids.unshift(DEFAULT_COLLECTION_TEMPLATE_ID);
  }
  if (!ids.length && templates[DEFAULT_COLLECTION_TEMPLATE_ID]) {
    return [DEFAULT_COLLECTION_TEMPLATE_ID];
  }
  return ids.length ? ids : [DEFAULT_COLLECTION_TEMPLATE_ID];
}

export function listCollectionTemplates(
  config: Record<string, unknown> | null
): CollectionTemplateEntry[] {
  const templates = templatesRecord(config ?? {});
  return listCollectionTemplateOrder(config).map((id) => {
    const tpl = templates[id];
    const isDefault = id === DEFAULT_COLLECTION_TEMPLATE_ID;
    const fallbackName = isDefault ? 'Default collection' : id.replace(/^collection\./, '');
    return {
      id,
      name: readTemplateName(tpl, fallbackName),
      isDefault,
      basedOn: typeof tpl?.basedOn === 'string' ? tpl.basedOn : undefined,
      assignedCollectionCount: readAssignedCount(tpl),
    };
  });
}

export function collectionTemplateDisplayName(
  config: Record<string, unknown> | null,
  previewPage: string
): string | null {
  const templateId = collectionTemplateIdFromPreviewPage(previewPage);
  if (!templateId) return null;
  const entry = listCollectionTemplates(config).find((t) => t.id === templateId);
  return entry?.name ?? null;
}

export function slugifyCollectionTemplateName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 25);
}

export function collectionTemplateKeyFromName(name: string): string {
  const slug = slugifyCollectionTemplateName(name);
  return slug ? `collection.${slug}` : '';
}

export function ensureCollectionTemplateRegistry(config: Record<string, unknown>): void {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  if (!templates[DEFAULT_COLLECTION_TEMPLATE_ID]) {
    templates[DEFAULT_COLLECTION_TEMPLATE_ID] = {
      name: 'Default collection',
      sections: {},
      section_order: [],
    };
  } else if (!templates[DEFAULT_COLLECTION_TEMPLATE_ID].name) {
    templates[DEFAULT_COLLECTION_TEMPLATE_ID].name = 'Default collection';
  }

  const order = listCollectionTemplateOrder(config);
  for (const id of Object.keys(templates)) {
    if (isCollectionTemplateKey(id) && !order.includes(id)) {
      order.push(id);
    }
  }
  config[COLLECTION_TEMPLATE_ORDER_KEY] = order;

  if (
    !config[COLLECTION_TEMPLATE_ASSIGNMENTS_KEY] ||
    typeof config[COLLECTION_TEMPLATE_ASSIGNMENTS_KEY] !== 'object' ||
    Array.isArray(config[COLLECTION_TEMPLATE_ASSIGNMENTS_KEY])
  ) {
    config[COLLECTION_TEMPLATE_ASSIGNMENTS_KEY] = {};
  }
}

export type CreateCollectionTemplateResult =
  | { ok: true; templateId: string; previewPage: string }
  | { ok: false; error: string };

export function createCollectionTemplateInConfig(
  config: Record<string, unknown>,
  name: string,
  basedOnTemplateId: string
): CreateCollectionTemplateResult {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'Name is required' };
  if (trimmed.length > 25) return { ok: false, error: 'Name must be 25 characters or less' };

  const templateKey = collectionTemplateKeyFromName(trimmed);
  if (!templateKey) return { ok: false, error: 'Enter a valid template name' };

  ensureCollectionTemplateRegistry(config);
  const templates = templatesRecord(config);
  if (templates[templateKey]) {
    return { ok: false, error: 'A template with this name already exists' };
  }

  const sourceId = isCollectionTemplateKey(basedOnTemplateId)
    ? basedOnTemplateId
    : DEFAULT_COLLECTION_TEMPLATE_ID;
  const source = templates[sourceId];
  if (!source) return { ok: false, error: 'Base template not found' };

  templates[templateKey] = {
    ...JSON.parse(JSON.stringify(source)),
    name: trimmed,
    basedOn: sourceId,
    assignedCollectionCount: 0,
  };

  const order = listCollectionTemplateOrder(config);
  if (!order.includes(templateKey)) {
    order.push(templateKey);
  }
  config[COLLECTION_TEMPLATE_ORDER_KEY] = order;

  return {
    ok: true,
    templateId: templateKey,
    previewPage: collectionTemplatePreviewPage(templateKey),
  };
}
