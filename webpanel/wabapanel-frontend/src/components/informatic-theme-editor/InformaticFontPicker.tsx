'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import {
  filterFontOptions,
  INFORMATIC_FONT_CATALOG,
  INFORMATIC_GOOGLE_FONT_OPTIONS,
  INFORMATIC_POPULAR_FONT_OPTIONS,
  INFORMATIC_SYSTEM_FONT_OPTIONS,
  labelForFontFamily,
  type InformaticFontOption,
} from '@/lib/informatic-theme/informatic-font-options';
import { InformaticGoogleFontLoader } from './InformaticGoogleFontLoader';

const PREVIEW_BATCH = 80;

type InformaticFontPickerProps = {
  value: string;
  onChange: (family: string) => void;
  ariaLabel: string;
};

function FontOptionRow({
  font,
  selected,
  onSelect,
}: {
  font: InformaticFontOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#f6f6f7] ${
        selected ? 'bg-[#eaf2ff]' : ''
      }`}
    >
      <span
        className="min-w-0 flex-1 truncate text-[15px] text-gray-900"
        style={{ fontFamily: font.family }}
      >
        {font.label}
      </span>
      {selected ? <Check className="h-4 w-4 shrink-0 text-[#005bd3]" aria-hidden /> : null}
    </button>
  );
}

function FontSection({
  title,
  description,
  fonts,
  selectedFamily,
  onSelect,
}: {
  title: string;
  description?: string;
  fonts: InformaticFontOption[];
  selectedFamily: string;
  onSelect: (family: string) => void;
}) {
  if (!fonts.length) return null;
  return (
    <section className="border-b border-[#e1e1e1] last:border-b-0">
      <div className="px-3 pb-1.5 pt-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
        {description ? (
          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>
      {fonts.map((font) => (
        <FontOptionRow
          key={`${font.value}-${font.family}`}
          font={font}
          selected={selectedFamily === font.family}
          onSelect={() => onSelect(font.family)}
        />
      ))}
    </section>
  );
}

export function InformaticFontPicker({ value, onChange, ariaLabel }: InformaticFontPickerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [previewCount, setPreviewCount] = useState(PREVIEW_BATCH);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedFamily = value || INFORMATIC_POPULAR_FONT_OPTIONS[0]?.family || '';
  const selectedLabel = labelForFontFamily(selectedFamily);

  const isSearching = query.trim().length > 0;
  const systemFonts = useMemo(
    () => filterFontOptions(INFORMATIC_SYSTEM_FONT_OPTIONS, query),
    [query]
  );
  const googleFonts = useMemo(
    () => filterFontOptions(INFORMATIC_GOOGLE_FONT_OPTIONS, query),
    [query]
  );
  const popularFonts = useMemo(() => {
    if (isSearching) return [];
    return INFORMATIC_POPULAR_FONT_OPTIONS;
  }, [isSearching]);

  const visibleGoogleFonts = useMemo(
    () => (isSearching ? googleFonts : googleFonts.slice(0, previewCount)),
    [googleFonts, isSearching, previewCount]
  );

  const previewFontNames = useMemo(() => {
    const names = new Set<string>();
    for (const font of [...popularFonts, ...visibleGoogleFonts]) {
      if (font.googleFont) names.add(font.googleFont);
    }
    const current = INFORMATIC_FONT_CATALOG.find((f) => f.family === selectedFamily);
    if (current?.googleFont) names.add(current.googleFont);
    return [...names];
  }, [popularFonts, selectedFamily, visibleGoogleFonts]);

  const onListScroll = useCallback(() => {
    if (isSearching) return;
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 96) {
      setPreviewCount((count) => Math.min(count + PREVIEW_BATCH, INFORMATIC_GOOGLE_FONT_OPTIONS.length));
    }
  }, [isSearching]);

  const openPicker = () => {
    setAnchorRect(buttonRef.current?.getBoundingClientRect() ?? null);
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
    setQuery('');
    setAnchorRect(null);
    setPreviewCount(PREVIEW_BATCH);
  };

  useEffect(() => {
    if (open) setPreviewCount(PREVIEW_BATCH);
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePicker();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const panel =
    open && anchorRect && typeof document !== 'undefined'
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[200] cursor-default bg-black/20"
              aria-label="Close font picker"
              onClick={closePicker}
            />
            <InformaticGoogleFontLoader fonts={previewFontNames} />
            <div
              className="fixed z-[210] flex flex-col overflow-hidden rounded-xl border border-[#e1e3e5] bg-white shadow-2xl"
              style={{
                left: Math.max(12, Math.min(anchorRect.left, window.innerWidth - 332)),
                top: Math.max(12, Math.min(anchorRect.bottom + 6, window.innerHeight - 420)),
                width: 320,
                maxHeight: Math.min(420, window.innerHeight - 24),
              }}
              role="dialog"
              aria-label={ariaLabel}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#e1e1e1] px-3 py-2.5">
                <h3 className="text-[14px] font-semibold text-gray-900">{ariaLabel}</h3>
                <button
                  type="button"
                  onClick={closePicker}
                  className="rounded-md p-1 text-gray-500 hover:bg-[#f1f1f1]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="shrink-0 px-3 py-2.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search fonts"
                    className="w-full rounded-lg border border-[#c9cccf] py-2 pl-8 pr-3 text-[13px] text-gray-900 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]"
                    autoFocus
                  />
                </div>
              </div>

              <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto" onScroll={onListScroll}>
                {isSearching ? (
                  <>
                    <FontSection
                      title="System fonts"
                      fonts={systemFonts}
                      selectedFamily={selectedFamily}
                      onSelect={(family) => {
                        onChange(family);
                        closePicker();
                      }}
                    />
                    <FontSection
                      title="Google fonts"
                      description={`${googleFonts.length} matching fonts`}
                      fonts={googleFonts}
                      selectedFamily={selectedFamily}
                      onSelect={(family) => {
                        onChange(family);
                        closePicker();
                      }}
                    />
                    {systemFonts.length === 0 && googleFonts.length === 0 ? (
                      <p className="px-3 py-8 text-center text-[13px] text-gray-500">No fonts found</p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <FontSection
                      title="Popular"
                      fonts={popularFonts}
                      selectedFamily={selectedFamily}
                      onSelect={(family) => {
                        onChange(family);
                        closePicker();
                      }}
                    />
                    <FontSection
                      title="System fonts"
                      description="Load faster on customer devices."
                      fonts={INFORMATIC_SYSTEM_FONT_OPTIONS}
                      selectedFamily={selectedFamily}
                      onSelect={(family) => {
                        onChange(family);
                        closePicker();
                      }}
                    />
                    <FontSection
                      title={`All Google fonts (${INFORMATIC_GOOGLE_FONT_OPTIONS.length})`}
                      description="Scroll for more — each name previews in its typeface."
                      fonts={visibleGoogleFonts}
                      selectedFamily={selectedFamily}
                      onSelect={(family) => {
                        onChange(family);
                        closePicker();
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={openPicker}
        className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-2 text-left shadow-sm hover:border-[#aeb4b9] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span
          className="min-w-0 flex-1 truncate text-[13px] text-gray-900"
          style={{ fontFamily: selectedFamily }}
        >
          {selectedLabel}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
      </button>
      {panel}
    </>
  );
}
