import type { ThemePreviewPage } from '../components/themes/ThemeLivePreviewFrame';
import type { EditorSchemaDoc } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import { buildThemeEditorPageMenu } from './theme-editor-page-menu';

/** @deprecated Use buildThemeEditorPageMenu — kept for callers expecting simple {id,label} list. */
export function buildThemePageOptions(
  manifest: Record<string, unknown> | null,
  editorSchema: EditorSchemaDoc | null
): { id: ThemePreviewPage; label: string }[] {
  const seen = new Set<string>();
  const out: { id: ThemePreviewPage; label: string }[] = [];
  for (const item of buildThemeEditorPageMenu(manifest, editorSchema)) {
    if (item.isGroup || seen.has(item.previewPage)) continue;
    seen.add(item.previewPage);
    out.push({ id: item.previewPage, label: item.label });
  }
  if (!out.length) {
    return [
      { id: 'index', label: 'Home page' },
      { id: 'product', label: 'Product page' },
      { id: 'cart', label: 'Cart page' },
    ];
  }
  return out;
}
