/**
 * Copies create-theme section catalog from Ziplofy → render-store (no admin UI).
 * Run: node scripts/copy-create-theme-to-render-store.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'Ziplofy', 'src', 'create-theme');
const dst = path.join(root, 'render-store', 'src', 'create-theme');

const SKIP_DIRS = new Set(['chrome', 'sidebar', 'shell', 'utils']);
const ROOT_FILES = [
  'types.ts',
  'catalog-groups.ts',
  'registry.ts',
  'registry.generated.ts',
];

function copyRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const s = path.join(from, name);
    const d = path.join(to, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(src)) {
  console.error('Source missing:', src);
  process.exit(1);
}

if (fs.existsSync(dst)) {
  fs.rmSync(dst, { recursive: true, force: true });
}
fs.mkdirSync(dst, { recursive: true });

for (const file of ROOT_FILES) {
  const s = path.join(src, file);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, path.join(dst, file));
  }
}

for (const name of ['blocks', '_shared']) {
  const s = path.join(src, name);
  if (fs.existsSync(s)) {
    copyRecursive(s, path.join(dst, name));
  }
}

for (const name of fs.readdirSync(src)) {
  const s = path.join(src, name);
  if (!fs.statSync(s).isDirectory()) continue;
  if (SKIP_DIRS.has(name)) continue;
  copyRecursive(s, path.join(dst, name));
}

const readme = `# create-theme (copied from Ziplofy)

Section catalog, presets, and registry — synced from \`Ziplofy/src/create-theme\`.

**Live storefront preview today:** when \`appliedCustomThemeId\` is set, render-store loads the saved
\`themeConfig\` JSON from the API via the **create-theme composer** (no theme.js).

Re-copy after element changes:

\`\`\`bash
node scripts/copy-create-theme-to-render-store.mjs
\`\`\`

Admin-only UI (not copied): \`chrome/\`, \`sidebar/\`, \`shell/\`, \`CreateThemePage.tsx\`.
`;

fs.writeFileSync(path.join(dst, 'README.md'), readme, 'utf8');
console.log('Copied create-theme →', dst);
