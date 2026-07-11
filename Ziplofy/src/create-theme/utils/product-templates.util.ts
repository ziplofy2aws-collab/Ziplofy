/** Alternate product templates stored under `config.templates` (Shopify-style `product.{slug}` keys). */

export const PRODUCT_TEMPLATE_ORDER_KEY = 'product_template_order';
export const DEFAULT_PRODUCT_TEMPLATE_ID = 'product';

export type ProductTemplateEntry = {
  id: string;
  name: string;
  isDefault: boolean;
  basedOn?: string;
  assignedProductCount: number;
};

function templatesRecord(config: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const raw = config.templates;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as Record<string, Record<string, unknown>>;
}

import { DEFAULT_COLLECTION_TEMPLATE_ID } from './collection-templates.util';
import {
  DEFAULT_BLOG_POSTS_TEMPLATE_ID,
  DEFAULT_BLOGS_TEMPLATE_ID,
} from './blog-templates.util';

export function isProductTemplateKey(templateId: string): boolean {
  return templateId === DEFAULT_PRODUCT_TEMPLATE_ID || templateId.startsWith('product.');
}

/** Map alternate template config keys to their schema blueprint ids. */
export function schemaTemplateIdForConfigKey(templateId: string): string {
  if (templateId.startsWith('product.')) return DEFAULT_PRODUCT_TEMPLATE_ID;
  if (templateId.startsWith('collection.')) return DEFAULT_COLLECTION_TEMPLATE_ID;
  if (templateId.startsWith(`${DEFAULT_BLOGS_TEMPLATE_ID}.`)) return DEFAULT_BLOGS_TEMPLATE_ID;
  if (templateId.startsWith(`${DEFAULT_BLOG_POSTS_TEMPLATE_ID}.`)) return DEFAULT_BLOG_POSTS_TEMPLATE_ID;
  return templateId;
}

export function productTemplateSlugFromKey(templateId: string): string | null {
  if (templateId === DEFAULT_PRODUCT_TEMPLATE_ID) return null;
  if (!templateId.startsWith('product.')) return null;
  return templateId.slice('product.'.length);
}

/** Preview page id: `product` or `product:my-template`. */
export function productTemplatePreviewPage(templateId: string): string {
  const slug = productTemplateSlugFromKey(templateId);
  return slug ? `product:${slug}` : DEFAULT_PRODUCT_TEMPLATE_ID;
}

export function productTemplateIdFromPreviewPage(page: string): string | null {
  if (page === DEFAULT_PRODUCT_TEMPLATE_ID) return DEFAULT_PRODUCT_TEMPLATE_ID;
  if (page.startsWith('product:')) {
    const slug = page.slice('product:'.length).trim();
    return slug ? `product.${slug}` : DEFAULT_PRODUCT_TEMPLATE_ID;
  }
  return null;
}

export function isProductTemplatePreviewPage(page: string): boolean {
  return productTemplateIdFromPreviewPage(page) !== null;
}

function readTemplateName(tpl: Record<string, unknown> | undefined, fallback: string): string {
  const name = tpl?.name;
  return typeof name === 'string' && name.trim() ? name.trim() : fallback;
}

