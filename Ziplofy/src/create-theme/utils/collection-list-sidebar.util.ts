import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  collectionListHeaderCustomSizeFieldDefs,
  collectionListHeaderFieldDefs,
} from '../sidebar/theme-editor-collection-list-header-panel.utils';
import { collectionListHeaderTextFieldDefs } from '../sidebar/theme-editor-collection-list-header-text-panel.utils';
import { collectionListCardFieldDefs } from '../sidebar/theme-editor-collection-list-card-panel.utils';
import { collectionListCardImageFieldDefs } from '../sidebar/theme-editor-collection-list-card-image-panel.utils';
import { collectionListCardTitleFieldDefs } from '../sidebar/theme-editor-collection-list-card-title-panel.utils';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';

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

export function isCollectionListTileBlockNodeId(nodeId: string): boolean {
  return /^(?:template:[^:]+:[^:]+|layout:[^:]+):block:tile_\d+$/.test(nodeId);
}

export function isCollectionListSectionHeaderNodeId(nodeId: string): boolean {
  return /:block:section_header$/.test(nodeId);
}

export function isCollectionListHeaderTextNodeId(nodeId: string): boolean {
  return /:block:section_header:nested:heading_text$/.test(nodeId);
}

export function isCollectionListCardImageNodeId(nodeId: string): boolean {
  return /:block:collection_card:nested:card_image$/.test(nodeId);
}

export function isCollectionListCardTitleNodeId(nodeId: string): boolean {
  return /:block:collection_card:nested:collection_title$/.test(nodeId);
}

export function isCollectionListCardBlockNodeId(nodeId: string): boolean {
  return /:block:collection_card$/.test(nodeId);
}

export function isCollectionListHeadingFieldPath(path: string): boolean {
  return /\.sections\.[^.]+\.settings\.heading$/.test(path);
}

export type CollectionListSidebarPaths = {
  prefix: string;
  settingsBase: string;
  blocksBase: string;
  templateTileId: string;
};

export function collectionListSidebarPathsFromNodeId(nodeId: string): CollectionListSidebarPaths | null {
  const layout = nodeId.match(/^layout:([^:]+)/);
  if (layout) {
    const instanceId = layout[1];
    return {
      prefix: `layout:${instanceId}`,
      settingsBase: `sections.${instanceId}.settings`,
      blocksBase: `sections.${instanceId}.blocks`,
      templateTileId: 'tile_1',
    };
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)/);
  if (tpl) {
    const [, templateId, sectionId] = tpl;
    return {
      prefix: `template:${templateId}:${sectionId}`,
      settingsBase: `templates.${templateId}.sections.${sectionId}.settings`,
      blocksBase: `templates.${templateId}.sections.${sectionId}.blocks`,
      templateTileId: 'tile_1',
    };
  }
  return null;
}

