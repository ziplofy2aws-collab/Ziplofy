import React, { useRef, useState } from 'react';
import { CheckoutColorPickerPopover } from '../checkout/settings/CheckoutColorPickerPopover';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import {
  getThemePaletteColor,
  isThemePaletteColorSetting,
  parseThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';

type Props = {
  label: string;
  path: string;
  values: Record<string, string | boolean>;
  colorPalette: string[];
  defaultPaletteIndex?: number;
  fallbackColor?: string;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
      <span className="text-[13px] text-gray-800">{label}</span>
      <div className="min-w-[148px] max-w-[180px]">{children}</div>
    </div>
  );
}

export function ThemePaletteColorField({
  label,
  path,
  values,
  colorPalette,
  defaultPaletteIndex = 0,
  fallbackColor = '#ffffff',
  onFieldChange,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const raw = typeof values[path] === 'string' ? String(values[path]) : 'palette';
  const parsed = parseThemePaletteColorSetting(raw, defaultPaletteIndex);
  const isPaletteLinked = isThemePaletteColorSetting(raw);
  const displayColor =
    parsed.kind === 'palette'
      ? getThemePaletteColor(colorPalette, parsed.index, fallbackColor)
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
      <SettingRow label={label}>
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
        onPaletteSelect={(index) => onFieldChange(path, 'text', themePaletteColorValue(index))}
        onClose={closePicker}
        onChange={(hex) => onFieldChange(path, 'text', hex)}
      />
    </>
  );
}
