/**
 * Generate create-theme block element folders from section-add-catalog.manifest blocks list.
 * Run: node scripts/generate-create-theme-blocks.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOCKS_ROOT = path.join(ROOT, 'Ziplofy', 'src', 'create-theme', 'blocks');
const MANIFEST_PATH = path.join(ROOT, 'Ziplofy', 'src', 'theme-editor', 'section-add-catalog.manifest.json');
const EDITING_PATH = path.join(ROOT, 'Ziplofy', 'src', 'theme-editor', 'section-editing-support.json');

function mapFieldType(t) {
  if (t === 'textarea') return 'textarea';
  if (t === 'boolean') return 'boolean';
  if (t === 'number') return 'number';
  return 'text';
}

/** First block def found in editing support for a catalog block id. */
function blockEditingFromSupport(blockId, support) {
  for (const st of Object.values(support.sectionTypes)) {
    const b = st.blocks?.[blockId];
    if (b?.fields?.length) {
      return {
        blockId,
        label: b.label ?? blockId,
        settingsOrder: b.fields.map((f) => ({
          key: f.key,
          label: f.label,
          type: mapFieldType(f.type),
        })),
      };
    }
    for (const parent of Object.values(st.blocks ?? {})) {
      const nested = parent.nested?.[blockId];
      if (nested?.fields?.length) {
        return {
          blockId,
          label: nested.label ?? blockId,
          settingsOrder: nested.fields.map((f) => ({
            key: f.key,
            label: f.label,
            type: mapFieldType(f.type),
          })),
        };
      }
    }
  }
  return {
    blockId,
    label: blockId.replace(/_/g, ' '),
    settingsOrder: [{ key: 'text', label: 'Content', type: 'text' }],
  };
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const support = JSON.parse(fs.readFileSync(EDITING_PATH, 'utf8'));
  const blocks = manifest.blocks ?? [];

  fs.mkdirSync(BLOCKS_ROOT, { recursive: true });

  const imports = [];
  const entries = [];

  for (const block of blocks) {
    const id = block.id;
    const dir = path.join(BLOCKS_ROOT, id);
    fs.mkdirSync(dir, { recursive: true });

    const editing = blockEditingFromSupport(id, support);
    const comp = `${id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}BlockPreview`;
    const exportName = `${id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Block`;

    fs.writeFileSync(
      path.join(dir, 'editing.ts'),
      `import type { CreateThemeBlockEditing } from '../types';\n\nexport const editing: CreateThemeBlockEditing = ${JSON.stringify(editing, null, 2)};\n`
    );

    fs.writeFileSync(
      path.join(dir, 'preview.tsx'),
      `import React from 'react';
import { BlockPreviewCard } from '../BlockPreviewCard';

export function ${comp}() {
  return <BlockPreviewCard label=${JSON.stringify(block.label)} category=${JSON.stringify(block.category)} />;
}
`
    );

    fs.writeFileSync(
      path.join(dir, 'index.ts'),
      `import type { CreateThemeBlock } from '../types';
import { editing } from './editing';
import { ${comp} } from './preview';

export const ${exportName}: CreateThemeBlock = {
  id: ${JSON.stringify(id)},
  label: ${JSON.stringify(block.label)},
  category: ${JSON.stringify(block.category)},
  keywords: ${JSON.stringify(block.keywords ?? [])},
  extendedOnly: ${Boolean(block.extendedOnly)},
  Preview: ${comp},
  editing,
};
`
    );

    imports.push(`import { ${exportName} } from './${id}';`);
    entries.push(`  ${JSON.stringify(id)}: ${exportName},`);
  }

  const registry = `${imports.join('\n')}
import type { CreateThemeBlock } from './types';

export const CREATE_THEME_BLOCKS: Record<string, CreateThemeBlock> = {
${entries.join('\n')}
};

export const CREATE_THEME_BLOCK_LIST = Object.values(CREATE_THEME_BLOCKS);
`;
  fs.writeFileSync(path.join(BLOCKS_ROOT, 'registry.ts'), registry);
  fs.writeFileSync(
    path.join(BLOCKS_ROOT, 'types.ts'),
    `import type { ComponentType } from 'react';
import type { CreateThemeBlockEditing } from '../types';

export type CreateThemeBlockCategory =
  | 'basic'
  | 'collection'
  | 'decorative'
  | 'footer'
  | 'forms'
  | 'layout'
  | 'links'
  | 'product';

export type CreateThemeBlock = {
  id: string;
  label: string;
  category: CreateThemeBlockCategory;
  keywords: string[];
  extendedOnly?: boolean;
  Preview: ComponentType;
  editing: CreateThemeBlockEditing;
};
`
  );

  console.log(`Generated ${blocks.length} block elements under create-theme/blocks/`);
}

main();
