import { ThemeFontPickerField } from './ThemeFontPickerField';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import { CheckoutColorPickerPopover } from '../checkout/settings/CheckoutColorPickerPopover';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import {
  THEME_DEFAULT_TEXT_PRESETS,
  THEME_FONT_ROLE_OPTIONS,
  THEME_FONT_SIZE_OPTIONS,
  THEME_HEADING_ACCENT_FONT_OPTIONS,
  THEME_LETTER_SPACING_OPTIONS,
  THEME_LINE_HEIGHT_OPTIONS,
  THEME_TEXT_CASE_OPTIONS,
  THEME_TYPOGRAPHY_TEXT_COLOR_PATH,
  isThemeTypographyPaletteColor,
  parseThemeTypographyTextColorSetting,
  themeTypographyTextColorPaletteValue,
  themePresetPath,
  type ThemeTextPresetId,
} from './theme-typography.settings';
import { getThemePaletteColor } from './theme-color-palette.settings';

type Props = {
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

function readString(values: Record<string, string | boolean>, path: string, fallback = ''): string {
  const raw = values[path];
  return typeof raw === 'string' ? raw : fallback;
}

function readNumber(values: Record<string, string | boolean>, path: string, fallback: number): number {
  const raw = values[path];
  const parsed = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
      <span className="text-[13px] text-gray-800">{label}</span>
      <div className="min-w-[148px] max-w-[180px]">{children}</div>
    </div>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-lg border border-[#c9cccf] bg-[#f1f1f1] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ThemeSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string }> | ReadonlyArray<string>;
  onChange: (value: string) => void;
}) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      >
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronUpDownIcon
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        aria-hidden
      />
    </div>
  );
}

