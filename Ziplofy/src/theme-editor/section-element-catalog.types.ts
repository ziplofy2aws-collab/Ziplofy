import type { EditingBlockSupport, EditingSectionSupport } from './section-editing-support.types';

export type SectionElementCatalog = {
  version: number;
  generatedAt: string;
  generatedFrom: {
    editingSupport: string;
    addCatalogManifest: string;
  };
  description: string;
  summary: {
    catalogElementCount: number;
    totalSectionElements: number;
    sectionTypeCount: number;
    schemaOnlySectionTypes: string[];
    blockCatalogCount: number;
    schemaBlockCount: number;
  };
  /** Canonical editing defs keyed by section type (same as section-editing-support). */
  sectionTypes: Record<string, EditingSectionSupport>;
  /** All section-level elements (Add section + schema-only page sections). */
  elements: SectionCatalogElement[];
  /** Add-block modal entries. */
  blockCatalog: BlockCatalogElement[];
  /** Blocks defined on section types in the schema. */
  blocks: SchemaBlockElement[];
  index: {
    bySectionType: Record<string, string[]>;
    byCatalogGroup: Record<'header' | 'template' | 'footer', string[]>;
    byCategory: Record<string, string[]>;
  };
};

export type SectionCatalogElement = {
  id: string;
  kind: 'section';
  label: string;
  icon: string;
  keywords: string[];
  previewVariant: string | null;
  previewCaption: string | null;
  catalogGroup: 'header' | 'template' | 'footer' | null;
  categoryId: string | null;
  categoryLabel: string | null;
  standaloneInGroup: boolean;
  sectionType: string;
  blueprintId: string | null;
  catalogVariant: string | null;
  insertNote: string | null;
  placement: Array<'layout' | 'template'>;
  availableInAddSection: boolean;
  editing: EditingSectionSupport | null;
};

export type BlockCatalogElement = {
  id: string;
  kind: 'block-catalog';
  label: string;
  icon: string;
  category: string;
  keywords: string[];
  extendedOnly: boolean;
  schemaMatches: Array<{
    parentSectionType: string;
    parentBlockId?: string;
    editing: EditingBlockSupport | Record<string, unknown>;
  }>;
  editing: EditingBlockSupport | Record<string, unknown> | null;
};

export type SchemaBlockElement = {
  id: string;
  kind: 'block';
  blockId: string;
  parentSectionType: string;
  label: string;
  editing: EditingBlockSupport;
  nested?: Record<string, { label: string; editing: EditingBlockSupport }>;
};