function readAssignedCount(tpl: Record<string, unknown> | undefined): number {
  const n = tpl?.assignedProductCount;
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function listProductTemplateOrder(config: Record<string, unknown> | null): string[] {
  if (!config) return [DEFAULT_PRODUCT_TEMPLATE_ID];
  const order = config[PRODUCT_TEMPLATE_ORDER_KEY];
  const templates = templatesRecord(config);
  const ids = Array.isArray(order)
    ? (order as string[]).filter((id) => isProductTemplateKey(id) && templates[id])
    : [];
  if (!ids.includes(DEFAULT_PRODUCT_TEMPLATE_ID) && templates[DEFAULT_PRODUCT_TEMPLATE_ID]) {
    ids.unshift(DEFAULT_PRODUCT_TEMPLATE_ID);
  }
  if (!ids.length && templates[DEFAULT_PRODUCT_TEMPLATE_ID]) {
    return [DEFAULT_PRODUCT_TEMPLATE_ID];
  }
  return ids.length ? ids : [DEFAULT_PRODUCT_TEMPLATE_ID];
}

export function listProductTemplates(config: Record<string, unknown> | null): ProductTemplateEntry[] {
  const templates = templatesRecord(config ?? {});
  return listProductTemplateOrder(config).map((id) => {
    const tpl = templates[id];
    const isDefault = id === DEFAULT_PRODUCT_TEMPLATE_ID;
    const fallbackName = isDefault ? 'Default product' : id.replace(/^product\./, '');
    return {
      id,
      name: readTemplateName(tpl, fallbackName),
      isDefault,
      basedOn: typeof tpl?.basedOn === 'string' ? tpl.basedOn : undefined,
      assignedProductCount: readAssignedCount(tpl),
    };
  });
}

export function productTemplateDisplayName(
  config: Record<string, unknown> | null,
  previewPage: string
): string | null {
  const templateId = productTemplateIdFromPreviewPage(previewPage);
  if (!templateId) return null;
  const entry = listProductTemplates(config).find((t) => t.id === templateId);
  return entry?.name ?? null;
}

export function slugifyProductTemplateName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 25);
}

export function productTemplateKeyFromName(name: string): string {
  const slug = slugifyProductTemplateName(name);
  return slug ? `product.${slug}` : '';
}

export function ensureProductTemplateRegistry(config: Record<string, unknown>): void {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  if (!templates[DEFAULT_PRODUCT_TEMPLATE_ID]) {
    templates[DEFAULT_PRODUCT_TEMPLATE_ID] = {
      name: 'Default product',
      sections: {},
      section_order: [],
    };
  } else if (!templates[DEFAULT_PRODUCT_TEMPLATE_ID].name) {
    templates[DEFAULT_PRODUCT_TEMPLATE_ID].name = 'Default product';
  }

  const order = listProductTemplateOrder(config);
  for (const id of Object.keys(templates)) {
    if (isProductTemplateKey(id) && !order.includes(id)) {
      order.push(id);
    }
  }
  config[PRODUCT_TEMPLATE_ORDER_KEY] = order;
}

export type CreateProductTemplateResult =
  | { ok: true; templateId: string; previewPage: string }
  | { ok: false; error: string };

/** Clone a product template bucket and register it in theme config (in-memory until save). */
export function createProductTemplateInConfig(
  config: Record<string, unknown>,
  name: string,
  basedOnTemplateId: string
): CreateProductTemplateResult {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: 'Name is required' };
  if (trimmed.length > 25) return { ok: false, error: 'Name must be 25 characters or less' };

  const templateKey = productTemplateKeyFromName(trimmed);
  if (!templateKey) return { ok: false, error: 'Enter a valid template name' };

  ensureProductTemplateRegistry(config);
  const templates = templatesRecord(config);
  if (templates[templateKey]) {
    return { ok: false, error: 'A template with this name already exists' };
  }

  const sourceId = isProductTemplateKey(basedOnTemplateId)
    ? basedOnTemplateId
    : DEFAULT_PRODUCT_TEMPLATE_ID;
  const source = templates[sourceId];
  if (!source) return { ok: false, error: 'Base template not found' };

  templates[templateKey] = {
    ...JSON.parse(JSON.stringify(source)),
    name: trimmed,
    basedOn: sourceId,
    assignedProductCount: 0,
  };

  const order = listProductTemplateOrder(config);
  if (!order.includes(templateKey)) {
    order.push(templateKey);
  }
  config[PRODUCT_TEMPLATE_ORDER_KEY] = order;

  return {
    ok: true,
    templateId: templateKey,
    previewPage: productTemplatePreviewPage(templateKey),
  };
}
