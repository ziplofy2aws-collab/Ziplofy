import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ThemeButtonsSettingsPanel } from '../../../create-theme/settings/ThemeButtonsSettingsPanel';
import { ThemeColorPaletteEditor } from '../../../create-theme/settings/ThemeColorPaletteEditor';
import { CatalogLogoFaviconSettingsPanel } from './CatalogLogoFaviconSettingsPanel';
import { CatalogTypographySettingsPanel } from './CatalogTypographySettingsPanel';
import type { ThemeEditorFieldType } from './theme-editor-field.utils';
import { THEME_SETTINGS_CATALOG } from './theme-settings-catalog';

type Props = {
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onPaletteChange?: (colors: string[]) => void;
  initialExpandedId?: string;
};

/** Catalog theme settings — Logo/favicon, Colors, Typography, Buttons. */
export function ThemeSettingsNav({
  values,
  colorPalette,
  onFieldChange,
  onPaletteChange,
  initialExpandedId,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() =>
    initialExpandedId ? { [initialExpandedId]: true } : {}
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav className="pb-2" aria-label="Theme settings">
      {THEME_SETTINGS_CATALOG.map((item) => {
        const isOpen = expandedIds[item.id] === true;

        return (
          <div key={item.id} className="border-b border-[#e1e1e1]">
            <button
              type="button"
              onClick={() => toggleExpanded(item.id)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-3.5 text-left text-[15px] text-gray-900 transition-colors hover:bg-[#ededed] ${
                isOpen ? 'bg-[#f6f6f7]' : ''
              }`}
              aria-expanded={isOpen}
            >
              <span className="min-w-0 truncate font-normal">{item.label}</span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="bg-white px-3 pb-4 pt-1">
                {item.id === 'logo-favicon' ? (
                  <CatalogLogoFaviconSettingsPanel values={values} onFieldChange={onFieldChange} />
                ) : item.id === 'colors' ? (
                  <div className="space-y-2">
                    <p className="text-[12px] leading-relaxed text-gray-500">
                      Add swatches for the theme. The first color is used as background, the second
                      as text, and the third as the brand accent when present. Buttons and other
                      color fields can pick from these swatches.
                    </p>
                    <ThemeColorPaletteEditor
                      colors={colorPalette}
                      onChange={(next) => onPaletteChange?.(next)}
                    />
                  </div>
                ) : item.id === 'typography' ? (
                  <CatalogTypographySettingsPanel values={values} onFieldChange={onFieldChange} />
                ) : (
                  <ThemeButtonsSettingsPanel
                    values={values}
                    colorPalette={colorPalette}
                    onFieldChange={onFieldChange}
                    showPills={false}
                  />
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