function TextColorField({
  values,
  colorPalette,
  onFieldChange,
}: {
  values: Record<string, string | boolean>;
  colorPalette: string[];
  onFieldChange: Props['onFieldChange'];
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const rawTextColor = readString(values, THEME_TYPOGRAPHY_TEXT_COLOR_PATH, 'palette');
  const parsed = parseThemeTypographyTextColorSetting(rawTextColor);
  const isPaletteLinked = isThemeTypographyPaletteColor(rawTextColor);
  const displayColor =
    parsed.kind === 'palette'
      ? getThemePaletteColor(colorPalette, parsed.index, '#111827')
      : parsed.hex;

  const activePaletteIndex = parsed.kind === 'palette' ? parsed.index : null;

  const openPicker = () => {
    const el = buttonRef.current;
    if (!el) return;
    setAnchorRect(el.getBoundingClientRect());
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
    setAnchorRect(null);
  };

  return (
    <>
      <SettingRow label="Text">
        <button
          ref={buttonRef}
          type="button"
          onClick={openPicker}
          className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-2.5 py-2 text-left text-[13px] text-gray-900 shadow-sm hover:border-[#aeb4b9]"
        >
          <span
            className="h-5 w-5 shrink-0 rounded-md border border-[#e1e3e5]"
            style={{ background: displayColor }}
            aria-hidden
          />
          <span className="truncate">
            {isPaletteLinked ? 'Palette color' : displayColor.toUpperCase()}
          </span>
        </button>
      </SettingRow>
      <CheckoutColorPickerPopover
        open={open}
        color={displayColor}
        anchorRect={anchorRect}
        paletteColors={colorPalette}
        activePaletteIndex={activePaletteIndex}
        onPaletteSelect={(index) => {
          onFieldChange(
            THEME_TYPOGRAPHY_TEXT_COLOR_PATH,
            'text',
            themeTypographyTextColorPaletteValue(index)
          );
        }}
        onClose={closePicker}
        onChange={(hex) => onFieldChange(THEME_TYPOGRAPHY_TEXT_COLOR_PATH, 'text', hex)}
      />
    </>
  );
}

const PRESET_SECTIONS: Array<{
  id: ThemeTextPresetId;
  label: string;
  fontControl: 'roles' | 'heading-accent';
}> = [
  { id: 'paragraph', label: 'Paragraph', fontControl: 'roles' },
  { id: 'h1', label: 'Heading 1', fontControl: 'heading-accent' },
  { id: 'h2', label: 'Heading 2', fontControl: 'heading-accent' },
  { id: 'h3', label: 'Heading 3', fontControl: 'roles' },
  { id: 'h4', label: 'Heading 4', fontControl: 'roles' },
  { id: 'h5', label: 'Heading 5', fontControl: 'roles' },
  { id: 'h6', label: 'Heading 6', fontControl: 'roles' },
];

function TextPresetSection({
  presetId,
  label,
  fontControl,
  values,
  onFieldChange,
}: {
  presetId: ThemeTextPresetId;
  label: string;
  fontControl: 'roles' | 'heading-accent';
  values: Record<string, string | boolean>;
  onFieldChange: Props['onFieldChange'];
}) {
  const defaults = THEME_DEFAULT_TEXT_PRESETS[presetId];
  const font = readString(values, themePresetPath(presetId, 'font'), defaults.font);
  const size = readNumber(values, themePresetPath(presetId, 'size'), defaults.size);
  const lineHeight = readString(values, themePresetPath(presetId, 'lineHeight'), defaults.lineHeight);
  const letterSpacing = readString(
    values,
    themePresetPath(presetId, 'letterSpacing'),
    defaults.letterSpacing
  );
  const textCase = readString(values, themePresetPath(presetId, 'textCase'), defaults.textCase);

  return (
    <div className="border-t border-[#e1e1e1] pt-4 first:border-t-0 first:pt-0">
      <h4 className="mb-2 text-[13px] font-semibold text-gray-900">{label}</h4>
      <div className="space-y-0.5">
        {presetId !== 'paragraph' ? (
          <SettingRow label="Font">
            {fontControl === 'heading-accent' ? (
              <SegmentedControl
                value={font === 'accent' ? 'accent' : 'heading'}
                options={THEME_HEADING_ACCENT_FONT_OPTIONS}
                onChange={(next) => onFieldChange(themePresetPath(presetId, 'font'), 'text', next)}
              />
            ) : (
              <ThemeSelect
                value={font}
                options={THEME_FONT_ROLE_OPTIONS.filter((opt) => opt.value !== 'body')}
                onChange={(next) => onFieldChange(themePresetPath(presetId, 'font'), 'text', next)}
              />
            )}
          </SettingRow>
        ) : null}
        <SettingRow label="Size">
          <ThemeSelect
            value={`${size}px`}
            options={THEME_FONT_SIZE_OPTIONS}
            onChange={(next) => {
              const parsed = parseInt(next, 10);
              if (Number.isFinite(parsed)) {
                onFieldChange(themePresetPath(presetId, 'size'), 'number', String(parsed));
              }
            }}
          />
        </SettingRow>
        <SettingRow label="Line height">
          <ThemeSelect
            value={lineHeight}
            options={THEME_LINE_HEIGHT_OPTIONS}
            onChange={(next) => onFieldChange(themePresetPath(presetId, 'lineHeight'), 'text', next)}
          />
        </SettingRow>
        {presetId !== 'paragraph' ? (
          <SettingRow label="Letter spacing">
            <ThemeSelect
              value={letterSpacing}
              options={THEME_LETTER_SPACING_OPTIONS}
              onChange={(next) =>
                onFieldChange(themePresetPath(presetId, 'letterSpacing'), 'text', next)
              }
            />
          </SettingRow>
        ) : null}
        {presetId !== 'paragraph' ? (
          <SettingRow label="Case">
            <SegmentedControl
              value={textCase}
              options={THEME_TEXT_CASE_OPTIONS}
              onChange={(next) => onFieldChange(themePresetPath(presetId, 'textCase'), 'text', next)}
            />
          </SettingRow>
        ) : null}
      </div>
    </div>
  );
}

export function ThemeTypographySettingsPanel({ values, colorPalette, onFieldChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-gray-900">Colors</h3>
        <TextColorField values={values} colorPalette={colorPalette} onFieldChange={onFieldChange} />
        <p className="mt-2 text-[12px] leading-relaxed text-gray-600">
          Default for theme sections. Sections with a custom background color will use this text color
          only when there is sufficient color contrast.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-gray-900">Fonts</h3>
        <div className="space-y-3">
          <SettingRow label="Body">
            <ThemeFontPickerField role="body" values={values} onFieldChange={onFieldChange} />
          </SettingRow>
          <SettingRow label="Subheading">
            <ThemeFontPickerField role="subheading" values={values} onFieldChange={onFieldChange} />
          </SettingRow>
          <SettingRow label="Heading">
            <ThemeFontPickerField role="heading" values={values} onFieldChange={onFieldChange} />
          </SettingRow>
          <SettingRow label="Accent">
            <ThemeFontPickerField role="accent" values={values} onFieldChange={onFieldChange} />
          </SettingRow>
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-[13px] font-semibold text-gray-900">Text presets</h3>
        <p className="mb-4 text-[12px] leading-relaxed text-gray-600">
          Sizes automatically scale for all screen sizes.
        </p>
        <div className="space-y-4">
          {PRESET_SECTIONS.map((section) => (
            <TextPresetSection
              key={section.id}
              presetId={section.id}
              label={section.label}
              fontControl={section.fontControl}
              values={values}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
