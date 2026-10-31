import {
  layoutBlueprintKey,
  templateBlueprintKey,
} from '../../utils/theme-editor-insert-section';
import type { EditorFieldDef, EditorSchemaDoc } from './create-theme-sidebar.types';
import { isFaqAccordionBlockNodeId } from './theme-editor-faq-accordion-block-panel.utils';
import { isFaqAccordionRowNestedNodeId } from './theme-editor-faq-accordion-row-panel.utils';
import {
  headingBlockCanonicalFieldDefsForNodeId,
  headingBlockFieldDefsFromSchema,
  inferHeadingPanelGroup,
  isHeadingBlockNodeId,
  parseHeadingBlockNodeId,
  sortHeadingPanelFields,
} from './theme-editor-heading-block-panel.utils';

const COLLECTION_TITLE_MAX_WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'none', label: 'None' },
] as const;

const FAQ_HEADING_TO_TITLE_KEY: Record<string, string> = {
  headingWidth: 'titleWidth',
  headingMaxWidth: 'titleMaxWidth',
  headingAlignment: 'titleAlignment',
  headingTypographyPreset: 'titleTypographyPreset',
  headingFont: 'titleFont',
  headingFontSize: 'titleFontSize',
  headingLineHeight: 'titleLineHeight',
  headingLetterSpacing: 'titleLetterSpacing',
  headingTextCase: 'titleTextCase',
  headingWrap: 'titleWrap',
  headingColor: 'titleColor',
  headingBackgroundEnabled: 'titleBackgroundEnabled',
  headingBackgroundColor: 'titleBackgroundColor',
  headingCornerRadius: 'titleCornerRadius',
  headingPaddingTop: 'titlePaddingTop',
  headingPaddingBottom: 'titlePaddingBottom',
  headingPaddingLeft: 'titlePaddingLeft',
  headingPaddingRight: 'titlePaddingRight',
};

const TITLE_TO_FAQ_HEADING_KEY = Object.fromEntries(
  Object.entries(FAQ_HEADING_TO_TITLE_KEY).map(([headingKey, titleKey]) => [titleKey, headingKey])
) as Record<string, string>;

const FAQ_SECTION_INSTANCE_RE = /^(?:faq_section|faq)(?:_\d+)?$/i;

export function isFaqSectionHeadingBlockNodeId(nodeId: string): boolean {
  if (/faq/i.test(nodeId) && isHeadingBlockNodeId(nodeId)) return true;
  const parsed = parseHeadingBlockNodeId(nodeId);
  if (!parsed) return false;
  if (FAQ_SECTION_INSTANCE_RE.test(parsed.sectionInstanceId)) return true;
  if (/faq/i.test(parsed.sectionInstanceId)) return true;
  const blueprint =
    parsed.placement === 'layout'
      ? layoutBlueprintKey(parsed.sectionInstanceId)
      : templateBlueprintKey(parsed.sectionInstanceId);
  return blueprint === 'faq_section';
}

export function isFaqHeadingCollectionTitlePanelNode(node: {
  id: string;
  label: string;
  kind: string;
  headingPanel?: string;
  fields?: EditorFieldDef[];
}): boolean {
  if (isFaqAccordionBlockNodeId(node.id)) return false;
  if (isFaqAccordionRowNestedNodeId(node.id)) return false;
  if (node.headingPanel === 'collection-title') return true;
  if (
    node.kind === 'block' &&
    node.label === 'Heading' &&
    /:block:heading$/i.test(node.id) &&
    /faq/i.test(node.id) &&
    !/hero_main/i.test(node.id)
  ) {
    return true;
  }
  return isFaqHeadingBlockPanel(node.id, node.label, node.fields ?? []);
}

function faqSectionInstanceIdFromSettingsPath(path: string): string | null {
  const template = path.match(/\.sections\.([^.]+)\.settings\./);
  if (template?.[1]) return template[1]!;
  const layout = path.match(/^sections\.([^.]+)\.settings\./);
  return layout?.[1] ?? null;
}

