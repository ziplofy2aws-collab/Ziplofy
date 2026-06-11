import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';
import {
  isCollectionListCardImageNodeId,
  isCollectionListCardTitleNodeId,
  isCollectionListHeaderTextNodeId,
} from '../utils/collection-list-sidebar.util';
import {
  isCollectionListHeaderTextPanelFields,
  prepareCollectionListHeaderTextSettingsNode,
} from './theme-editor-collection-list-header-text-panel.utils';
import {
  isCollectionListCardPanelFields,
  prepareCollectionListCardSettingsNode,
} from './theme-editor-collection-list-card-panel.utils';
import {
  isCollectionListCardImagePanelFields,
  prepareCollectionListCardImageSettingsNode,
} from './theme-editor-collection-list-card-image-panel.utils';
import {
  isCollectionListCardTitlePanelFields,
  prepareCollectionListCardTitleSettingsNode,
} from './theme-editor-collection-list-card-title-panel.utils';

export {
  isCollectionListHeaderTextPanelFields,
  prepareCollectionListHeaderTextSettingsNode,
} from './theme-editor-collection-list-header-text-panel.utils';

export {
  isCollectionListCardPanelFields,
  prepareCollectionListCardSettingsNode,
} from './theme-editor-collection-list-card-panel.utils';

export {
  isCollectionListCardImagePanelFields,
  prepareCollectionListCardImageSettingsNode,
} from './theme-editor-collection-list-card-image-panel.utils';

export {
  isCollectionListCardTitlePanelFields,
  prepareCollectionListCardTitleSettingsNode,
} from './theme-editor-collection-list-card-title-panel.utils';

export function isCollectionListHeaderTextPanelNode(node: SidebarNode, fields: EditorFieldDef[]): boolean {
  return (
    isCollectionListHeaderTextNodeId(node.id) ||
    (node.label === 'Text' && isCollectionListHeaderTextPanelFields(fields))
  );
}

export function isCollectionListCardPanelNode(node: SidebarNode, fields: EditorFieldDef[]): boolean {
  return (
    node.label === 'Collection card' &&
    (node.id.endsWith(':block:collection_card') || isCollectionListCardPanelFields(fields))
  );
}

export function isCollectionListCardImagePanelNode(node: SidebarNode, fields: EditorFieldDef[]): boolean {
  return (
    isCollectionListCardImageNodeId(node.id) ||
    (node.label === 'Image' && isCollectionListCardImagePanelFields(fields))
  );
}

export function isCollectionListCardTitlePanelNode(node: SidebarNode, fields: EditorFieldDef[]): boolean {
  return (
    isCollectionListCardTitleNodeId(node.id) ||
    (node.label === 'Collection title' && isCollectionListCardTitlePanelFields(fields))
  );
}
