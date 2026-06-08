import type { ComponentType } from 'react';

/** Header | Template | Footer — where Add section was opened. */
export type CreateThemeCatalogGroup = 'header' | 'template' | 'footer';

export type CreateThemeInsert = {
  placement: 'layout' | 'template';
  /** Default layout group; divider uses the group from the modal context. */
  group: CreateThemeCatalogGroup;
  blueprintId: string;
  sectionType: string;
};

/** One setting row in the editor (order = editing sequence). */
export type CreateThemeSettingField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'boolean' | 'number' | 'select';
};

export type CreateThemeBlockEditing = {
  blockId: string;
  label: string;
  /** Order of fields in the settings panel for this block. */
  settingsOrder: CreateThemeSettingField[];
};

/** Section + block editing sequence for the settings panel. */
export type CreateThemeEditing = {
  sectionLabel: string;
  sectionSettingsOrder: CreateThemeSettingField[];
  blocks: CreateThemeBlockEditing[];
};

/**
 * Everything for one add-section element lives in its folder:
 * `create-theme/{element-name}/`
 */
export type CreateThemeElement = {
  id: string;
  label: string;
  keywords?: string[];
  /** Matches dev section catalog preview art (see SectionPreviewVisual). */
  previewVariant?: string;
  catalogIcon?: string;
  previewCaption?: string;
  Preview: ComponentType;
  editing: CreateThemeEditing;
  insert: CreateThemeInsert;
  applyPreset?: (section: Record<string, unknown>) => void;
};

export type CreateThemeCatalogCategory = {
  id: string;
  label: string;
  itemIds: string[];
};

export type CreateThemeCatalogGroupDef = {
  standalone?: string[];
  categoryOrder: string[];
  categories: Record<string, CreateThemeCatalogCategory>;
};

export type CreateThemeCatalogListItem = {
  element: CreateThemeElement;
  categoryId: string | null;
  categoryLabel: string | null;
  standalone: boolean;
};

export type CreateThemeInsertContext = {
  groupId: CreateThemeCatalogGroup;
  groupLabel: string;
  afterNodeId?: string;
  beforeNodeId?: string;
};

export type CreateThemeInsertResult = {
  config: Record<string, unknown>;
  instanceId: string;
  nodeId: string;
  listKey: string;
};

export type CreateThemeSidebarNode = {
  id: string;
  label: string;
  kind: 'group' | 'section' | 'block' | 'add';
  children?: CreateThemeSidebarNode[];
  deletable?: boolean;
  sectionInstanceId?: string;
  layoutGroup?: 'header' | 'footer';
  elementId?: string;
};
