import type { EditorSchemaDoc } from '../create-theme/sidebar/create-theme-sidebar.types';

const ALL_PRODUCTS_TEMPLATE_ID = 'products';

function replaceTemplatePaths(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') {
    return value.split(from).join(to);
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceTemplatePaths(item, from, to));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceTemplatePaths(child, from, to);
    }
    return out;
  }
  return value;
}

/** Clone Default collection schema for the All products (`/collections/all`) template. */
export function withAllProductsPageSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const templates = schema.templates ?? [];
  if (templates.some((tpl) => tpl.id === ALL_PRODUCTS_TEMPLATE_ID)) {
    return schema;
  }

  const collection = templates.find((tpl) => tpl.id === 'collection');
  if (!collection) return schema;

  const products = replaceTemplatePaths(
    JSON.parse(JSON.stringify(collection)),
    'templates.collection',
    'templates.products'
  ) as (typeof templates)[number];

  products.id = ALL_PRODUCTS_TEMPLATE_ID;
  products.label = 'All products';
  products.description = 'All products catalog page (/collections/all)';

  return {
    ...schema,
    templates: [...templates, products],
  };
}
