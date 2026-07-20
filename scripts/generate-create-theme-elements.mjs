/**
 * Generate create-theme section element folders + registry from Horizon catalog manifest.
 * Run: node scripts/generate-create-theme-elements.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCreateThemePreviewVariant } from './section-preview-variant-resolver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CREATE_THEME = path.join(ROOT, 'Ziplofy', 'src', 'create-theme');
const MANIFEST_PATH = path.join(ROOT, 'Ziplofy', 'src', 'theme-editor', 'section-add-catalog.manifest.json');
const EDITING_PATH = path.join(ROOT, 'Ziplofy', 'src', 'theme-editor', 'section-editing-support.json');

/** Keep hand-tuned previews/presets in these folders (not overwritten). */
const HANDCRAFTED = new Set(['footer', 'announcement-bar', 'header', 'divider', 'policies-links']);

function mapFieldType(t) {
  if (t === 'textarea') return 'textarea';
  if (t === 'boolean') return 'boolean';
  if (t === 'number') return 'number';
  return 'text';
}

function editingFromSupport(sectionType, support) {
  const st = support.sectionTypes[sectionType];
  if (!st) {
    return {
      sectionLabel: sectionType,
      sectionSettingsOrder: [],
      blocks: [],
    };
  }
  const sectionSettingsOrder = (st.fields ?? []).map((f) => ({
    key: f.key,
    label: f.label,
    type: mapFieldType(f.type),
  }));
  const blocks = Object.entries(st.blocks ?? {}).map(([blockId, b]) => ({
    blockId,
    label: b.label,
    settingsOrder: (b.fields ?? []).map((f) => ({
      key: f.key,
      label: f.label,
      type: mapFieldType(f.type),
    })),
  }));
  return {
    sectionLabel: st.label ?? sectionType,
    sectionSettingsOrder,
    blocks,
  };
}

function serializeEditing(editing) {
  const lines = [
    `import type { CreateThemeEditing } from '../types';`,
    ``,
    `export const editing: CreateThemeEditing = ${JSON.stringify(editing, null, 2)};`,
    ``,
  ];
  return lines.join('\n');
}

function previewTs(elementId, variant, label) {
  const comp = `${elementId.replace(/[^a-zA-Z0-9]/g, '')}Preview`;
  return `import React from 'react';
import { SectionPreviewCard } from '../_shared/SectionPreviewCard';

export function ${comp}() {
  return <SectionPreviewCard label=${JSON.stringify(label)} variant=${JSON.stringify(variant ?? 'text-block')} />;
}
`;
}

function presetTs() {
  return `/** Defaults applied after pack blueprint clone (extend in place as needed). */
export function applyPreset(_section: Record<string, unknown>): void {}
`;
}

function indexTs(elementId, label, sectionType, insert, item, compName, previewVariant) {
  const exportName = `${elementId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Element`;
  const kw = item.keywords?.length ? `\n  keywords: ${JSON.stringify(item.keywords)},` : '';
  const cap = item.previewCaption ? `\n  previewCaption: ${JSON.stringify(item.previewCaption)},` : '';
  const pv = previewVariant ? `\n  previewVariant: ${JSON.stringify(previewVariant)},` : '';
  const ic = item.icon ? `\n  catalogIcon: ${JSON.stringify(item.icon)},` : '';
  return `import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { ${compName} } from './preview';
import { applyPreset } from './preset';

export const ${exportName}: CreateThemeElement = {
  id: ${JSON.stringify(elementId)},
  label: ${JSON.stringify(label)},${kw}${pv}${ic}${cap}
  Preview: ${compName},
  editing,
  insert: {
    placement: ${JSON.stringify(insert.placement)},
    group: ${JSON.stringify(insert.group)},
    blueprintId: ${JSON.stringify(insert.blueprintId)},
    sectionType: ${JSON.stringify(insert.sectionType)},
  },
  applyPreset,
};
`;
}