/** Shopify Collection list — Add block → Header → Text; Collection card → Image → Collection title. */
export function mapCollectionListBlockNodes(
  prefix: string,
  settingsBase: string,
  blocksBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string,
  templateTileId = 'tile_1'
): SidebarNode[] {
  const sectionAddBlockId = `${prefix}:add-block`;
  const headerPrefix = `${prefix}:block:section_header`;
  const cardPrefix = `${prefix}:block:collection_card`;
  const tileBase = `${blocksBase}.${templateTileId}.settings`;

  const headingTextFields = collectionListHeaderTextFieldDefs(settingsBase);
  const headingPreviewField = headingTextFields.find((f) => f.path.endsWith('.settings.text'));

  const cardImageFields = collectionListCardImageFieldDefs(settingsBase);

  const cardTitleFields = collectionListCardTitleFieldDefs(settingsBase);
  const titlePreviewField: EditorFieldDef = {
    path: `${tileBase}.title`,
    type: 'text',
    label: 'Title',
  };

  const headerChildren = reorderSidebarChildren(
    [
      { id: `${headerPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${headerPrefix}:nested:heading_text`,
        label: 'Text',
        kind: 'block',
        icon: 'text',
        preview: headingPreviewField ? fieldPreview(headingPreviewField, values) : undefined,
        fields: headingTextFields,
      },
    ],
    listKeyBlockChildren(headerPrefix),
    itemOrder
  );

  const headerFields = [
    ...collectionListHeaderFieldDefs(settingsBase),
    ...collectionListHeaderCustomSizeFieldDefs(settingsBase),
  ];

  const headerNode: SidebarNode = {
    id: headerPrefix,
    label: 'Header',
    kind: 'block',
    icon: 'group',
    fields: headerFields,
    children: headerChildren,
    childrenListKey: listKeyBlockChildren(headerPrefix),
  };

  const cardChildren = reorderSidebarChildren(
    [
      {
        id: `${cardPrefix}:nested:card_image`,
        label: 'Image',
        kind: 'block',
        icon: 'image',
        fields: cardImageFields,
        preview: undefined,
      },
      { id: `${cardPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${cardPrefix}:nested:collection_title`,
        label: 'Collection title',
        kind: 'block',
        icon: 'title',
        fields: cardTitleFields,
        preview: fieldPreview(titlePreviewField, values),
      },
    ],
    listKeyBlockChildren(cardPrefix),
    itemOrder
  );

  const collectionCardFields = collectionListCardFieldDefs(settingsBase);

  const collectionCardNode: SidebarNode = {
    id: cardPrefix,
    label: 'Collection card',
    kind: 'block',
    icon: 'product-card',
    fields: collectionCardFields,
    children: cardChildren,
    childrenListKey: listKeyBlockChildren(cardPrefix),
  };

  return reorderSidebarChildren(
    [
      { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' },
      headerNode,
      collectionCardNode,
    ],
    sectionChildrenListKey,
    itemOrder
  );
}

export function collectionListTileSidebarNodeFromId(nodeId: string): SidebarNode | null {
  const layout = nodeId.match(/^layout:([^:]+):block:(tile_\d+)$/);
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(tile_\d+)$/);
  let blocksBase: string;
  let blockId: string;
  if (layout) {
    blockId = layout[2];
    blocksBase = `sections.${layout[1]}.blocks.${blockId}`;
  } else if (tpl) {
    blockId = tpl[3];
    blocksBase = `templates.${tpl[1]}.sections.${tpl[2]}.blocks.${blockId}`;
  } else {
    return null;
  }

  const settingsBase = `${blocksBase}.settings`;
  const fields: EditorFieldDef[] = [
    { path: `${settingsBase}.title`, type: 'text', label: 'Title' },
    {
      path: `${settingsBase}.collectionHandle`,
      type: 'text',
      label: 'Collection',
      widget: 'collection',
    },
    {
      path: `${settingsBase}.columnSpan`,
      type: 'select',
      label: 'Width',
      widget: 'segmented',
      options: [
        { value: '1', label: 'Narrow' },
        { value: '2', label: 'Wide' },
      ],
    },
    {
      path: `${settingsBase}.illustrationVariant`,
      type: 'select',
      label: 'Illustration',
      widget: 'select',
    },
    { path: `${settingsBase}.imageUrl`, type: 'text', label: 'Image', widget: 'image' },
  ];

  return {
    id: nodeId,
    label: 'Collection',
    kind: 'block',
    icon: 'product-card',
    fields,
  };
}

export function collectionListHeadingTextSidebarNode(nodeId: string): SidebarNode | null {
  if (!isCollectionListHeaderTextNodeId(nodeId)) return null;
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  if (!paths) return null;
  const fields = collectionListHeaderTextFieldDefs(paths.settingsBase);
  return {
    id: nodeId,
    label: 'Text',
    kind: 'block',
    icon: 'text',
    fields,
  };
}

export function collectionListCardTitleSidebarNode(nodeId: string): SidebarNode | null {
  if (!isCollectionListCardTitleNodeId(nodeId)) return null;
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  if (!paths) return null;
  return {
    id: nodeId,
    label: 'Collection title',
    kind: 'block',
    icon: 'title',
    fields: collectionListCardTitleFieldDefs(paths.settingsBase),
  };
}

