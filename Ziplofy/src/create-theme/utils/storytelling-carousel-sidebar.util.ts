import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  isStorytellingCarouselCardBlockNodeId,
  isStorytellingCarouselCardHeadingBlockNodeId,
  isStorytellingCarouselCardImageBlockNodeId,
  isStorytellingCarouselCardTextBlockNodeId,
  isStorytellingCarouselContentGroupNodeId,
  isStorytellingCarouselHeaderBlockNodeId,
  isStorytellingCarouselHeaderGroupNodeId,
  isStorytellingCarouselSectionInstanceId,
  storytellingCarouselBlockFieldDefs,
  storytellingCarouselBlockFieldDefsFromNodeId,
  STORYTELLING_CAROUSEL_HEADER_FIELD_KEYS,
} from '../sidebar/theme-editor-storytelling-carousel-block-panel.utils';
import {
  storytellingCarouselCardFieldDefs,
  storytellingCarouselCardFieldDefsFromNodeId,
} from '../sidebar/theme-editor-storytelling-carousel-card-panel.utils';
import {
  storytellingCarouselContentGroupFieldDefs,
  storytellingCarouselContentGroupFieldDefsFromNodeId,
} from '../sidebar/theme-editor-storytelling-carousel-content-group-panel.utils';
import {
  storytellingCarouselHeaderCustomSizeFieldDefs,
  storytellingCarouselHeaderFieldDefs,
  storytellingCarouselHeaderFieldDefsFromNodeId,
} from '../sidebar/theme-editor-storytelling-carousel-header-panel.utils';

export const STORYTELLING_CAROUSEL_SECTION_BLOCK_ORDER = ['header', 'content'] as const;
export const STORYTELLING_CAROUSEL_HEADER_CHILD_ORDER = ['heading'] as const;
export const STORYTELLING_CAROUSEL_CARD_CHILD_ORDER = ['image', 'heading', 'text'] as const;
export const STORYTELLING_CAROUSEL_DEFAULT_SLIDE_IDS = ['slide_1', 'slide_2', 'slide_3'] as const;

