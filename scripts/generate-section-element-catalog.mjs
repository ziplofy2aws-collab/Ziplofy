/**
 * Build section-element-catalog.json — master list of every element and how to edit it.
 *
 * Sources:
 *   - section-editing-support.json (fields, panels, blocks per section type)
 *   - section-add-catalog.manifest.json (Add section UI + insert mapping)
 *
 * Run:
 *   node scripts/generate-section-element-catalog.mjs
 *
 * After schema or catalog changes, also run:
 *   node scripts/generate-section-editing-support.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const THEME_EDITOR = path.join(ROOT, 'Ziplofy', 'src', 'theme-editor');
const EDITING_PATH = path.join(THEME_EDITOR, 'section-editing-support.json');
const MANIFEST_PATH = path.join(THEME_EDITOR, 'section-add-catalog.manifest.json');
const OUT_PATH = path.join(THEME_EDITOR, 'section-element-catalog.json');

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resolveInsert(manifest, catalogGroup, catalogId) {
  if (catalogGroup === 'template') {
    return manifest.insert.template[catalogId] ?? null;
  }
  if (catalogGroup === 'header') {
    return manifest.insert.headerFooter[catalogId] ?? manifest.insert.layout[catalogId] ?? null;
  }
  return (
    manifest.insert.headerFooter[catalogId] ??
    manifest.insert.layout[catalogId] ??
    manifest.insert.footer?.[catalogId] ??
    null
  );
}

function catalogVariantFor(catalogId, sectionType) {
  if (catalogId === sectionType) return undefined;
  return catalogId;
}

function walkCatalogGroup(manifest, catalogGroup, onElement) {
  const group = manifest.groups[catalogGroup];
  if (!group) return;

  const emit = (catalogId, categoryId, categoryLabel, standalone) => {
    const item = manifest.items[catalogId];
    if (!item) {
      console.warn(`[catalog] missing item definition: ${catalogId}`);
      return;
    }
    const insert = resolveInsert(manifest, catalogGroup, catalogId);
    if (!insert) {
      console.warn(`[catalog] missing insert mapping: ${catalogGroup}/${catalogId}`);
      return;
    }
    onElement({
      catalogId,
      catalogGroup,
      categoryId: categoryId ?? null,
      categoryLabel: categoryLabel ?? null,
      standalone: Boolean(standalone),
      item,
      insert,
    });
  };

  for (const catalogId of group.standalone ?? []) {
    emit(catalogId, null, null, true);
  }

  for (const categoryId of group.categoryOrder ?? []) {
    const category = group.categories?.[categoryId];
    if (!category) continue;
    for (const catalogId of category.itemIds ?? []) {
      emit(catalogId, categoryId, category.label, false);
    }
  }
}

function extractBlockElements(sectionTypes) {
  const blocks = [];
  for (const [sectionType, support] of Object.entries(sectionTypes)) {
    if (!support?.blocks) continue;
    for (const [blockId, blockSupport] of Object.entries(support.blocks)) {
      blocks.push({
        id: `${sectionType}:${blockId}`,
        kind: 'block',
        blockId,
        parentSectionType: sectionType,
        label: blockSupport.label ?? blockId,
        editing: deepClone(blockSupport),
        nested: blockSupport.nested
          ? Object.fromEntries(
              Object.entries(blockSupport.nested).map(([nestedId, nested]) => [
                nestedId,
                {
                  label: nested.label ?? nestedId,
                  editing: deepClone(nested),
                },
              ])
            )
          : undefined,
      });
    }
  }
  return blocks;
}

function findBlockEditingInCatalog(blockCatalogId, sectionTypes) {
  const matches = [];
  for (const [sectionType, support] of Object.entries(sectionTypes)) {
    const block = support?.blocks?.[blockCatalogId];
    if (block) {
      matches.push({
        parentSectionType: sectionType,
        editing: deepClone(block),
      });
    }
    for (const [blockId, blockSupport] of Object.entries(support?.blocks ?? {})) {
      const nested = blockSupport?.nested?.[blockCatalogId];
      if (nested) {
        matches.push({
          parentSectionType: sectionType,
          parentBlockId: blockId,
          editing: deepClone(nested),
        });
      }
    }
  }
  return matches;
}

function main() {
  const editing = JSON.parse(fs.readFileSync(EDITING_PATH, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const sectionTypes = editing.sectionTypes ?? {};

  const catalogElements = [];
  const seenCatalogKeys = new Set();

  for (const catalogGroup of ['header', 'template', 'footer']) {
    walkCatalogGroup(manifest, catalogGroup, (ctx) => {
      const key = `${ctx.catalogGroup}:${ctx.catalogId}`;
      if (seenCatalogKeys.has(key)) return;
      seenCatalogKeys.add(key);

      const { sectionType, blueprintId, insertNote } = ctx.insert;
      const typeSupport = sectionTypes[sectionType];
      if (!typeSupport) {
        console.warn(`[editing] no sectionTypes entry for ${sectionType} (${key})`);
      }

      const variant = catalogVariantFor(ctx.catalogId, sectionType);
      catalogElements.push({
        id: ctx.catalogId,
        kind: 'section',
        label: ctx.item.label,
        icon: ctx.item.icon,
        keywords: ctx.item.keywords ?? [],
        previewVariant: ctx.item.previewVariant ?? null,
        previewCaption: ctx.item.previewCaption ?? null,
        catalogGroup: ctx.catalogGroup,
        categoryId: ctx.categoryId,
        categoryLabel: ctx.categoryLabel,
        standaloneInGroup: ctx.standalone,
        sectionType,
        blueprintId,
        catalogVariant: variant ?? null,
        insertNote: insertNote ?? null,
        placement: typeSupport?.placement ?? [],
        availableInAddSection: true,
        editing: typeSupport ? deepClone(typeSupport) : null,
      });
    });
  }

  const schemaOnlySectionTypes = [];
  for (const [sectionType, support] of Object.entries(sectionTypes)) {
    const inCatalog = catalogElements.some((e) => e.sectionType === sectionType);
    if (!inCatalog) {
      schemaOnlySectionTypes.push(sectionType);
      catalogElements.push({
        id: sectionType,
        kind: 'section',
        label: support.label ?? sectionType,
        icon: 'section',
        keywords: [],
        previewVariant: null,
        previewCaption: support.description ?? null,
        catalogGroup: null,
        categoryId: null,
        categoryLabel: null,
        standaloneInGroup: false,
        sectionType,
        blueprintId: support.layoutBlueprint ?? support.canonicalSectionId ?? null,
        catalogVariant: null,
        placement: support.placement ?? [],
        availableInAddSection: false,
        editing: deepClone(support),
      });
    }
  }

  const blockCatalogElements = (manifest.blocks ?? []).map((block) => {
    const schemaMatches = findBlockEditingInCatalog(block.id, sectionTypes);
    return {
      id: block.id,
      kind: 'block-catalog',
      label: block.label,
      icon: block.icon,
      category: block.category,
      keywords: block.keywords ?? [],
      extendedOnly: Boolean(block.extendedOnly),
      schemaMatches,
      editing:
        schemaMatches.length === 1
          ? schemaMatches[0].editing
          : schemaMatches.length > 1
            ? { note: 'Block id maps to multiple parents; see schemaMatches.' }
            : null,
    };
  });

  const blockElements = extractBlockElements(sectionTypes);

  const index = {
    bySectionType: {},
    byCatalogGroup: { header: [], template: [], footer: [] },
    byCategory: {},
  };

  for (const el of catalogElements) {
    if (!index.bySectionType[el.sectionType]) index.bySectionType[el.sectionType] = [];
    if (!index.bySectionType[el.sectionType].includes(el.id)) {
      index.bySectionType[el.sectionType].push(el.id);
    }
    if (el.catalogGroup) {
      index.byCatalogGroup[el.catalogGroup].push(el.id);
      if (el.categoryId) {
        const catKey = `${el.catalogGroup}:${el.categoryId}`;
        if (!index.byCategory[catKey]) index.byCategory[catKey] = [];
        index.byCategory[catKey].push(el.id);
      }
    }
  }

  const catalog = {
    version: 1,
    generatedAt: new Date().toISOString(),
    generatedFrom: {
      editingSupport: 'section-editing-support.json',
      addCatalogManifest: 'section-add-catalog.manifest.json',
    },
    description:
      'Master theme editor catalog: every section/block element, how it appears in Add section, and full editing definitions (fields, panels, nested blocks).',
    summary: {
      catalogElementCount: catalogElements.filter((e) => e.availableInAddSection).length,
      totalSectionElements: catalogElements.length,
      sectionTypeCount: Object.keys(sectionTypes).length,
      schemaOnlySectionTypes,
      blockCatalogCount: blockCatalogElements.length,
      schemaBlockCount: blockElements.length,
    },
    sectionTypes: deepClone(sectionTypes),
    elements: catalogElements,
    blockCatalog: blockCatalogElements,
    blocks: blockElements,
    index,
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
  console.log(
    `  ${catalog.summary.catalogElementCount} add-section elements, ` +
      `${catalog.summary.totalSectionElements} section elements total, ` +
      `${catalog.summary.schemaBlockCount} schema blocks`
  );
}

main();