export function collectionListCardImageSidebarNode(nodeId: string): SidebarNode | null {
  if (!isCollectionListCardImageNodeId(nodeId)) return null;
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  if (!paths) return null;
  return {
    id: nodeId,
    label: 'Image',
    kind: 'block',
    icon: 'image',
    fields: collectionListCardImageFieldDefs(paths.settingsBase),
  };
}

export function collectionListCardSidebarNode(nodeId: string): SidebarNode | null {
  if (!isCollectionListCardBlockNodeId(nodeId)) return null;
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  if (!paths) return null;
  return {
    id: nodeId,
    label: 'Collection card',
    kind: 'block',
    icon: 'product-card',
    fields: collectionListCardFieldDefs(paths.settingsBase),
  };
}

export function collectionListHeadingFieldSidebarNode(fieldPath: string): SidebarNode | null {
  if (!isCollectionListHeadingFieldPath(fieldPath)) return null;
  const tpl = fieldPath.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings\.heading$/);
  const layout = fieldPath.match(/^sections\.([^.]+)\.settings\.heading$/);
  const nodeId = tpl
    ? `template:${tpl[1]}:${tpl[2]}:block:section_header:nested:heading_text`
    : layout
      ? `layout:${layout[1]}:block:section_header:nested:heading_text`
      : null;
  if (!nodeId) return null;
  return collectionListHeadingTextSidebarNode(nodeId);
}

/** Map preview selection ids to sidebar tree nodes where they differ. */
export function collectionListSidebarSelectionId(nodeId: string): string {
  if (nodeId.startsWith('field:')) {
    const path = nodeId.slice('field:'.length);
    if (isCollectionListHeadingFieldPath(path)) {
      const tpl = path.match(/^templates\.([^.]+)\.sections\.([^.]+)\.settings\.heading$/);
      if (tpl) {
        return `template:${tpl[1]}:${tpl[2]}:block:section_header:nested:heading_text`;
      }
      const layout = path.match(/^sections\.([^.]+)\.settings\.heading$/);
      if (layout) {
        return `layout:${layout[1]}:block:section_header:nested:heading_text`;
      }
    }
  }
  return nodeId;
}

export function collectionListSectionHeaderSidebarNode(nodeId: string): SidebarNode | null {
  if (!isCollectionListSectionHeaderNodeId(nodeId)) return null;
  const paths = collectionListSidebarPathsFromNodeId(nodeId);
  if (!paths) return null;
  const headerFields = [
    ...collectionListHeaderFieldDefs(paths.settingsBase),
    ...collectionListHeaderCustomSizeFieldDefs(paths.settingsBase),
  ];
  return {
    id: nodeId,
    label: 'Header',
    kind: 'block',
    icon: 'group',
    fields: headerFields,
  };
}

export function syntheticCollectionListSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (isCollectionListTileBlockNodeId(nodeId)) {
    return collectionListTileSidebarNodeFromId(nodeId);
  }
  const headerNode = collectionListSectionHeaderSidebarNode(nodeId);
  if (headerNode) return headerNode;
  const headingTextNode = collectionListHeadingTextSidebarNode(nodeId);
  if (headingTextNode) return headingTextNode;
  const cardNode = collectionListCardSidebarNode(nodeId);
  if (cardNode) return cardNode;
  const cardImageNode = collectionListCardImageSidebarNode(nodeId);
  if (cardImageNode) return cardImageNode;
  const cardTitleNode = collectionListCardTitleSidebarNode(nodeId);
  if (cardTitleNode) return cardTitleNode;
  if (nodeId.startsWith('field:') && isCollectionListHeadingFieldPath(nodeId.slice('field:'.length))) {
    return collectionListHeadingFieldSidebarNode(nodeId.slice('field:'.length));
  }
  return null;
}
