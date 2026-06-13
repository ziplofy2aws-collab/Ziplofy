import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  comparisonSliderBlockFieldDefs,
  isImageCompareContentBlockField,
  isImageCompareContentBlockFieldsOnly,
  isImageCompareSliderBlockField,
  prepareComparisonSliderBlockSettingsNode,
} from './theme-editor-image-compare-slider-block-panel.utils';

export { isImageCompareContentBlockFieldsOnly } from './theme-editor-image-compare-slider-block-panel.utils';

export type ImageCompareBlockKind =
  | 'heading'
  | 'subheading'
  | 'button_1'
  | 'button_2'
  | 'comparison_slider';

export function isImageCompareSectionInstanceId(secId: string): boolean {
  return secId.includes('image_compare');
}

export function imageCompareSectionBaseFromNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:([^:]+):block:/);
  if (layout) {
    const secId = layout[1]!;
    if (!isImageCompareSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isImageCompareSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function imageCompareBlockKindFromNodeId(nodeId: string): ImageCompareBlockKind | null {
  if (/:block:content:nested:text:nested:heading$/.test(nodeId)) return 'heading';
  if (/:block:content:nested:text:nested:subheading$/.test(nodeId)) return 'subheading';
  if (/:block:content:nested:buttons:nested:button_1$/.test(nodeId)) return 'button_1';
  if (/:block:content:nested:buttons:nested:button_2$/.test(nodeId)) return 'button_2';
  if (/:block:comparison_slider$/.test(nodeId)) return 'comparison_slider';
  return null;
}

export function isImageCompareSectionBlockNodeId(nodeId: string): boolean {
  return imageCompareBlockKindFromNodeId(nodeId) !== null;
}

export function isImageCompareContentGroupNodeId(nodeId: string): boolean {
  return /:block:content$/.test(nodeId) && imageCompareSectionBaseFromNodeId(nodeId) !== null;
}

export function isImageCompareTextGroupNodeId(nodeId: string): boolean {
  return /:block:content:nested:text$/.test(nodeId) && imageCompareSectionBaseFromNodeId(nodeId) !== null;
}

export function isImageCompareButtonsGroupNodeId(nodeId: string): boolean {
  return /:block:content:nested:buttons$/.test(nodeId) && imageCompareSectionBaseFromNodeId(nodeId) !== null;
}

export function imageCompareBlockFieldDefs(
  sectionBase: string,
  blockKind: ImageCompareBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (blockKind === 'heading') {
    return [{ path: s('heading'), type: 'text', label: 'Heading', group: 'Content', sidebar: true }];
  }
  if (blockKind === 'subheading') {
    return [
      { path: s('subheading'), type: 'textarea', label: 'Text', group: 'Content', sidebar: true },
    ];
  }
  if (blockKind === 'button_1') {
    return [
      { path: s('button1Label'), type: 'text', label: 'Label', group: 'Content', sidebar: true },
      {
        path: s('button1Url'),
        type: 'text',
        label: 'Link',
        widget: 'link',
        group: 'Content',
        sidebar: true,
        placeholder: 'Paste a link or search',
      },
    ];
  }
  if (blockKind === 'button_2') {
    return [
      { path: s('button2Label'), type: 'text', label: 'Label', group: 'Content', sidebar: true },
      {
        path: s('button2Url'),
        type: 'text',
        label: 'Link',
        widget: 'link',
        group: 'Content',
        sidebar: true,
        placeholder: 'Paste a link or search',
      },
    ];
  }
  return comparisonSliderBlockFieldDefs(sectionBase);
}

export function imageCompareBlockFieldDefsFromNodeId(nodeId: string): EditorFieldDef[] {
  const sectionBase = imageCompareSectionBaseFromNodeId(nodeId);
  const blockKind = imageCompareBlockKindFromNodeId(nodeId);
  if (!sectionBase || !blockKind) return [];
  return imageCompareBlockFieldDefs(sectionBase, blockKind);
}

export function isImageCompareSectionBlockField(field: EditorFieldDef): boolean {
  return isImageCompareContentBlockField(field) || isImageCompareSliderBlockField(field);
}

export function isImageCompareSectionBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isImageCompareSectionBlockField);
}

export function prepareImageCompareSectionBlockSettingsNode(node: SidebarNode): SidebarNode {
  const blockKind = imageCompareBlockKindFromNodeId(node.id);
  if (blockKind === 'comparison_slider') {
    return prepareComparisonSliderBlockSettingsNode(node);
  }
  const label =
    blockKind === 'heading'
      ? 'Heading'
      : blockKind === 'subheading'
        ? 'Subheading'
        : blockKind === 'button_1' || blockKind === 'button_2'
          ? 'Button'
          : node.label;
  const fromNode = imageCompareBlockFieldDefsFromNodeId(node.id);
  const fields =
    fromNode.length > 0 ? fromNode : (node.fields ?? []).filter(isImageCompareContentBlockField);
  return { ...node, label, kind: 'block', fields };
}
