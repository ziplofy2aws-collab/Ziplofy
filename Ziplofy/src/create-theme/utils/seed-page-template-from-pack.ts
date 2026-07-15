import type { EditorSchemaDoc } from '../../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import { ensureCollectionPageTemplateBlocks, ensureAllProductsPageTemplateBlocks } from '../../utils/collection-page-preset.util';
import {
  ensureBlogPostsPageTemplateBlocks,
  ensureBlogsPageTemplateBlocks,
} from '../../utils/blog-page-preset.util';
import { ensurePasswordPageTemplateBlocks } from '../../utils/password-page-preset.util';
import { ensureNotFoundPageTemplateBlocks } from '../../utils/not-found-page-preset.util';
import { creatorTemplateHasSections } from '../../utils/theme-editor-static-pack';
import {
  extendValuesForTemplateInstance,
  templateBlueprintKey,
} from '../../utils/theme-editor-insert-section';

/** Page types that get a one-time in-memory starter from the theme pack when the template bucket is empty. */
export const PACK_STARTER_TEMPLATE_IDS = new Set([
  'product',
  'collection',
  'products',
  'cart',
  'collections-list',
  'blogs',
  'blog-posts',
  'password',
  '404',
]);

function packKeyForTemplateId(templateId: string): string {
  if (templateId.startsWith('product.')) return 'product';
  if (templateId.startsWith('collection.')) return 'collection';
  if (templateId.startsWith('blogs.')) return 'blogs';
  if (templateId.startsWith('blog-posts.')) return 'blog-posts';
  return templateId;
}

export function seedTemplateFromPackIfEmpty(
  config: Record<string, unknown>,
  templateId: string,
  packDefault: Record<string, unknown>
): boolean {
  const packKey = packKeyForTemplateId(templateId);
  if (!PACK_STARTER_TEMPLATE_IDS.has(packKey)) return false;
  if (creatorTemplateHasSections(config, templateId)) return false;

  const packTemplates = packDefault.templates as
    | Record<string, Record<string, unknown>>
    | undefined;
  const defTpl = packTemplates?.[packKey];
  if (!defTpl || typeof defTpl !== 'object') {
    if (packKey === 'products' && packTemplates?.collection) {
      if (!config.templates || typeof config.templates !== 'object') {
        config.templates = {};
      }
      const templates = config.templates as Record<string, Record<string, unknown>>;
      const seeded = JSON.parse(JSON.stringify(packTemplates.collection)) as Record<string, unknown>;
      seeded.name = 'All products';
      const titleBlock = (
        (seeded.sections as Record<string, { blocks?: Record<string, { settings?: { text?: string } }> }> | undefined)
          ?.collection_heading?.blocks?.title
      );
      if (titleBlock?.settings) {
        titleBlock.settings.text = 'All products';
      }
      templates[templateId] = seeded;
      return true;
    }
    if (packKey === 'collection') return ensureCollectionPageTemplateBlocks(config);
    if (packKey === 'products') return ensureAllProductsPageTemplateBlocks(config);
    if (packKey === 'blogs') return ensureBlogsPageTemplateBlocks(config);
    if (packKey === 'blog-posts') return ensureBlogPostsPageTemplateBlocks(config);
    if (packKey === 'password') return ensurePasswordPageTemplateBlocks(config);
    if (packKey === '404') return ensureNotFoundPageTemplateBlocks(config);
    return false;
  }

  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  const seeded = JSON.parse(JSON.stringify(defTpl)) as Record<string, unknown>;
  if (templateId.startsWith('product.')) {
    const existing = templates[templateId];
    seeded.name = existing?.name ?? templateId.replace(/^product\./, '');
    seeded.basedOn = existing?.basedOn ?? 'product';
    seeded.assignedProductCount = existing?.assignedProductCount ?? 0;
  } else if (templateId.startsWith('collection.')) {
    const existing = templates[templateId];
    seeded.name = existing?.name ?? templateId.replace(/^collection\./, '');
    seeded.basedOn = existing?.basedOn ?? 'collection';
    seeded.assignedCollectionCount = existing?.assignedCollectionCount ?? 0;
  } else if (templateId.startsWith('blogs.')) {
    const existing = templates[templateId];
    seeded.name = existing?.name ?? templateId.replace(/^blogs\./, '');
    seeded.basedOn = existing?.basedOn ?? 'blogs';
    seeded.assignedBlogCount = existing?.assignedBlogCount ?? 0;
  } else if (templateId.startsWith('blog-posts.')) {
    const existing = templates[templateId];
    seeded.name = existing?.name ?? templateId.replace(/^blog-posts\./, '');
    seeded.basedOn = existing?.basedOn ?? 'blog-posts';
    seeded.assignedBlogPostCount = existing?.assignedBlogPostCount ?? 0;
  }
  templates[templateId] = seeded;
  const tpl = templates[templateId];
  if (!tpl.sections || typeof tpl.sections !== 'object') tpl.sections = {};
  if (!Array.isArray(tpl.section_order)) tpl.section_order = [];
  return true;
}

/** After seeding, merge sidebar `values` for all sections in the template. */
export function extendValuesForSeededTemplate(
  values: Record<string, string | boolean>,
  schema: EditorSchemaDoc,
  templateId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const tpl = (
    config.templates as Record<string, { section_order?: string[] }> | undefined
  )?.[templateId];
  const order = Array.isArray(tpl?.section_order) ? tpl.section_order : [];
  let next = { ...values };
  for (const instanceId of order) {
    const blueprint = templateBlueprintKey(instanceId);
    next = extendValuesForTemplateInstance(next, schema, templateId, blueprint, instanceId, config);
  }
  return next;
}
