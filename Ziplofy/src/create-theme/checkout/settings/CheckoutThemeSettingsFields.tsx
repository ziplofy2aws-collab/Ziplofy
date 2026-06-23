import { ChevronUpDownIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useRef, useState } from 'react';
import { ThemeEditorImagePickerModal } from '../../sidebar/ThemeEditorImagePickerModal';
import { CheckoutColorPickerPopover } from './CheckoutColorPickerPopover';
import { normalizeHexColor } from './checkout-color.utils';
import {
  CHECKOUT_DEFAULT_COLOR_PALETTE,
  syncSettingsFromPalette,
} from './checkout-settings.types';
import {
  CHECKOUT_MAX_LOGO_WIDTH,
  CHECKOUT_MIN_LOGO_WIDTH,
  type CheckoutColorSetting,
  type CheckoutLogoAlignment,
  resolveCheckoutColorSetting,
} from './checkout-settings.types';
import {
  CHECKOUT_TYPOGRAPHY_FONT_OPTIONS,
  normalizeCheckoutTypographyFont,
} from './checkout-typography-fonts';

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url, window.location.origin).pathname;
    const name = path.split('/').pop();
    return name ? decodeURIComponent(name) : 'image';
  } catch {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'image');
  }
}

export function CheckoutSettingsRow({
  label,
  children,
  helper,
}: {
  label: string;
  children: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="space-y-2">
        <span className="block text-[13px] text-gray-800">{label}</span>
        <div className="min-w-0 w-full">{children}</div>
      </div>
      {helper ? (
        <p className="text-[12px] leading-relaxed text-gray-600">{helper}</p>
      ) : null}
    </div>
  );
}

