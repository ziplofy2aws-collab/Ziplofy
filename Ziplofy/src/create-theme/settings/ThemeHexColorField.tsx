import React, { useRef, useState } from 'react';
import { CheckoutColorPickerPopover } from '../checkout/settings/CheckoutColorPickerPopover';
import { normalizeHexColor } from '../checkout/settings/checkout-color.utils';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';

type Props = {
  label: string;
  path: string;
  values: Record<string, string | boolean>;
  defaultColor?: string;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

function displayHexColor(raw: string, defaultColor: string): string {
  const text = (raw || defaultColor).trim();
  const withHash = text.startsWith('#') ? text : `#${text}`;
  if (/^#[0-9a-fA-F]{6}$/i.test(withHash)) return withHash.toLowerCase();
  if (/^#[0-9a-fA-F]{8}$/i.test(withHash)) return withHash.toLowerCase();
  return normalizeHexColor(defaultColor, '#00000026');
}

function pickerHexColor(color: string): string {
  if (/^#[0-9a-fA-F]{8}$/i.test(color)) return color.slice(0, 7).toLowerCase();
  return normalizeHexColor(color, '#000000');
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1.5">
      <span className="text-[13px] text-gray-800">{label}</span>
      <div className="min-w-[148px] max-w-[180px]">{children}</div>
    </div>
  );
}

/** Hex-only color row with anchored popover (works inside the bottom settings sheet). */
export function ThemeHexColorField({
  label,
  path,
  values,
  defaultColor = '#00000026',
  onFieldChange,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const raw = typeof values[path] === 'string' ? String(values[path]) : '';
  const displayColor = displayHexColor(raw, defaultColor);
  const pickerColor = pickerHexColor(displayColor);

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
          <span className="truncate">{displayColor.toUpperCase()}</span>
        </button>
      </SettingRow>
      <CheckoutColorPickerPopover
        open={open}
        color={pickerColor}
        anchorRect={anchorRect}
        onClose={closePicker}
        onChange={(hex) => onFieldChange(path, 'text', hex)}
      />
    </>
  );
}
