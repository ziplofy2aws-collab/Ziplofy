import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from './create-theme-sidebar.types';
import { remapTemplateSchemaPath, templateBlueprintKey } from '../../utils/theme-editor-insert-section';

export const FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER = ['General', 'Typography'] as const;

const PANEL_GROUPS = new Set<string>(FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER);

const REVIEW_STARS_FIELD_KEYS = new Set([
  'style',
  'reviewCount',
  'color',
  'typographyPreset',
  'width',
  'alignment',
]);

const STYLE_OPTIONS = [
  { value: 'shaded', label: 'Shaded' },
  { value: 'default', label: 'Default' },
] as const;

const COLOR_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Link' },
] as const;

const TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'default', label: 'Default' },
  { value: 'body', label: 'Body' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'heading-5', label: 'Heading 5' },
] as const;

const FIT_FILL = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
] as const;

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const;

export function isFeaturedProductReviewStarsBlockNodeId(nodeId: string): boolean {
  return /^template:[^:]+:[^:]+:block:details:nested:review_stars$/.test(nodeId);
}

function blocksBaseFromNodeId(nodeId: string): string | null {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:review_stars$/);
  if (!m) return null;
  return `templates.${m[1]}.sections.${m[2]}.blocks.details.blocks.review_stars`;
}

export function featuredProductReviewStarsDefaultSettings(): Record<string, string | boolean> {
  return {
    style: 'shaded',
    reviewCount: true,
    color: 'link',
    typographyPreset: 'paragraph',
    width: 'fill',
    alignment: 'left',
  };
}

export function featuredProductReviewStarsFieldDefs(blocksBase: string): EditorFieldDef[] {
  const s = (key: string) => `${blocksBase}.settings.${key}`;
  return [
    {
      path: s('style'),
      type: 'select',
      label: 'Style',
      group: 'General',
      widget: 'select',
      sidebar: false,
      options: [...STYLE_OPTIONS],
    },
    {
      path: s('reviewCount'),
      type: 'boolean',
      label: 'Review count',
      group: 'General',
      sidebar: false,
    },
    {
      path: s('color'),
      type: 'select',
      label: 'Color',
      group: 'General',
      widget: 'segmented',
      sidebar: false,
      options: [...COLOR_OPTIONS],
    },
    {
      path: s('typographyPreset'),
      type: 'select',
      label: 'Preset',
      group: 'Typography',
      widget: 'select',
      sidebar: false,
      options: [...TYPOGRAPHY_PRESET_OPTIONS],
    },
    {
      path: s('width'),
      type: 'select',
      label: 'Width',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [...FIT_FILL],
    },
    {
      path: s('alignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Typography',
      widget: 'segmented',
      sidebar: false,
      options: [...ALIGNMENT_OPTIONS],
    },
  ];
}

export function featuredProductReviewStarsFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = blocksBaseFromNodeId(nodeId);
  return base ? featuredProductReviewStarsFieldDefs(base) : [];
}

export function featuredProductReviewStarsFieldDefsFromSchema(
  editorSchema: EditorSchemaDoc,
  nodeId: string
): EditorFieldDef[] {
  const m = nodeId.match(/^template:([^:]+):([^:]+):block:details:nested:review_stars$/);
  if (!m) return [];
  const [, tplId, secId] = m;
  const blueprint = templateBlueprintKey(secId);
  const tpl = editorSchema.templates?.find((t) => t.id === tplId);
  const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprint);
  const details = sec?.blocks?.find((b) => b.id === 'details');
  const reviewStars = details?.blocks?.find((b) => b.id === 'review_stars');
  const blocksBase = blocksBaseFromNodeId(nodeId);
  const schemaFields = reviewStars?.settingsFields ?? [];
  if (schemaFields.length) {
    return schemaFields.map((f) => ({
      ...f,
      path: remapTemplateSchemaPath(f.path, tplId, secId),
    }));
  }
  return blocksBase ? featuredProductReviewStarsFieldDefs(blocksBase) : [];
}

export const FEATURED_PRODUCT_REVIEW_STARS_DEFAULTS: Record<string, string | boolean> =
  featuredProductReviewStarsDefaultSettings();

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    style: 0,
    reviewCount: 1,
    color: 2,
    typographyPreset: 10,
    width: 11,
    alignment: 12,
  };
  return rank[key] ?? 50;
}

export function isFeaturedProductReviewStarsPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!REVIEW_STARS_FIELD_KEYS.has(key)) return false;
  if (!/\.blocks\.details\.blocks\.review_stars\.settings\./.test(field.path)) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isFeaturedProductReviewStarsPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isFeaturedProductReviewStarsPanelField);
}

export function groupFeaturedProductReviewStarsPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isFeaturedProductReviewStarsPanelField)) {
    const group = field.group ?? 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(
      group,
      [...list].sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path))
    );
  }
  return map;
}

function getNested(obj: Record<string, unknown> | null, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendFeaturedProductReviewStarsBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const fromConfig = getNested(config, field.path.split('.'));
    if (fromConfig !== undefined && fromConfig !== null) {
      next[field.path] =
        field.type === 'boolean' ? Boolean(fromConfig) : String(fromConfig);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = FEATURED_PRODUCT_REVIEW_STARS_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[field.path] = fallback;
  }
  return next;
}

export function prepareFeaturedProductReviewStarsSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .filter(isFeaturedProductReviewStarsPanelField)
    .sort((a, b) => {
      const ga = FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER.indexOf(
        (a.group ?? 'General') as (typeof FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER)[number]
      );
      const gb = FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER.indexOf(
        (b.group ?? 'General') as (typeof FEATURED_PRODUCT_REVIEW_STARS_PANEL_GROUP_ORDER)[number]
      );
      if (ga !== gb) return ga - gb;
      return fieldSortKey(a.path) - fieldSortKey(b.path);
    });
  return { ...node, label: 'Review stars', kind: 'block', fields };
}
