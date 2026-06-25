import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import { CheckoutColorPickerPopover } from '../checkout/settings/CheckoutColorPickerPopover';
import { normalizeHexColor } from '../checkout/settings/checkout-color.utils';
import {
  THEME_DEFAULT_COLOR_PALETTE,
  getThemePaletteColor,
} from './theme-color-palette.settings';

type Props = {
  colors: string[];
  onChange: (colors: string[]) => void;
};

export function ThemeColorPaletteEditor({ colors, onChange }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const swatchRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const openPicker = (index: number) => {
    const el = swatchRefs.current[index];
    if (!el) return;
    setActiveIndex(index);
    setAnchorRect(el.getBoundingClientRect());
  };

  const updatePalette = (next: string[]) => {
    onChange(
      next.map((color, index) =>
        normalizeHexColor(color, THEME_DEFAULT_COLOR_PALETTE[index] ?? '#000000')
      )
    );
  };

  const updateColor = (index: number, hex: string) => {
    const next = [...colors];
    next[index] = normalizeHexColor(hex, next[index] ?? '#000000');
    updatePalette(next);
  };

  const deleteColor = (index: number) => {
    if (colors.length <= 2) {
      const next = [...colors];
      next[index] = THEME_DEFAULT_COLOR_PALETTE[index] ?? '#000000';
      updatePalette(next);
    } else {
      updatePalette(colors.filter((_, i) => i !== index));
    }
    setActiveIndex(null);
    setAnchorRect(null);
  };

  const addColor = () => {
    const last = colors[colors.length - 1] ?? getThemePaletteColor(colors, 0, '#111827');
    updatePalette([...colors, last]);
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
          aria-label="Add color"
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
