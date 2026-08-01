import { ThemeLogoFaviconImageField } from '../../../create-theme/settings/ThemeLogoFaviconImageField';
import {
  THEME_LOGO_DEFAULT_PATH,
  THEME_LOGO_FAVICON_PATH,
} from '../../../create-theme/settings/theme-logo-favicon.settings';
import type { ThemeEditorFieldType } from './theme-editor-field.utils';

function readImageValue(values: Record<string, string | boolean>, path: string): string {
  const raw = values[path];
  return typeof raw === 'string' ? raw : '';
}

/** Catalog: Default logo + Favicon only. */
export function CatalogLogoFaviconSettingsPanel({
  values,
  onFieldChange,
}: {
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <ThemeLogoFaviconImageField
        label="Default logo"
        imageUrl={readImageValue(values, THEME_LOGO_DEFAULT_PATH)}
        onChange={(url) => onFieldChange(THEME_LOGO_DEFAULT_PATH, 'text', url)}
      />
      <ThemeLogoFaviconImageField
        label="Favicon"
        imageUrl={readImageValue(values, THEME_LOGO_FAVICON_PATH)}
        helper="Shown in the browser tab for the storefront preview"
        onChange={(url) => onFieldChange(THEME_LOGO_FAVICON_PATH, 'text', url)}
      />
    </div>
  );
}