function resolveInsert(manifest, elementId, defaultGroup) {
  const t = manifest.insert.template?.[elementId];
  if (t) return { ...t, placement: 'template', group: 'template' };
  const f = manifest.insert.footer?.[elementId];
  if (f) return { ...f, placement: 'layout', group: 'footer' };
  const hf = manifest.insert.headerFooter?.[elementId];
  if (hf) return { ...hf, placement: 'layout', group: defaultGroup === 'footer' ? 'footer' : 'header' };
  const l = manifest.insert.layout?.[elementId];
  if (l) return { ...l, placement: 'layout', group: defaultGroup === 'footer' ? 'footer' : 'header' };
  return null;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const support = JSON.parse(fs.readFileSync(EDITING_PATH, 'utf8'));

  const elementIds = Object.keys(manifest.items);
  const imports = [];
  const registryEntries = [];
  const sectionTypeMap = {};

  for (const elementId of elementIds) {
    const item = manifest.items[elementId];
    const previewVariant = resolveCreateThemePreviewVariant(elementId, item.icon);
    item.previewVariant = previewVariant;
    const insert = resolveInsert(manifest, elementId, 'template');
    if (!insert) {
      console.warn(`[skip] no insert for ${elementId}`);
      continue;
    }

    if (!sectionTypeMap[insert.sectionType]) {
      sectionTypeMap[insert.sectionType] = elementId;
    }

    if (HANDCRAFTED.has(elementId)) {
      const exportName = `${elementId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Element`;
      imports.push(`import { ${exportName} } from './${elementId}';`);
      registryEntries.push(`  ${JSON.stringify(elementId)}: ${exportName},`);
      continue;
    }

    const dir = path.join(CREATE_THEME, elementId);
    fs.mkdirSync(dir, { recursive: true });

    const editing = editingFromSupport(insert.sectionType, support);
    fs.writeFileSync(path.join(dir, 'editing.ts'), serializeEditing(editing));

    const compName = `${elementId.replace(/[^a-zA-Z0-9]/g, '')}Preview`;
    fs.writeFileSync(
      path.join(dir, 'preview.tsx'),
      previewTs(elementId, previewVariant, item.label)
    );
    fs.writeFileSync(path.join(dir, 'preset.ts'), presetTs());
    fs.writeFileSync(
      path.join(dir, 'index.ts'),
      indexTs(elementId, item.label, insert.sectionType, insert, item, compName, previewVariant)
    );

    const exportName = `${elementId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Element`;
    imports.push(`import { ${exportName} } from './${elementId}';`);
    registryEntries.push(`  ${JSON.stringify(elementId)}: ${exportName},`);
  }

  // catalog-groups.ts
  const groupsTs = `import type { CreateThemeCatalogGroup, CreateThemeCatalogGroupDef } from './types';

/** Auto-generated from section-add-catalog.manifest.json — run generate-create-theme-elements.mjs */
export const CREATE_THEME_CATALOG_GROUPS: Record<CreateThemeCatalogGroup, CreateThemeCatalogGroupDef> = ${JSON.stringify(
    manifest.groups,
    null,
    2
  )} as Record<CreateThemeCatalogGroup, CreateThemeCatalogGroupDef>;
`;
  fs.writeFileSync(path.join(CREATE_THEME, 'catalog-groups.ts'), groupsTs);
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  // registry.generated.ts
  const registryTs = `${imports.join('\n')}
import type { CreateThemeElement } from './types';

export const GENERATED_CREATE_THEME_ELEMENTS: Record<string, CreateThemeElement> = {
${registryEntries.join('\n')}
};

export const GENERATED_SECTION_TYPE_TO_ELEMENT_ID: Record<string, string> = ${JSON.stringify(sectionTypeMap, null, 2)};
`;
  fs.writeFileSync(path.join(CREATE_THEME, 'registry.generated.ts'), registryTs);

  console.log(`Generated ${elementIds.length} section elements under create-theme/`);
}

main();