function isFaqSectionInstanceId(sectionInstanceId: string): boolean {
  if (FAQ_SECTION_INSTANCE_RE.test(sectionInstanceId)) return true;
  if (/faq/i.test(sectionInstanceId)) return true;
  return (
    layoutBlueprintKey(sectionInstanceId) === 'faq_section' ||
    templateBlueprintKey(sectionInstanceId) === 'faq_section'
  );
}

/** FAQ heading styles live on section settings (not hero block settings). */
export function isFaqHeadingBlockFields(fields: EditorFieldDef[]): boolean {
  return fields.some((field) => {
    const key = field.path.split('.').pop() ?? '';
    if (
      key !== 'title' &&
      key !== 'heading' &&
      key !== 'headingWidth' &&
      key !== 'headingMaxWidth' &&
      key !== 'headingTypographyPreset'
    ) {
      return false;
    }
    if (field.path.includes('hero_main')) return false;
    const sectionId = faqSectionInstanceIdFromSettingsPath(field.path);
    if (!sectionId) return false;
    return isFaqSectionInstanceId(sectionId);
  });
}

export function isFaqHeadingBlockPanel(
  nodeId: string,
  nodeLabel: string,
  fields: EditorFieldDef[]
): boolean {
  if (isFaqAccordionBlockNodeId(nodeId)) return false;
  if (isFaqAccordionRowNestedNodeId(nodeId)) return false;
  if (fields.some((f) => /\.blocks\.accordion\.settings\./.test(f.path))) return false;
  if (fields.some((f) => /\.blocks\.accordion\.blocks\.[^.]+\.settings\./.test(f.path))) return false;

  const isHeading =
    isHeadingBlockNodeId(nodeId) ||
    nodeLabel === 'Heading' ||
    fields.some((f) => {
      const key = f.path.split('.').pop() ?? '';
      if (key === 'headingTypographyPreset' && /\.blocks\.accordion\.settings\./.test(f.path)) {
        return false;
      }
      return key === 'headingWidth' || key === 'headingMaxWidth' || key === 'headingTypographyPreset';
    });
  if (!isHeading) return false;
  if (/faq/i.test(nodeId)) return true;
  return isFaqSectionHeadingBlockNodeId(nodeId) || isFaqHeadingBlockFields(fields);
}

function remapPathKey(path: string, keyMap: Record<string, string>): string {
  const key = path.split('.').pop() ?? '';
  const mapped = keyMap[key];
  if (!mapped || mapped === key) return path;
  return `${path.slice(0, -(key.length + 1))}.${mapped}`;
}

export function mapFaqHeadingPathToCollectionTitlePath(path: string): string {
  if (path.endsWith('.heading')) {
    return path.replace(/\.heading$/, '.title');
  }
  return remapPathKey(path, FAQ_HEADING_TO_TITLE_KEY);
}

export function mapCollectionTitlePathToFaqHeadingPath(path: string): string {
  const key = path.split('.').pop() ?? '';
  if (key === 'title') return path;
  return remapPathKey(path, TITLE_TO_FAQ_HEADING_KEY);
}

function collectionTitleGroupForHeadingKey(key: string): string {
  return inferHeadingPanelGroup(key) ?? 'Settings';
}

function settingsBaseFromMappedTitleFields(fields: EditorFieldDef[]): string {
  const sample =
    fields.find((f) => f.path.endsWith('.title')) ??
    fields.find((f) => f.path.endsWith('.titleWidth')) ??
    fields.find((f) => /\.title[A-Z]/.test(f.path));
  if (!sample) return '';
  const key = sample.path.split('.').pop() ?? '';
  return sample.path.slice(0, -(key.length + 1));
}

