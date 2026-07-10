import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import { ThemeTypographyFontPickerModal } from './ThemeTypographyFontPickerModal';
import {
  THEME_SYSTEM_FONT_PICKER_OPTIONS,
  THEME_TYPOGRAPHY_FONT_OPTIONS,
  normalizeThemeFontWeight,
  normalizeThemeTypographyFont,
  themeFontKeyPathForRole,
  themeFontWeightPathForRole,
  type ThemeFontWeightKey,
} from './theme-typography.settings';

type FontRole = 'body' | 'subheading' | 'heading' | 'accent';

const ROLE_TITLES: Record<FontRole, string> = {
  body: 'Select Body font',
  subheading: 'Select Subheading font',
  heading: 'Select Heading font',
  accent: 'Select Accent font',
};

function fontLabelForKey(fontKey: string): string {
  const normalized = normalizeThemeTypographyFont(fontKey);
  const system = THEME_SYSTEM_FONT_PICKER_OPTIONS.find((font) => font.value === normalized);
  if (system) return system.label;
  return THEME_TYPOGRAPHY_FONT_OPTIONS.find((font) => font.value === normalized)?.label ?? 'Inter';
}

type Props = {
  role: FontRole;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

export function ThemeFontPickerField({ role, values, onFieldChange }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const fontKeyPath = themeFontKeyPathForRole(role);
  const weightPath = themeFontWeightPathForRole(role);
  const fontKey = typeof values[fontKeyPath] === 'string' ? String(values[fontKeyPath]) : 'inter';
  const weightValue =
    typeof values[weightPath] === 'string' ? String(values[weightPath]) : 'regular';
  const label = fontLabelForKey(fontKey);

  const openPicker = () => {
    const rect = buttonRef.current?.getBoundingClientRect() ?? null;
    setAnchorRect(rect);
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
    setAnchorRect(null);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={openPicker}
        className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white py-2 pl-2.5 pr-2 text-left shadow-sm hover:border-[#aeb4b9]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium text-gray-700" aria-hidden>
          A
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-gray-900">{label}</span>
        <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
      </button>

      <ThemeTypographyFontPickerModal
        open={open}
        title={ROLE_TITLES[role]}
        value={fontKey}
        weightValue={weightValue}
        anchorRect={anchorRect}
        onClose={closePicker}
        onChange={(nextKey) => onFieldChange(fontKeyPath, 'text', nextKey)}
        onWeightChange={(weight: ThemeFontWeightKey) =>
          onFieldChange(weightPath, 'text', weight)
        }
      />
    </>
  );
}
