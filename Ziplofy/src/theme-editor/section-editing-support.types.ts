import type { EditorFieldDef } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';

export type EditingPanelRule = {
  includeGroups?: string[];
  excludeGroups?: string[];
  includeKeys?: string[];
  excludeKeys?: string[];
  fieldOrder?: string[];
};

export type EditingFieldDef = Omit<EditorFieldDef, 'path'> & {
  key: string;
};

export type EditingNestedSupport = {
  label: string;
  fields: EditingFieldDef[];
  panels: Record<string, EditingPanelRule>;
};

export type EditingBlockSupport = {
  label: string;
  fields: EditingFieldDef[];
  panels: Record<string, EditingPanelRule>;
  nested?: Record<string, EditingNestedSupport>;
};

export type EditingSectionSupport = {
  label: string;
  placement: Array<'layout' | 'template'>;
  layoutBlueprint?: string;
  templateSectionType?: string;
  canonicalSectionId?: string;
  canonicalTemplateId?: string;
  fields: EditingFieldDef[];
  panels: Record<string, EditingPanelRule>;
  blocks?: Record<string, EditingBlockSupport>;
};

export type SectionEditingSupportCatalog = {
  version: number;
  generatedFrom?: string;
  generatedAt?: string;
  description?: string;
  summary?: { sectionTypeCount: number; fieldCount: number };
  sectionTypes: Record<string, EditingSectionSupport>;
};

export type EditingSelectionContext = {
  sectionType: string;
  placement: 'layout' | 'template';
  templateId?: string;
  sectionInstanceId: string;
  blockId?: string;
  nestedBlockId?: string;
  panelId: string;
  label: string;
  kind: 'section' | 'block';
};

export type ResolvedEditingPanel = {
  context: EditingSelectionContext;
  fields: EditorFieldDef[];
  label: string;
  kind: 'section' | 'block';
};
