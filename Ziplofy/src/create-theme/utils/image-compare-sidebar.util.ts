import type { EditorFieldDef, EditorSchemaDoc, SidebarNode } from '../sidebar/create-theme-sidebar.types';
import {
  listKeyBlockChildren,
  reorderSidebarChildren,
} from '../sidebar/create-theme-structure-order';
import {
  imageCompareBlockFieldDefs,
  imageCompareBlockFieldDefsFromNodeId,
  isImageCompareButtonsGroupNodeId,
  isImageCompareContentGroupNodeId,
  isImageCompareSectionInstanceId,
  isImageCompareTextGroupNodeId,
} from '../sidebar/theme-editor-image-compare-block-panel.utils';
import { COMPARISON_SLIDER_FIELD_KEYS } from '../sidebar/theme-editor-image-compare-slider-block-panel.utils';
import {
  IMAGE_COMPARE_CONTENT_GROUP_FIELD_KEYS,
  imageCompareContentGroupFieldDefs,
  imageCompareContentGroupFieldDefsFromNodeId,
} from '../sidebar/theme-editor-image-compare-content-group-panel.utils';

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

function imageCompareSectionBase(prefix: string): string {
  const layout = prefix.match(/^layout:(.+)$/);
  if (layout) return `sections.${layout[1]}`;
  const tpl = prefix.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return `templates.${tpl[1]}.sections.${tpl[2]}`;
  return prefix;
}