export function CheckoutDefaultColorSelect({
  id,
  value,
  defaultHex,
  onChange,
}: {
  id: string;
  value: CheckoutColorSetting;
  defaultHex: string;
  onChange: (value: CheckoutColorSetting) => void;
}) {
  const resolved = resolveCheckoutColorSetting(value, defaultHex);
  const isDefault = value === 'default';
  const displayLabel = useMemo(() => (isDefault ? 'Default' : resolved.toUpperCase()), [isDefault, resolved]);

  return (
    <div className="relative w-full min-w-0 max-w-full">
      <span
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded border border-[#e1e3e5]"
        style={{ background: resolved }}
        aria-hidden
      />
      <select
        id={id}
        value={isDefault ? 'default' : 'custom'}
        onChange={(e) => {
          if (e.target.value === 'default') onChange('default');
          else if (isDefault) onChange(defaultHex);
        }}
        className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-9 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      >
        <option value="default">{displayLabel}</option>
        <option value="custom">Custom</option>
      </select>
      <ChevronUpDownIcon
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        aria-hidden
      />
    </div>
  );
}

export function CheckoutThemeColorField({
  value,
  defaultHex,
  paletteColor,
  onChange,
}: {
  value: CheckoutColorSetting;
  defaultHex: string;
  paletteColor?: string;
  onChange: (value: CheckoutColorSetting) => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const resolved = resolveCheckoutColorSetting(value, defaultHex);
  const label =
    value === 'default'
      ? 'Default'
      : paletteColor &&
          normalizeHexColor(resolved, defaultHex) === normalizeHexColor(paletteColor, defaultHex)
        ? 'Palette color'
        : resolved.toUpperCase();

  const openPicker = () => {
    const rect = buttonRef.current?.getBoundingClientRect() ?? null;
    setAnchorRect(rect);
    setOpen(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={openPicker}
        className="flex w-full min-w-0 max-w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-left hover:bg-[#fafafa]"
      >
        <span
          className="h-4 w-4 shrink-0 rounded border border-[#e1e3e5]"
          style={{ background: resolved }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-[13px] text-gray-900">{label}</span>
        <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
      </button>
      <CheckoutColorPickerPopover
        open={open}
        color={resolved}
        anchorRect={anchorRect}
        onChange={(hex) => onChange(normalizeHexColor(hex, defaultHex))}
        onDelete={() => {
          onChange('default');
          setOpen(false);
          setAnchorRect(null);
        }}
        onClose={() => {
          setOpen(false);
          setAnchorRect(null);
        }}
      />
    </>
  );
}

const ALIGNMENT_OPTIONS: Array<{ value: CheckoutLogoAlignment; label: string }> = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export function CheckoutSegmentedAlignment({
  value,
  onChange,
}: {
  value: CheckoutLogoAlignment;
  onChange: (value: CheckoutLogoAlignment) => void;
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full rounded-lg border border-[#c9cccf] bg-[#f6f6f7] p-0.5">
      {ALIGNMENT_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors ${
              selected
                ? 'border border-[#c9cccf] bg-white text-gray-900 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function CheckoutLogoImageField({
  imageUrl,
  onChange,
}: {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileName = imageUrl ? fileNameFromUrl(imageUrl) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="block w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-[#c9cccf] bg-white text-left hover:border-[#aeb4b9]"
      >
        {imageUrl ? (
          <span className="relative block h-24 w-full">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1.5 text-[11px] text-white">
              {fileName}
            </span>
          </span>
        ) : (
          <span className="flex h-24 w-full items-center justify-center gap-2 px-3 text-[13px] text-gray-900">
            <PhotoIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
            <span>Add image</span>
            <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          </span>
        )}
      </button>
      <ThemeEditorImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialUrl={imageUrl ?? ''}
        onSelect={(url) => {
          onChange(url);
          setPickerOpen(false);
        }}
      />
    </>
  );
}

export function CheckoutLogoWidthField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const clampWidth = (next: number) =>
    Math.min(CHECKOUT_MAX_LOGO_WIDTH, Math.max(CHECKOUT_MIN_LOGO_WIDTH, Math.round(next)));

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-[13px] text-gray-800">Width</span>
      <div className="ml-auto flex items-center gap-2">
        <input
          type="range"
          min={CHECKOUT_MIN_LOGO_WIDTH}
          max={CHECKOUT_MAX_LOGO_WIDTH}
          step={1}
          value={value}
          onChange={(e) => onChange(clampWidth(Number(e.target.value)))}
          className="h-1.5 w-[120px] cursor-pointer accent-gray-900"
          aria-label="Logo width"
        />
        <div className="flex items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
          <input
            type="number"
            min={CHECKOUT_MIN_LOGO_WIDTH}
            max={CHECKOUT_MAX_LOGO_WIDTH}
            step={1}
            value={value}
            onChange={(e) => onChange(clampWidth(Number(e.target.value)))}
            className="w-10 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
            aria-label="Logo width"
          />
          <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">px</span>
        </div>
      </div>
    </div>
  );
}

export function CheckoutTypographyFontSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const normalized = normalizeCheckoutTypographyFont(value);

  return (
    <div className="relative w-full min-w-0 max-w-full">
      <select
        id={id}
        value={normalized}
        onChange={(e) => onChange(e.target.value)}
        className="max-h-[280px] w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      >
        {CHECKOUT_TYPOGRAPHY_FONT_OPTIONS.map((option) => (
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

export function CheckoutDefaultFontSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full min-w-0 max-w-full">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
      >
        <option value="default">Default</option>
      </select>
      <ChevronUpDownIcon
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        aria-hidden
      />
    </div>
  );
}

export function CheckoutColorPaletteEditor({
  colors,
  onChange,
}: {
  colors: string[];
  onChange: (patch: ReturnType<typeof syncSettingsFromPalette>) => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const swatchRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const openPicker = (index: number) => {
    const el = swatchRefs.current[index];
    if (!el) return;
    setActiveIndex(index);
    setAnchorRect(el.getBoundingClientRect());
  };

  const updateColor = (index: number, hex: string) => {
    const next = [...colors];
    next[index] = normalizeHexColor(hex, next[index] ?? '#000000');
    onChange(syncSettingsFromPalette(next));
  };

  const deleteColor = (index: number) => {
    if (colors.length <= 2) {
      const defaults = [...CHECKOUT_DEFAULT_COLOR_PALETTE];
      const next = [...colors];
      next[index] = defaults[index] ?? defaults[0];
      onChange(syncSettingsFromPalette(next));
    } else {
      const next = colors.filter((_, i) => i !== index);
      onChange(syncSettingsFromPalette(next));
    }
    setActiveIndex(null);
    setAnchorRect(null);
  };

  const addColor = () => {
    const next = [...colors, colors[colors.length - 1] ?? '#005bd3'];
    onChange(syncSettingsFromPalette(next));
  };

  const activeColor = activeIndex === null ? null : colors[activeIndex];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {colors.map((color, index) => {
          const isActive = activeIndex === index;
          const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
          return (
            <button
              key={`${color}-${index}`}
              ref={(el) => {
                swatchRefs.current[index] = el;
              }}
              type="button"
              onClick={() => openPicker(index)}
              className={`h-9 w-9 rounded-lg border shadow-sm transition-shadow ${
                isActive ? 'ring-2 ring-[#005bd3] ring-offset-1' : 'border-[#e1e3e5]'
              } ${isWhite ? 'bg-white' : ''}`}
              style={{ background: isWhite ? undefined : color }}
              title={color}
              aria-label={`Edit color ${color}`}
            />
          );
        })}
        <button
          type="button"
          onClick={addColor}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e3e5] bg-[#f6f6f7] text-gray-800 hover:bg-[#ededed]"
          title="Add color"
        >
          <PlusIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <CheckoutColorPickerPopover
        open={activeIndex !== null && Boolean(activeColor)}
        color={activeColor ?? '#000000'}
        anchorRect={anchorRect}
        onChange={(hex) => {
          if (activeIndex === null) return;
          updateColor(activeIndex, hex);
        }}
        onDelete={activeIndex === null ? undefined : () => deleteColor(activeIndex)}
        onClose={() => {
          setActiveIndex(null);
          setAnchorRect(null);
        }}
      />
    </>
  );
}
