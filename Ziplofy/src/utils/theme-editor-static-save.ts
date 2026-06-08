import type { EditorSchemaDoc } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import { applyValuesToThemeConfig } from './theme-editor-config.utils';

/** Merge sidebar form values into a full theme config object (static dev save). */
export function mergedConfigFromFormValues(
  defaultConfig: Record<string, unknown>,
  values: Record<string, string | boolean>,
  editorSchema: EditorSchemaDoc
): Record<string, unknown> {
  return applyValuesToThemeConfig(defaultConfig, values, editorSchema);
}
