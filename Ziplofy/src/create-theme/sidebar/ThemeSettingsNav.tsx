import { ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import type { ThemeEditorFieldType } from './create-theme-field.utils';
import { THEME_SETTINGS_CATALOG } from './theme-settings-catalog';
import { ThemeLogoFaviconImageField, ThemeLogoHeightField } from '../settings/ThemeLogoFaviconImageField';
import { ThemeColorPaletteEditor } from '../settings/ThemeColorPaletteEditor';
import { ThemeAnimationsSettingsPanel } from '../settings/ThemeAnimationsSettingsPanel';
import { ThemeBadgesSettingsPanel } from '../settings/ThemeBadgesSettingsPanel';
import { ThemePageSettingsPanel } from '../settings/ThemePageSettingsPanel';
import { ThemeTypographySettingsPanel } from '../settings/ThemeTypographySettingsPanel';
import {
  THEME_LOGO_DEFAULT_PATH,
  THEME_LOGO_DESKTOP_HEIGHT_DEFAULT,
  THEME_LOGO_DESKTOP_HEIGHT_PATH,
  THEME_LOGO_FAVICON_PATH,
  THEME_LOGO_INVERSE_PATH,
  THEME_LOGO_MOBILE_HEIGHT_DEFAULT,
  THEME_LOGO_MOBILE_HEIGHT_PATH,
} from '../settings/theme-logo-favicon.settings';

type Props = {
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onPaletteChange: (colors: string[]) => void;
  storeName?: string;
  onManageStoreName?: () => void;
  initialExpandedId?: string;
};

function readImageValue(values: Record<string, string | boolean>, path: string): string {
  const raw = values[path];
  return typeof raw === 'string' ? raw : '';
}

function readNumberValue(
  values: Record<string, string | boolean>,
  path: string,
  fallback: number
): number {
  const raw = values[path];
  const parsed = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function renderLogoFaviconPanel(
  values: Record<string, string | boolean>,
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void,
  onManageStoreName?: () => void
) {
  return (
    <div className="space-y-5">
      {onManageStoreName ? (
        <button
          type="button"
          onClick={onManageStoreName}
          className="text-[13px] font-medium text-[#005bd3] hover:underline"
        >
          Manage store name
        </button>
      ) : null}

      <ThemeLogoFaviconImageField
        label="Default logo"
        imageUrl={readImageValue(values, THEME_LOGO_DEFAULT_PATH)}
        onChange={(url) => onFieldChange(THEME_LOGO_DEFAULT_PATH, 'text', url)}
      />

      <ThemeLogoFaviconImageField
        label="Inverse logo"
        imageUrl={readImageValue(values, THEME_LOGO_INVERSE_PATH)}
        helper="Used when transparent header background is set to Inverse"
        onChange={(url) => onFieldChange(THEME_LOGO_INVERSE_PATH, 'text', url)}
      />

      <ThemeLogoHeightField
        label="Desktop height"
        helper="Only affects header logo"
        value={readNumberValue(values, THEME_LOGO_DESKTOP_HEIGHT_PATH, THEME_LOGO_DESKTOP_HEIGHT_DEFAULT)}
        onChange={(height) => onFieldChange(THEME_LOGO_DESKTOP_HEIGHT_PATH, 'number', String(height))}
      />

      <ThemeLogoHeightField
        label="Mobile height"
        helper="Only affects header logo"
        value={readNumberValue(values, THEME_LOGO_MOBILE_HEIGHT_PATH, THEME_LOGO_MOBILE_HEIGHT_DEFAULT)}
        onChange={(height) => onFieldChange(THEME_LOGO_MOBILE_HEIGHT_PATH, 'number', String(height))}
      />

      <ThemeLogoFaviconImageField
        label="Favicon"
        imageUrl={readImageValue(values, THEME_LOGO_FAVICON_PATH)}
        onChange={(url) => onFieldChange(THEME_LOGO_FAVICON_PATH, 'text', url)}
      />
    </div>
  );
}

function renderColorPalettePanel(onPaletteChange: (colors: string[]) => void, colorPalette: string[]) {
  return <ThemeColorPaletteEditor colors={colorPalette} onChange={onPaletteChange} />;
}

function renderTypographyPanel(
  values: Record<string, string | boolean>,
  colorPalette: string[],
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void
) {
  return (
    <ThemeTypographySettingsPanel
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
    />
  );
}

function renderAnimationsPanel(
  values: Record<string, string | boolean>,
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void
) {
  return <ThemeAnimationsSettingsPanel values={values} onFieldChange={onFieldChange} />;
}

function renderBadgesPanel(
  values: Record<string, string | boolean>,
  colorPalette: string[],
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void
) {
  return (
    <ThemeBadgesSettingsPanel
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
    />
  );
}

function renderPagePanel(
  values: Record<string, string | boolean>,
  colorPalette: string[],
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void
) {
  return (
    <ThemePageSettingsPanel
      values={values}
      colorPalette={colorPalette}
      onFieldChange={onFieldChange}
    />
  );
}

function renderAccordionPanel(
  id: string,
  values: Record<string, string | boolean>,
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void,
  onManageStoreName: (() => void) | undefined,
  colorPalette: string[],
  onPaletteChange: (colors: string[]) => void
) {
  switch (id) {
    case 'logo-favicon':
      return renderLogoFaviconPanel(values, onFieldChange, onManageStoreName);
    case 'colors':
      return renderColorPalettePanel(onPaletteChange, colorPalette);
    case 'typography':
      return renderTypographyPanel(values, colorPalette, onFieldChange);
    case 'page-layout':
      return renderPagePanel(values, colorPalette, onFieldChange);
    case 'animations':
      return renderAnimationsPanel(values, onFieldChange);
    case 'badges':
      return renderBadgesPanel(values, colorPalette, onFieldChange);
    default:
      return (
        <p className="text-[13px] leading-relaxed text-gray-600">
          Settings for this group are coming soon.
        </p>
      );
  }
}

export function ThemeSettingsNav({
  values,
  colorPalette,
  onFieldChange,
  onPaletteChange,
  onManageStoreName,
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
        if (item.infoOnly) {
          return (
            <div
              key={item.id}
              className="flex w-full items-center justify-between gap-3 border-b border-[#e1e1e1] px-3 py-3.5 text-left text-[15px] text-gray-500"
            >
              <span className="min-w-0 truncate font-normal">{item.label}</span>
              <InformationCircleIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
            </div>
          );
        }

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
                className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="border-t border-[#e1e1e1] bg-white px-3 py-4">
                {renderAccordionPanel(
                  item.id,
                  values,
                  onFieldChange,
                  onManageStoreName,
                  colorPalette,
                  onPaletteChange
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
