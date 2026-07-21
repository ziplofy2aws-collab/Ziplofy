import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import { filterSidebarSectionPanelFields } from './create-theme-field.utils';
import {
  isRichTextPanelField,
  RICH_TEXT_PANEL_GROUP_ORDER,
  sortRichTextPanelFields,
} from './theme-editor-rich-text-panel.utils';
import {
  isTextBlockPanelField,
  sortTextBlockPanelFields,
  textBlockDefaultSettings,
  textBlockFieldDefs,
} from './theme-editor-text-block-panel.utils';

export { RICH_TEXT_PANEL_GROUP_ORDER as NOT_FOUND_MAIN_PANEL_GROUP_ORDER };

const NOT_FOUND_MESSAGE_NODE_RE =
  /^template:404:not_found_main(?:_\d+)?:block:message$/;
const NOT_FOUND_SECTION_NODE_RE = /^template:404:not_found_main(?:_\d+)?$/;

const CONTAINER_SETTING_KEYS = new Set([
  'direction',
  'layoutAlignment',
  'position',
  'layoutGap',
  'sectionWidth',
  'height',
  'colorScheme',
  'backgroundMedia',
  'backgroundImageUrl',
  'backgroundImagePosition',
  'backgroundColor',
  'textColor',
  'backgroundOverlay',
  'overlayColor',
  'overlayOpacity',
  'borderStyle',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
]);

export function isNotFoundMainMessageBlockNodeId(nodeId: string): boolean {
  return NOT_FOUND_MESSAGE_NODE_RE.test(nodeId);
}

export function isNotFoundMainSectionNodeId(nodeId: string): boolean {
  return NOT_FOUND_SECTION_NODE_RE.test(nodeId);
}

function messageBlocksBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(/^template:(404):(not_found_main(?:_\d+)?):block:message$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.blocks.message`;
}

function sectionSettingsBaseFromNodeId(nodeId: string): string | null {
  const match = nodeId.match(/^template:(404):(not_found_main(?:_\d+)?)$/);
  if (!match) return null;
  return `templates.${match[1]}.sections.${match[2]}.settings`;
}

/** Container-style section settings (Layout → Padding), excluding heading block keys. */
export function notFoundMainContainerFieldDefs(settingsBase: string): EditorFieldDef[] {
  const s = (key: string) => `${settingsBase}.${key}`;
  return [
    {
      path: s('direction'),
      type: 'select',
      label: 'Direction',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
      ],
    },
    {
      path: s('layoutAlignment'),
      type: 'select',
      label: 'Alignment',
      group: 'Layout',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      path: s('position'),
      type: 'select',
      label: 'Position',
      group: 'Layout',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      path: s('layoutGap'),
      type: 'number',
      label: 'Gap',
      group: 'Layout',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('sectionWidth'),
      type: 'select',
      label: 'Width',
      group: 'Size',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'page', label: 'Page' },
        { value: 'full', label: 'Full' },
      ],
    },
    {
      path: s('height'),
      type: 'select',
      label: 'Height',
      group: 'Size',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
    },
    {
      path: s('colorScheme'),
      type: 'select',
      label: 'Color scheme',
      group: 'Appearance',
      widget: 'color-scheme',
      sidebar: true,
      options: [
        { value: 'scheme-1', label: 'Scheme 1' },
        { value: 'scheme-2', label: 'Scheme 2' },
        { value: 'scheme-3', label: 'Scheme 3' },
        { value: 'scheme-4', label: 'Scheme 4' },
      ],
    },
    {
      path: s('backgroundMedia'),
      type: 'select',
      label: 'Background media',
      group: 'Appearance',
      widget: 'select-inline',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'image', label: 'Image' },
      ],
    },
    {
      path: s('backgroundImageUrl'),
      type: 'text',
      label: 'Background image',
      group: 'Appearance',
      sidebar: true,
      placeholder: 'Paste image URL or upload',
    },
    {
      path: s('backgroundImagePosition'),
      type: 'select',
      label: 'Image fit',
      group: 'Appearance',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'fit', label: 'Fit' },
        { value: 'stretch', label: 'Stretch' },
      ],
    },
    {
      path: s('backgroundColor'),
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('textColor'),
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('backgroundOverlay'),
      type: 'boolean',
      label: 'Background overlay',
      group: 'Appearance',
      sidebar: true,
    },
    {
      path: s('overlayColor'),
      type: 'text',
      label: 'Overlay color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('overlayOpacity'),
      type: 'number',
      label: 'Overlay opacity',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('borderStyle'),
      type: 'select',
      label: 'Borders',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('cornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 40,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('paddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 120,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

export function notFoundMainContainerFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = sectionSettingsBaseFromNodeId(nodeId);
  return base ? notFoundMainContainerFieldDefs(base) : [];
}

export function isNotFoundMainPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (key === 'title' || key.startsWith('heading')) return false;
  if (!CONTAINER_SETTING_KEYS.has(key)) return false;
  if (!/\.sections\.[^.]+\.settings\./.test(field.path)) return false;
  return Boolean(field.group) || isRichTextPanelField(field);
}

export function prepareNotFoundMainSettingsNode(node: SidebarNode): SidebarNode {
  const injected = notFoundMainContainerFieldDefsFromNodeId(node.id);
  const baseFields = injected.length
    ? injected
    : filterSidebarSectionPanelFields(node.fields ?? [], isNotFoundMainPanelField);
  const fields = sortRichTextPanelFields(
    ensureNotFoundAppearanceFields(node.id, baseFields.filter(isNotFoundMainPanelField))
  );
  return { ...node, label: '404', kind: 'section', fields };
}

function ensureNotFoundAppearanceFields(
  sectionNodeId: string,
  fields: EditorFieldDef[]
): EditorFieldDef[] {
  const settingsBase = sectionSettingsBaseFromNodeId(sectionNodeId);
  if (!settingsBase) return fields;
  const has = (key: string) => fields.some((f) => f.path.endsWith(`.${key}`));
  const extras: EditorFieldDef[] = [];
  if (!has('backgroundColor')) {
    extras.push({
      path: `${settingsBase}.backgroundColor`,
      type: 'color',
      label: 'Background color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!has('textColor')) {
    extras.push({
      path: `${settingsBase}.textColor`,
      type: 'color',
      label: 'Text color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!has('overlayColor')) {
    extras.push({
      path: `${settingsBase}.overlayColor`,
      type: 'text',
      label: 'Overlay color',
      group: 'Appearance',
      widget: 'color',
      sidebar: true,
    });
  }
  if (!has('overlayOpacity')) {
    extras.push({
      path: `${settingsBase}.overlayOpacity`,
      type: 'number',
      label: 'Overlay opacity',
      group: 'Appearance',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    });
  }
  return extras.length ? [...fields, ...extras] : fields;
}

export function notFoundMainMessageFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const base = messageBlocksBaseFromNodeId(nodeId);
  return base ? textBlockFieldDefs(base) : [];
}

export function prepareNotFoundMainMessageSettingsNode(node: SidebarNode): SidebarNode {
  const injected = notFoundMainMessageFieldDefsFromNodeId(node.id);
  const fields = sortTextBlockPanelFields(
    (injected.length ? injected : node.fields ?? []).filter(isTextBlockPanelField)
  );
  return { ...node, label: 'Text', kind: 'block', fields };
}

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function seedFieldValues(
  values: Record<string, string | boolean>,
  defs: EditorFieldDef[],
  config: Record<string, unknown>,
  defaults?: Record<string, string | number | boolean>
): Record<string, string | boolean> {
  const next = { ...values };
  let changed = false;
  for (const field of defs) {
    if (next[field.path] !== undefined) continue;
    const key = field.path.split('.').pop() ?? '';
    const raw = getNested(config, field.path.split('.'));
    const fallback = defaults?.[key];
    const resolved = raw !== undefined ? raw : fallback;
    if (resolved === undefined) continue;
    if (field.type === 'boolean') {
      next[field.path] = Boolean(resolved);
    } else {
      next[field.path] = resolved == null ? '' : String(resolved);
    }
    changed = true;
  }
  return changed ? next : values;
}

/** Seed sidebar values for the 404 message text block from merged config. */
export function extendValuesForNotFoundMainMessage(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const base = messageBlocksBaseFromNodeId(nodeId);
  if (!base) return values;
  const defaults = {
    ...textBlockDefaultSettings('The link may be incorrect, or the page has been removed.'),
    width: 'fill',
    maxWidth: 'normal',
    alignment: 'center',
    typographyPreset: 'paragraph',
  };
  return seedFieldValues(values, textBlockFieldDefs(base), config, defaults);
}

export const NOT_FOUND_MAIN_CONTAINER_DEFAULTS: Record<string, string | number | boolean> = {
  direction: 'vertical',
  layoutAlignment: 'center',
  position: 'center',
  layoutGap: 16,
  sectionWidth: 'page',
  height: 'auto',
  colorScheme: 'scheme-1',
  backgroundMedia: 'none',
  backgroundImageUrl: '',
  backgroundImagePosition: 'cover',
  backgroundColor: 'default',
  textColor: 'default',
  backgroundOverlay: false,
  overlayColor: '#000000',
  overlayOpacity: 35,
  borderStyle: 'none',
  cornerRadius: 0,
  paddingTop: 72,
  paddingBottom: 64,
};

/** Seed sidebar values for the 404 section container panel. */
export function extendValuesForNotFoundMainSection(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const base = sectionSettingsBaseFromNodeId(nodeId);
  if (!base) return values;
  return seedFieldValues(
    values,
    notFoundMainContainerFieldDefs(base),
    config,
    NOT_FOUND_MAIN_CONTAINER_DEFAULTS
  );
}