/** Ensure mapped collection-title fields include appearance + padding (sparse API schemas). */
export function enrichMappedCollectionTitleFields(fields: EditorFieldDef[]): EditorFieldDef[] {
  const base = settingsBaseFromMappedTitleFields(fields);
  if (!base) return fields;

  const byKey = new Map<string, EditorFieldDef>();
  for (const field of fields) {
    byKey.set(field.path.split('.').pop() ?? '', field);
  }

  const ensure = (key: string, def: Omit<EditorFieldDef, 'path'>) => {
    if (!byKey.has(key)) {
      byKey.set(key, { ...def, path: `${base}.${key}` });
    }
  };

  ensure('titleBackgroundEnabled', {
    type: 'boolean',
    label: 'Background',
    group: 'Appearance',
    widget: 'toggle',
  });
  ensure('titleBackgroundColor', {
    type: 'text',
    label: 'Background color',
    group: 'Appearance',
    widget: 'color',
  });
  ensure('titleCornerRadius', {
    type: 'number',
    label: 'Corner radius',
    group: 'Appearance',
    widget: 'slider',
    min: 0,
    max: 50,
    step: 1,
    unit: 'px',
  });
  ensure('titlePaddingTop', {
    type: 'number',
    label: 'Top',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
  });
  ensure('titlePaddingBottom', {
    type: 'number',
    label: 'Bottom',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
  });
  ensure('titlePaddingLeft', {
    type: 'number',
    label: 'Left',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
  });
  ensure('titlePaddingRight', {
    type: 'number',
    label: 'Right',
    group: 'Padding',
    widget: 'slider',
    min: 0,
    max: 100,
    step: 1,
    unit: 'px',
  });

  const maxWidth = byKey.get('titleMaxWidth');
  if (maxWidth) {
    byKey.set('titleMaxWidth', {
      ...maxWidth,
      options: [...COLLECTION_TITLE_MAX_WIDTH_OPTIONS],
    });
  }

  return Array.from(byKey.values());
}

export function mapFaqHeadingFieldsToCollectionTitleFields(
  fields: EditorFieldDef[]
): EditorFieldDef[] {
  const mapped = fields
    .map((field) => {
      const key = field.path.split('.').pop() ?? '';
      if (key === 'title') {
        return { ...field, group: field.group ?? 'Text' };
      }
      if (key === 'heading') {
        return {
          ...field,
          path: field.path.replace(/\.heading$/, '.title'),
          group: field.group ?? 'Text',
        };
      }
      const titleKey = FAQ_HEADING_TO_TITLE_KEY[key];
      if (!titleKey) return null;
      const headingKey = key;
      return {
        ...field,
        path: mapFaqHeadingPathToCollectionTitlePath(field.path),
        group: field.group ?? collectionTitleGroupForHeadingKey(headingKey),
      };
    })
    .filter((field): field is EditorFieldDef => Boolean(field));

  return enrichMappedCollectionTitleFields(mapped);
}

/** Merge schema + canonical FAQ heading fields so the collection-title panel is always complete. */
export function mergeFaqHeadingBlockFieldDefs(
  editorSchema: EditorSchemaDoc | null | undefined,
  nodeId: string,
  existing?: EditorFieldDef[]
): EditorFieldDef[] {
  const fromSchema =
    (existing?.length ?? 0) > 0
      ? existing!
      : editorSchema
        ? headingBlockFieldDefsFromSchema(editorSchema, nodeId)
        : [];
  const canonical = headingBlockCanonicalFieldDefsForNodeId(nodeId);
  const byKey = new Map<string, EditorFieldDef>();

  for (const field of canonical) {
    const key = field.path.split('.').pop() ?? '';
    byKey.set(key, field);
  }
  for (const field of fromSchema) {
    const key = field.path.split('.').pop() ?? '';
    const base = byKey.get(key);
    byKey.set(
      key,
      base
        ? {
            ...base,
            ...field,
            path: field.path,
            group: field.group ?? base.group,
            widget: field.widget ?? base.widget,
            options: field.options?.length ? field.options : base.options,
          }
        : field
    );
  }

  return sortHeadingPanelFields(Array.from(byKey.values()));
}

export function mapFaqHeadingValuesToCollectionTitleValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[]
): Record<string, string | boolean> {
  const out = { ...values };

  for (const field of fields) {
    const titlePath = mapFaqHeadingPathToCollectionTitlePath(field.path);
    if (titlePath !== field.path && values[field.path] !== undefined) {
      out[titlePath] = values[field.path]!;
    }
  }

  for (const path of Object.keys(values)) {
    const key = path.split('.').pop() ?? '';
    if (!FAQ_HEADING_TO_TITLE_KEY[key]) continue;
    const titlePath = mapFaqHeadingPathToCollectionTitlePath(path);
    if (titlePath !== path) {
      out[titlePath] = values[path]!;
    }
  }

  return out;
}
