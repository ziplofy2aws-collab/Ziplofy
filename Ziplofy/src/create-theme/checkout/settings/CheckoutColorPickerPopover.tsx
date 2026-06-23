import { EyeDropperIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  hexToHsv,
  hsvToHex,
  normalizeHexColor,
} from './checkout-color.utils';

type Props = {
  open: boolean;
  color: string;
  anchorRect: DOMRect | null;
  onChange: (color: string) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function CheckoutColorPickerPopover({
  open,
  color,
  anchorRect,
  onChange,
  onDelete,
  onClose,
}: Props) {
  const [hsv, setHsv] = useState(() => hexToHsv(color));
  const [hexDraft, setHexDraft] = useState(color.toUpperCase());
  const satValRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const next = hexToHsv(color);
    setHsv(next);
    setHexDraft(normalizeHexColor(color, '#000000').toUpperCase());
  }, [open, color]);

  const commitHsv = useCallback(
    (next: { h: number; s: number; v: number }) => {
      setHsv(next);
      const hex = hsvToHex(next.h, next.s, next.v);
      setHexDraft(hex.toUpperCase());
      onChange(hex);
    },
    [onChange]
  );

  const pickFromSatVal = useCallback(
    (clientX: number, clientY: number) => {
      const el = satValRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
      const y = Math.min(rect.height, Math.max(0, clientY - rect.top));
      const s = x / rect.width;
      const v = 1 - y / rect.height;
      commitHsv({ h: hsv.h, s, v });
    },
    [commitHsv, hsv.h]
  );

  useEffect(() => {
    if (!open) return;
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      pickFromSatVal(e.clientX, e.clientY);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [open, pickFromSatVal]);

  const handleEyedropper = async () => {
    if (!('EyeDropper' in window)) return;
    try {
      const eyeDropper = new (window as Window & { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
      const result = await eyeDropper.open();
      const hex = normalizeHexColor(result.sRGBHex, color);
      onChange(hex);
      commitHsv(hexToHsv(hex));
    } catch {
      /* cancelled */
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const top = Math.min(anchorRect.top, window.innerHeight - 320);
  const left = Math.min(anchorRect.right + 8, window.innerWidth - 280);

  const hueColor = hsvToHex(hsv.h, 1, 1);

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1390] cursor-default bg-transparent"
        aria-label="Close color picker"
        onClick={onClose}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <div
        className="fixed z-[1400] w-[252px] rounded-xl border border-[#e1e3e5] bg-white p-3 shadow-xl"
        style={{ top, left }}
        role="dialog"
        aria-label="Color picker"
      >
        <div
          ref={satValRef}
          className="relative h-40 cursor-crosshair overflow-hidden rounded-lg"
          style={{ backgroundColor: hueColor }}
          onPointerDown={(e) => {
            draggingRef.current = true;
            pickFromSatVal(e.clientX, e.clientY);
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <span
            className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{
              left: `${hsv.s * 100}%`,
              top: `${(1 - hsv.v) * 100}%`,
              backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v),
            }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleEyedropper()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e1e3e5] text-gray-700 hover:bg-[#f6f6f7]"
            title="Pick color"
          >
            <EyeDropperIcon className="h-4 w-4" aria-hidden />
          </button>
          <input
            type="text"
            value={hexDraft}
            onChange={(e) => setHexDraft(e.target.value.toUpperCase())}
            onBlur={() => {
              const hex = normalizeHexColor(hexDraft, color);
              onChange(hex);
              commitHsv(hexToHsv(hex));
            }}
            className="min-w-0 flex-1 rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
            aria-label="Hex color"
          />
        </div>

        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hsv.h)}
          onChange={(e) => commitHsv({ ...hsv, h: Number(e.target.value) })}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background:
              'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
          }}
          aria-label="Hue"
        />

        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium text-[#8e0b21] hover:bg-[#fff4f4]"
          >
            <TrashIcon className="h-4 w-4" aria-hidden />
            Delete
          </button>
        ) : null}
      </div>
    </>,
    document.body
  );
}
