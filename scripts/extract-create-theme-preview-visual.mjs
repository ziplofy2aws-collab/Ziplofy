/**
 * Copies dev Add Section preview art into create-theme (no runtime import from dev editor).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const addModal = path.join(
  ROOT,
  'Ziplofy/src/components/themes/theme-editor-sidebar/AddSectionModal.tsx'
);
const blockCatalog = path.join(
  ROOT,
  'Ziplofy/src/components/themes/theme-editor-sidebar/add-block-catalog.ts'
);
const outVisual = path.join(ROOT, 'Ziplofy/src/create-theme/_shared/SectionPreviewVisual.tsx');
const outSlides = path.join(ROOT, 'Ziplofy/src/create-theme/_shared/section-preview-slides.ts');

const modalLines = fs.readFileSync(addModal, 'utf8').split('\n');
const helpers = modalLines.slice(220, 557).join('\n');
const previewFn = modalLines.slice(557, 1574).join('\n');

const visualHeader = `import React from 'react';

export type SectionPreviewVariant =
${previewFn.match(/variant:\s*\n?\s*([\s\S]*?)\n\):/)?.[1]?.split('|').map((v) => v.trim().replace(/'/g, '"')).filter(Boolean).map((v) => `  | ${v.replace(/"/g, "'")}`).join('\n') ?? "  | 'text-block'"};

`;

// Simpler: reuse variant union from copied function as-is
const visualFile = `import React from 'react';

${helpers}

${previewFn.replace('function PreviewVisual', 'export function SectionPreviewVisual')}
`;

fs.writeFileSync(outVisual, visualFile);

const catalogSrc = fs.readFileSync(blockCatalog, 'utf8');
const start = catalogSrc.indexOf('export const BLOCK_PREVIEW_SLIDES');
const end = catalogSrc.indexOf('];\n\nconst SPACER_ITEM', start);
const slidesEnd = end > start ? end + 2 : catalogSrc.indexOf('];', start) + 2;
const slidesChunk = catalogSrc.slice(start, slidesEnd);
const fixedSlides = `/** Preview slide metadata for create-theme add-section modal (rewritten from dev catalog). */\nimport type { SectionPreviewVariant } from './SectionPreviewVisual';

export type BlockPreviewSlide = {
  id: string;
  headline: string;
  headlineAccent: string;
  caption: string;
  variant: SectionPreviewVariant;
};

${slidesChunk}
`;
fs.writeFileSync(outSlides, fixedSlides);

console.log('Wrote', outVisual, outSlides);