function fieldPreview(
  field: EditorFieldDef,
  values: Record<string, string | boolean>
): string | undefined {
  const raw = values[field.path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (field.type === 'boolean') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

function readConfigAtPath(config: Record<string, unknown> | null, pathParts: string[]): unknown {
  let cur: unknown = config;
  for (const p of pathParts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function readConfigBlockOrder(
  config: Record<string, unknown> | null,
  pathParts: string[]
): string[] | null {
  const raw = readConfigAtPath(config, pathParts);
  return Array.isArray(raw) ? (raw as string[]) : null;
}

export function storytellingCarouselSlideIds(
  config: Record<string, unknown> | null,
  blocksPath: string[],
  blockOrderPath: string[]
): string[] {
  const order = readConfigBlockOrder(config, blockOrderPath) ?? [];
  const blocksObject = readConfigAtPath(config, blocksPath);
  const blocksRecord =
    blocksObject && typeof blocksObject === 'object' && !Array.isArray(blocksObject)
      ? (blocksObject as Record<string, unknown>)
      : {};
  const ids = (order.length ? order : Object.keys(blocksRecord)).filter((id) => {
    const block = blocksRecord[id] as { type?: string } | undefined;
    if (!block?.type) return true;
    return block.type === 'carousel-slide' || block.type === 'carousel_slide';
  });
  return ids.length ? ids : [...STORYTELLING_CAROUSEL_DEFAULT_SLIDE_IDS];
}

function storytellingCarouselSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

function buildCardNode(
  prefix: string,
  sectionBase: string,
  slideId: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>
): SidebarNode {
  const cardPrefix = `${prefix}:block:content:nested:${slideId}`;
  const settingsBase = `${sectionBase}.blocks.${slideId}.settings`;

  const imageFields = storytellingCarouselBlockFieldDefs(settingsBase, 'image');
  const headingFields = storytellingCarouselBlockFieldDefs(settingsBase, 'heading');
  const textFields = storytellingCarouselBlockFieldDefs(settingsBase, 'text');
  const cardFields = storytellingCarouselCardFieldDefs(settingsBase);
  const headingPreviewField = headingFields.find((f) => f.path.endsWith('.title'));
  const textPreviewField = textFields.find((f) => f.path.endsWith('.description'));

  const cardChildren = reorderSidebarChildren(
    [
      { id: `${cardPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${cardPrefix}:nested:image`,
        label: 'Image',
        kind: 'block',
        icon: 'image',
        fields: imageFields,
      },
      {
        id: `${cardPrefix}:nested:heading`,
        label: 'Heading',
        kind: 'block',
        icon: 'text',
        preview: headingPreviewField ? fieldPreview(headingPreviewField, values) : undefined,
        fields: headingFields,
      },
      {
        id: `${cardPrefix}:nested:text`,
        label: 'Text',
        kind: 'block',
        icon: 'text',
        preview: textPreviewField ? fieldPreview(textPreviewField, values) : undefined,
        fields: textFields,
      },
    ],
    listKeyBlockChildren(cardPrefix),
    itemOrder
  );

  return {
    id: cardPrefix,
    label: 'Card',
    kind: 'block',
    icon: 'product-card',
    showVisibilityToggle: true,
    showDeleteButton: true,
    fields: cardFields,
    children: cardChildren,
    childrenListKey: listKeyBlockChildren(cardPrefix),
  };
}

/** Shopify Carousel — Header → Heading; Carousel content → Card → Image / Heading / Text. */
export function mapStorytellingCarouselBlockNodes(
  prefix: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  blockOrderPath: string[]
): SidebarNode[] {
  const sectionBase = storytellingCarouselSectionBase(prefix);
  const headerPrefix = `${prefix}:block:header`;
  const contentPrefix = `${prefix}:block:content`;
  const blocksPath = blocksBase.split('.');

  const headerFields = storytellingCarouselBlockFieldDefs(`${sectionBase}.settings`, 'header');
  const headingPreviewField = headerFields.find((f) => f.path.endsWith('.heading'));

  const headerGroupFields = [
    ...storytellingCarouselHeaderFieldDefs(`${sectionBase}.settings`),
    ...storytellingCarouselHeaderCustomSizeFieldDefs(`${sectionBase}.settings`),
  ];

  const headerChildren = reorderSidebarChildren(
    [
      { id: `${headerPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${headerPrefix}:nested:heading`,
        label: 'Header',
        kind: 'block',
        icon: 'text',
        preview: headingPreviewField ? fieldPreview(headingPreviewField, values) : undefined,
        fields: headerFields,
      },
    ],
    listKeyBlockChildren(headerPrefix),
    itemOrder
  );

  const headerNode: SidebarNode = {
    id: headerPrefix,
    label: 'Header',
    kind: 'block',
    icon: 'group',
    fields: headerGroupFields,
    children: headerChildren,
    childrenListKey: listKeyBlockChildren(headerPrefix),
  };

  const slideIds = storytellingCarouselSlideIds(config, blocksPath, blockOrderPath);
  const cardNodes = slideIds.map((slideId) =>
    buildCardNode(prefix, sectionBase, slideId, values, itemOrder)
  );

  const contentChildren = reorderSidebarChildren(
    [
      { id: `${contentPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      ...cardNodes,
    ],
    listKeyBlockChildren(contentPrefix),
    itemOrder
  );

  const contentFields = storytellingCarouselContentGroupFieldDefs(`${sectionBase}.settings`);

  const contentNode: SidebarNode = {
    id: contentPrefix,
    label: 'Carousel content',
    kind: 'block',
    icon: 'group',
    fields: contentFields,
    children: contentChildren,
    childrenListKey: listKeyBlockChildren(contentPrefix),
  };

  return reorderSidebarChildren([headerNode, contentNode], sectionChildrenListKey, itemOrder);
}

export function storytellingCarouselStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  blocksPath: string[],
  blockOrderPath: string[]
): Record<string, string[]> {
  const headerPrefix = `${prefix}:block:header`;
  const contentPrefix = `${prefix}:block:content`;
  const slideIds = storytellingCarouselSlideIds(config, blocksPath, blockOrderPath);

  const out: Record<string, string[]> = {
    [sectionChildrenListKey]: [headerPrefix, contentPrefix],
    [listKeyBlockChildren(headerPrefix)]: [
      `${headerPrefix}:inner-add-block`,
      `${headerPrefix}:nested:heading`,
    ],
    [listKeyBlockChildren(contentPrefix)]: [
      `${contentPrefix}:inner-add-block`,
      ...slideIds.map((id) => `${contentPrefix}:nested:${id}`),
    ],
  };

  for (const slideId of slideIds) {
    const cardPrefix = `${contentPrefix}:nested:${slideId}`;
    out[listKeyBlockChildren(cardPrefix)] = [
      `${cardPrefix}:inner-add-block`,
      `${cardPrefix}:nested:image`,
      `${cardPrefix}:nested:heading`,
      `${cardPrefix}:nested:text`,
    ];
  }

  return out;
}

export function storytellingCarouselLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string,
  config: Record<string, unknown> | null,
  layoutKey: string
): Record<string, string[]> {
  return storytellingCarouselStructureOrder(
    prefix,
    sectionChildrenListKey,
    config,
    ['sections', layoutKey, 'blocks'],
    ['sections', layoutKey, 'block_order']
  );
}

const SECTION_LEVEL_FIELD_KEYS = new Set([
  'columns',
  'mobileColumns',
  'sectionWidth',
  'horizontalGap',
  'colorScheme',
  'navIcon',
  'navIconBackground',
  'paddingTop',
  'paddingBottom',
  'customCss',
]);

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  ...Object.fromEntries(
    [...STORYTELLING_CAROUSEL_HEADER_FIELD_KEYS].map((key) => [key, 'header:nested:heading'])
  ),
};

function storytellingFieldSidebarNodeId(settingsBase: string, blockSuffix: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) {
    return `template:${tpl[1]}:${tpl[2]}:block:${blockSuffix}`;
  }
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) {
    return `layout:${layout[1]}:block:${blockSuffix}`;
  }
  return null;
}

function storytellingSettingsBaseFromFieldPath(path: string): string | null {
  const tpl = path.match(/^(templates\.[^.]+\.sections\.[^.]+\.settings)/);
  if (tpl) return tpl[1]!;
  const layout = path.match(/^(sections\.[^.]+\.settings)/);
  if (layout) return layout[1]!;
  return null;
}

function storytellingSectionSidebarNodeId(settingsBase: string): string | null {
  const tpl = settingsBase.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings$/);
  if (tpl) return `template:${tpl[1]}:${tpl[2]}`;
  const layout = settingsBase.match(/^sections\.([^.]+)\.settings$/);
  if (layout) return `layout:${layout[1]}`;
  return null;
}

export function isStorytellingCarouselContentFieldPath(path: string): boolean {
  if (!/storytelling_carousel/.test(path) || path.includes('.blocks.')) return false;
  const key = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(key)) return true;
  return key in CONTENT_FIELD_TO_BLOCK;
}

export function storytellingCarouselSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isStorytellingCarouselContentFieldPath(path)) return nodeId;

  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  if (SECTION_LEVEL_FIELD_KEYS.has(fieldKey)) {
    const sectionMapped = storytellingSectionSidebarNodeId(settingsBase);
    if (sectionMapped) return sectionMapped;
  }
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return nodeId;
  const mapped = storytellingFieldSidebarNodeId(settingsBase, blockSuffix);
  return mapped ?? nodeId;
}

export function syntheticStorytellingCarouselSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (isStorytellingCarouselHeaderGroupNodeId(nodeId)) {
    const fields = storytellingCarouselHeaderFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Header', kind: 'block', icon: 'group', fields };
  }

  if (isStorytellingCarouselContentGroupNodeId(nodeId)) {
    const fields = storytellingCarouselContentGroupFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Carousel content', kind: 'block', icon: 'group', fields };
  }

  if (isStorytellingCarouselCardBlockNodeId(nodeId)) {
    const fields = storytellingCarouselCardFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Card', kind: 'block', icon: 'product-card', fields };
  }

  if (isStorytellingCarouselHeaderBlockNodeId(nodeId)) {
    const fields = storytellingCarouselBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Header', kind: 'block', icon: 'text', fields };
  }

  if (isStorytellingCarouselCardImageBlockNodeId(nodeId)) {
    const fields = storytellingCarouselBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Image', kind: 'block', icon: 'image', fields };
  }

  if (isStorytellingCarouselCardHeadingBlockNodeId(nodeId)) {
    const fields = storytellingCarouselBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Heading', kind: 'block', icon: 'text', fields };
  }

  if (isStorytellingCarouselCardTextBlockNodeId(nodeId)) {
    const fields = storytellingCarouselBlockFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Text', kind: 'block', icon: 'text', fields };
  }

  if (nodeId.startsWith('field:') && isStorytellingCarouselContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = storytellingCarouselSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticStorytellingCarouselSidebarNode(mapped, _editorSchema);
  }

  return null;
}

export function isStorytellingCarouselSectionNodeId(nodeId: string): boolean {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) return isStorytellingCarouselSectionInstanceId(layout[1]!);
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return isStorytellingCarouselSectionInstanceId(tpl[2]!);
  return false;
}
