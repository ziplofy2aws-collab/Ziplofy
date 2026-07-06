import { useRef, useState } from 'react';
import { CheckoutColorPickerPopover } from '../checkout/settings/CheckoutColorPickerPopover';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import {
  getThemePaletteColor,
  parseThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';

type Props = {
  label: string;
  path: string;
  values: Record<string, string | boolean>;
  colorPalette: string[];
  /** Palette index used when the picker opens from an empty ("Default") state. */
  defaultPaletteIndex?: number;
  fallbackColor?: string;
  /** Label shown for the empty/unset state (defaults to "Default"). */
  emptyLabel?: string;
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

/**
 * Color field with a "Default" (unset) state shown as a diagonal-slash swatch.
 * Empty value = Default (inherits); picking a palette/custom color overrides it,
 * and the picker's Delete action resets back to Default.
 */
export function ThemeDefaultColorField({
  label,
  path,
  values,
  colorPalette,
  defaultPaletteIndex = 1,
  fallbackColor = '#111827',
  emptyLabel = 'Default',
  onFieldChange,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const raw = typeof values[path] === 'string' ? String(values[path]).trim() : '';
  const isDefault = raw === '' || raw === 'default';
  const parsed = parseThemePaletteColorSetting(raw, defaultPaletteIndex);
  const isPaletteLinked = !isDefault && parsed.kind === 'palette';
  const displayColor = isDefault
    ? '#ffffff'
    : parsed.kind === 'palette'
      ? getThemePaletteColor(colorPalette, parsed.index, fallbackColor)
      : parsed.hex;
  const activePaletteIndex = isPaletteLinked ? parsed.index : null;
  const labelText = isDefault ? emptyLabel : isPaletteLinked ? 'Palette color' : displayColor.toUpperCase();

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
            style={
              isDefault
                ? {
                    backgroundColor: '#ffffff',
                    backgroundImage:
                      'linear-gradient(45deg, transparent 44%, #d1d5db 44%, #d1d5db 56%, transparent 56%)',
                  }
                : { background: displayColor }
            }
            aria-hidden
          />
          <span className="truncate">{labelText}</span>
        </button>
      </SettingRow>
      <CheckoutColorPickerPopover
        open={open}
        color={isDefault ? getThemePaletteColor(colorPalette, defaultPaletteIndex, fallbackColor) : displayColor}
        anchorRect={anchorRect}
        paletteColors={colorPalette}
        activePaletteIndex={activePaletteIndex}
        onPaletteSelect={(index) => onFieldChange(path, 'text', themePaletteColorValue(index))}
        onChange={(hex) => onFieldChange(path, 'text', hex)}
        onDelete={() => {
          onFieldChange(path, 'text', '');
          closePicker();
        }}
        onClose={closePicker}
      />
    </>
  );
}