/** Shopify Image compare — Add block → Content → Text / Buttons; Comparison slider. */
export function mapImageCompareBlockNodes(
  prefix: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const sectionBase = imageCompareSectionBase(prefix);
  const sectionAddBlockId = `${prefix}:add-block`;
  const contentPrefix = `${prefix}:block:content`;
  const textPrefix = `${contentPrefix}:nested:text`;
  const buttonsPrefix = `${contentPrefix}:nested:buttons`;

  const headingFields = imageCompareBlockFieldDefs(sectionBase, 'heading');
  const subheadingFields = imageCompareBlockFieldDefs(sectionBase, 'subheading');
  const headingPreviewField = headingFields.find((f) => f.path.endsWith('.heading'));
  const subheadingPreviewField = subheadingFields.find((f) => f.path.endsWith('.subheading'));
  const button1Fields = imageCompareBlockFieldDefs(sectionBase, 'button_1');
  const button1PreviewField = button1Fields.find((f) => f.path.endsWith('.button1Label'));

  const textChildren = reorderSidebarChildren(
    [
      { id: `${textPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${textPrefix}:nested:heading`,
        label: 'Heading',
        kind: 'block',
        icon: 'text',
        preview: headingPreviewField ? fieldPreview(headingPreviewField, values) : undefined,
        fields: headingFields,
      },
      {
        id: `${textPrefix}:nested:subheading`,
        label: 'Subheading',
        kind: 'block',
        icon: 'text',
        preview: subheadingPreviewField ? fieldPreview(subheadingPreviewField, values) : undefined,
        fields: subheadingFields,
      },
    ],
    listKeyBlockChildren(textPrefix),
    itemOrder
  );

  const textGroupNode: SidebarNode = {
    id: textPrefix,
    label: 'Text',
    kind: 'block',
    icon: 'group',
    children: textChildren,
    childrenListKey: listKeyBlockChildren(textPrefix),
  };

  const button2Fields = imageCompareBlockFieldDefs(sectionBase, 'button_2');
  const button2PreviewField = button2Fields.find((f) => f.path.endsWith('.button2Label'));

  const buttonsChildren = reorderSidebarChildren(
    [
      { id: `${buttonsPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      {
        id: `${buttonsPrefix}:nested:button_1`,
        label: 'Button',
        kind: 'block',
        icon: 'button',
        preview: button1PreviewField ? fieldPreview(button1PreviewField, values) : undefined,
        fields: button1Fields,
      },
      {
        id: `${buttonsPrefix}:nested:button_2`,
        label: 'Button',
        kind: 'block',
        icon: 'button',
        preview: button2PreviewField ? fieldPreview(button2PreviewField, values) : undefined,
        fields: button2Fields,
      },
    ],
    listKeyBlockChildren(buttonsPrefix),
    itemOrder
  );

  const buttonsGroupNode: SidebarNode = {
    id: buttonsPrefix,
    label: 'Buttons',
    kind: 'block',
    icon: 'group',
    children: buttonsChildren,
    childrenListKey: listKeyBlockChildren(buttonsPrefix),
  };

  const contentChildren = reorderSidebarChildren(
    [
      { id: `${contentPrefix}:inner-add-block`, label: 'Add block', kind: 'add-block' },
      textGroupNode,
      buttonsGroupNode,
    ],
    listKeyBlockChildren(contentPrefix),
    itemOrder
  );

  const contentNode: SidebarNode = {
    id: contentPrefix,
    label: 'Content',
    kind: 'block',
    icon: 'group',
    fields: imageCompareContentGroupFieldDefs(sectionBase),
    children: contentChildren,
    childrenListKey: listKeyBlockChildren(contentPrefix),
  };

  const comparisonSliderNode: SidebarNode = {
    id: `${prefix}:block:comparison_slider`,
    label: 'Comparison slider',
    kind: 'block',
    icon: 'section',
    fields: imageCompareBlockFieldDefs(sectionBase, 'comparison_slider'),
  };

  return reorderSidebarChildren(
    [
      { id: sectionAddBlockId, label: 'Add block', kind: 'add-block' },
      contentNode,
      comparisonSliderNode,
    ],
    sectionChildrenListKey,
    itemOrder
  );
}

export function imageCompareStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  const contentPrefix = `${prefix}:block:content`;
  const textPrefix = `${contentPrefix}:nested:text`;
  const buttonsPrefix = `${contentPrefix}:nested:buttons`;
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      contentPrefix,
      `${prefix}:block:comparison_slider`,
    ],
    [listKeyBlockChildren(contentPrefix)]: [
      `${contentPrefix}:inner-add-block`,
      textPrefix,
      buttonsPrefix,
    ],
    [listKeyBlockChildren(textPrefix)]: [
      `${textPrefix}:inner-add-block`,
      `${textPrefix}:nested:heading`,
      `${textPrefix}:nested:subheading`,
    ],
    [listKeyBlockChildren(buttonsPrefix)]: [
      `${buttonsPrefix}:inner-add-block`,
      `${buttonsPrefix}:nested:button_1`,
      `${buttonsPrefix}:nested:button_2`,
    ],
  };
}

export function imageCompareLayoutStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return imageCompareStructureOrder(prefix, sectionChildrenListKey);
}

const CONTENT_FIELD_TO_BLOCK: Record<string, string> = {
  heading: 'content:nested:text:nested:heading',
  subheading: 'content:nested:text:nested:subheading',
  button1Label: 'content:nested:buttons:nested:button_1',
  button1Url: 'content:nested:buttons:nested:button_1',
  button2Label: 'content:nested:buttons:nested:button_2',
  button2Url: 'content:nested:buttons:nested:button_2',
  ...Object.fromEntries([...COMPARISON_SLIDER_FIELD_KEYS].map((key) => [key, 'comparison_slider'])),
  ...Object.fromEntries([...IMAGE_COMPARE_CONTENT_GROUP_FIELD_KEYS].map((key) => [key, 'content'])),
};

function imageCompareFieldSidebarNodeId(settingsBase: string, fieldKey: string): string | null {
  const blockSuffix = CONTENT_FIELD_TO_BLOCK[fieldKey];
  if (!blockSuffix) return null;
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

export function isImageCompareContentFieldPath(path: string): boolean {
  const key = path.split('.').pop() ?? '';
  return key in CONTENT_FIELD_TO_BLOCK && /image_compare/.test(path) && !path.includes('.blocks.');
}

export function imageCompareSidebarSelectionId(nodeId: string): string {
  if (!nodeId.startsWith('field:')) return nodeId;
  const path = nodeId.slice('field:'.length);
  if (!isImageCompareContentFieldPath(path)) return nodeId;
  const settingsBase = path.replace(/\.[^.]+$/, '');
  const fieldKey = path.split('.').pop() ?? '';
  const mapped = imageCompareFieldSidebarNodeId(settingsBase, fieldKey);
  return mapped ?? nodeId;
}

function imageCompareBlockSidebarNode(nodeId: string, label: string, icon: SidebarNode['icon']): SidebarNode | null {
  const fields = imageCompareBlockFieldDefsFromNodeId(nodeId);
  if (!fields.length) return null;
  return { id: nodeId, label, kind: 'block', icon, fields };
}

export function syntheticImageCompareSidebarNode(
  nodeId: string,
  _editorSchema?: EditorSchemaDoc | null
): SidebarNode | null {
  if (isImageCompareContentGroupNodeId(nodeId)) {
    const fields = imageCompareContentGroupFieldDefsFromNodeId(nodeId);
    return { id: nodeId, label: 'Content', kind: 'block', icon: 'group', fields };
  }
  if (isImageCompareTextGroupNodeId(nodeId)) {
    return { id: nodeId, label: 'Text', kind: 'block', icon: 'group' };
  }
  if (isImageCompareButtonsGroupNodeId(nodeId)) {
    return { id: nodeId, label: 'Buttons', kind: 'block', icon: 'group' };
  }

  const heading = imageCompareBlockSidebarNode(nodeId, 'Heading', 'text');
  if (heading && /:nested:heading$/.test(nodeId)) return heading;

  const text = imageCompareBlockSidebarNode(nodeId, 'Subheading', 'text');
  if (text && /:nested:subheading$/.test(nodeId)) return text;

  const button = imageCompareBlockSidebarNode(nodeId, 'Button', 'button');
  if (button && /:nested:button_[12]$/.test(nodeId)) return button;

  const slider = imageCompareBlockSidebarNode(nodeId, 'Comparison slider', 'section');
  if (slider && /:comparison_slider$/.test(nodeId)) return slider;

  if (nodeId.startsWith('field:') && isImageCompareContentFieldPath(nodeId.slice('field:'.length))) {
    const mapped = imageCompareSidebarSelectionId(nodeId);
    if (mapped !== nodeId) return syntheticImageCompareSidebarNode(mapped, _editorSchema);
  }
  return null;
}

export function isImageCompareSectionNodeId(nodeId: string): boolean {
  const layout = nodeId.match(/^layout:(.+)$/);
  if (layout) return isImageCompareSectionInstanceId(layout[1]!);
  const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
  if (tpl) return isImageCompareSectionInstanceId(tpl[2]!);
  return false;
}
