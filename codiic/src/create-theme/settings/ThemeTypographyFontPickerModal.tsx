import { CheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckoutTypographyFontLoader } from '../checkout/preview/CheckoutTypographyFontLoader';
import type { CheckoutTypographyFontOption } from '../checkout/settings/checkout-typography-fonts';
import {
  THEME_FONT_WEIGHT_OPTIONS,
  THEME_OTHER_FONT_PICKER_OPTIONS,
  THEME_SYSTEM_FONT_PICKER_OPTIONS,
  THEME_TYPOGRAPHY_FONT_OPTIONS,
  normalizeThemeFontWeight,
  normalizeThemeTypographyFont,
  type ThemeFontWeightKey,
} from './theme-typography.settings';

type Props = {
  open: boolean;
  title: string;
  value: string;
  weightValue: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onChange: (fontKey: string) => void;
  onWeightChange: (weight: ThemeFontWeightKey) => void;
};

function useFilteredFonts(query: string, fonts: CheckoutTypographyFontOption[]) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter((font) => font.label.toLowerCase().includes(q));
  }, [fonts, query]);
}

function FontPreviewLoader({ fonts }: { fonts: string[] }) {
  return <CheckoutTypographyFontLoader fonts={fonts} />;
}

function FontRow({
  font,
  selected,
  weightValue,
  onSelect,
  onWeightChange,
}: {
  font: CheckoutTypographyFontOption;
  selected: boolean;
  weightValue: ThemeFontWeightKey;
  onSelect: () => void;
  onWeightChange: (weight: ThemeFontWeightKey) => void;
}) {
  return (
    <div className="border-b border-[#e1e1e1] last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f6f6f7] ${
          selected ? 'bg-[#f6f6f7]' : ''
        }`}
      >
        <span
          className="min-w-0 flex-1 truncate text-[15px] text-gray-900"
          style={{ fontFamily: font.family }}
        >
          {font.label}
        </span>
        {selected ? (
          <CheckIcon className="h-5 w-5 shrink-0 text-gray-900" strokeWidth={2} aria-hidden />
        ) : (
          <span className="h-5 w-5 shrink-0" aria-hidden />
        )}
      </button>
      {selected ? (
        <div className="px-4 pb-3">
          <div className="relative">
            <select
              value={weightValue}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onWeightChange(e.target.value as ThemeFontWeightKey)}
              className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
              aria-label={`${font.label} weight`}
            >
              {THEME_FONT_WEIGHT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronUpDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ThemeTypographyFontPickerModal({
  open,
  title,
  value,
  weightValue,
  anchorRect,
  onClose,
  onChange,
  onWeightChange,
}: Props) {
  const [query, setQuery] = useState('');
  const normalizedValue = normalizeThemeTypographyFont(value);
  const normalizedWeight = normalizeThemeFontWeight(weightValue);

  const systemFonts = useFilteredFonts(query, THEME_SYSTEM_FONT_PICKER_OPTIONS);
  const otherFonts = useFilteredFonts(query, THEME_OTHER_FONT_PICKER_OPTIONS);

  const previewFonts = useMemo(() => {
    const names = new Set<string>();
    const selected = THEME_TYPOGRAPHY_FONT_OPTIONS.find((font) => font.value === normalizedValue);
    if (selected?.googleFont) names.add(selected.googleFont);
    for (const font of [...systemFonts, ...otherFonts].slice(0, 24)) {
      if (font.googleFont) names.add(font.googleFont);
    }
    return [...names];
  }, [normalizedValue, systemFonts, otherFonts]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const panelWidth = 320;
  const left = Math.min(anchorRect.right + 8, window.innerWidth - panelWidth - 12);
  const top = Math.max(12, Math.min(anchorRect.top - 8, window.innerHeight - 520));
  const maxHeight = Math.min(520, window.innerHeight - top - 12);

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1390] cursor-default bg-black/20"
        aria-label="Close font picker"
        onClick={onClose}
      />
      <FontPreviewLoader fonts={previewFonts} />
      <div
        className="fixed z-[1400] flex flex-col overflow-hidden rounded-xl border border-[#e1e3e5] bg-white shadow-2xl"
        style={{ left, top, width: panelWidth, maxHeight }}
        role="dialog"
        aria-label={title}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e1e1] px-4 py-3">
          <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-[#f1f1f1] hover:text-gray-800"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="shrink-0 px-4 py-3">
          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-lg border border-[#c9cccf] bg-white py-2 pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
              autoFocus
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {systemFonts.length > 0 ? (
            <section>
              <div className="px-4 pb-2 pt-1">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  System fonts
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                  These fonts load faster and might appear differently on various devices.
                </p>
              </div>
              {systemFonts.map((font) => (
                <FontRow
                  key={font.value}
                  font={font}
                  selected={normalizedValue === font.value}
                  weightValue={normalizedWeight}
                  onSelect={() => onChange(font.value)}
                  onWeightChange={onWeightChange}
                />
              ))}
            </section>
          ) : null}

          {otherFonts.length > 0 ? (
            <section className="border-t border-[#e1e1e1]">
              <div className="px-4 pb-2 pt-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Other fonts
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                  These fonts are downloaded onto a customer&apos;s computer to be displayed on
                  their browser.
                </p>
              </div>
              {otherFonts.map((font) => (
                <FontRow
                  key={font.value}
                  font={font}
                  selected={normalizedValue === font.value}
                  weightValue={normalizedWeight}
                  onSelect={() => onChange(font.value)}
                  onWeightChange={onWeightChange}
                />
              ))}
            </section>
          ) : null}

          {systemFonts.length === 0 && otherFonts.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-gray-500">No fonts found</p>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end border-t border-[#e1e1e1] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
