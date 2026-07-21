/**
 * Copies theme-editor-sidebar into create-theme/sidebar (excluding dev add modals).
 * Rewrites relative imports for the new location.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src');
const srcDir = path.join(root, 'components', 'themes', 'theme-editor-sidebar');
const destDir = path.join(root, 'create-theme', 'sidebar');

const SKIP = new Set([
  'AddSectionModal.tsx',
  'AddBlockModal.tsx',
  'add-section-catalog.ts',
  'add-block-catalog.ts',
  'index.ts',
  'ThemeEditorSidebar.tsx',
]);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) continue;
    if (/\.(ts|tsx)$/.test(name)) files.push(full);
  }
  return files;
}

if (fs.existsSync(destDir)) {
  for (const f of walk(destDir)) {
    if (!f.includes('CreateThemeEditorSidebar') && !f.includes('index.ts') && !f.includes('insert-context')) {
      fs.unlinkSync(f);
    }
  }
} else {
  fs.mkdirSync(destDir, { recursive: true });
}

for (const file of walk(srcDir)) {
  const base = path.basename(file);
  if (SKIP.has(base)) continue;
  const destName = base
    .replace(/^theme-editor-sidebar\.types\.ts$/, 'create-theme-sidebar.types.ts')
    .replace(/^theme-editor-structure-order\.ts$/, 'create-theme-structure-order.ts')
    .replace(/^theme-editor-sidebar\.tree\.ts$/, 'create-theme-sidebar.tree.ts')
    .replace(/^theme-editor-field\.utils\.ts$/, 'create-theme-field.utils.ts');
  let content = fs.readFileSync(file, 'utf8');

  content = content
    .replace(/from '\.\/theme-editor-sidebar\.types'/g, "from './create-theme-sidebar.types'")
    .replace(/from "\.\/theme-editor-sidebar\.types"/g, 'from "./create-theme-sidebar.types"')
    .replace(/from '\.\/theme-editor-field\.utils'/g, "from './create-theme-field.utils'")
    .replace(/from "\.\/theme-editor-field\.utils"/g, 'from "./create-theme-field.utils"')
    .replace(/from '\.\/theme-editor-structure-order'/g, "from './create-theme-structure-order'")
    .replace(/from "\.\/theme-editor-structure-order"/g, 'from "./create-theme-structure-order"')
    .replace(/from '\.\/theme-editor-sidebar\.tree'/g, "from './create-theme-sidebar.tree'")
    .replace(/from "\.\/theme-editor-sidebar\.tree"/g, 'from "./create-theme-sidebar.tree"')
    .replace(/from '\.\/add-section-catalog'/g, "from './insert-context'")
    .replace(/from "\.\/add-section-catalog"/g, 'from "./insert-context"')
    .replace(/from '\.\/SectionInsertZone'/g, "from './CreateThemeSectionInsertZone'")
    .replace(/from "\.\/SectionInsertZone"/g, 'from "./CreateThemeSectionInsertZone"')
    .replace(/from '\.\.\/ThemeLivePreviewFrame'/g, "from '../chrome/CreateThemeLivePreview'")
    .replace(/from "\.\.\/ThemeLivePreviewFrame"/g, 'from "../chrome/CreateThemeLivePreview"')
    .replace(/theme-editor-sidebar-scroll/g, 'create-theme-sidebar-scroll');

  if (base === 'SectionInsertZone.tsx') {
    fs.writeFileSync(path.join(destDir, 'CreateThemeSectionInsertZone.tsx'), content);
    continue;
  }

  fs.writeFileSync(path.join(destDir, destName), content);
}

console.log('Forked theme-editor-sidebar → create-theme/sidebar');
