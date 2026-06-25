import { CircleStackIcon, ChevronUpDownIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { ThemeEditorImagePickerModal } from '../sidebar/ThemeEditorImagePickerModal';
import {
  THEME_LOGO_HEIGHT_MAX,
  THEME_LOGO_HEIGHT_MIN,
} from './theme-logo-favicon.settings';

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

type Props = {
  label: string;
  imageUrl: string;
  helper?: string;
  onChange: (url: string) => void;
};

export function ThemeLogoFaviconImageField({ label, imageUrl, helper, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasImage = Boolean(imageUrl.trim());
  const fileName = hasImage ? fileNameFromUrl(imageUrl) : null;

  const openPicker = () => setPickerOpen(true);

  return (
    <>
      <div className="space-y-2">
        <span className="block text-[13px] font-medium text-gray-800">{label}</span>

        {hasImage ? (
          <button
            type="button"
            onClick={openPicker}
            className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white px-2 py-2 text-left hover:border-[#aeb4b9]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-[#e1e1e1] bg-[#f6f6f7]">
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-gray-900">{fileName}</span>
            <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          </button>
        ) : null}

        <div className="rounded-lg border border-dashed border-[#c9cccf] bg-[#fafbfb] p-3">
          {!hasImage ? (
            <div className="mb-2 flex h-20 items-center justify-center rounded-md border border-[#e1e1e1] bg-white text-gray-400">
              <PhotoIcon className="h-8 w-8" />
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPicker}
              className="rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Select
            </button>
            <button
              type="button"
              title="Browse library"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              onClick={openPicker}
            >
              <CircleStackIcon className="h-4 w-4" />
            </button>
            {hasImage ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="ml-auto text-[12px] text-[#005bd3] hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="mt-2 text-[12px] text-[#005bd3] hover:underline"
            onClick={openPicker}
          >
            Explore free images
          </button>
        </div>

        {helper ? <p className="text-[12px] leading-relaxed text-gray-600">{helper}</p> : null}
      </div>
      <ThemeEditorImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialUrl={imageUrl}
        onSelect={(nextUrl) => {
          onChange(nextUrl);
          setPickerOpen(false);
        }}
      />
    </>
  );
}

export function ThemeLogoHeightField({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) =>
    Math.min(THEME_LOGO_HEIGHT_MAX, Math.max(THEME_LOGO_HEIGHT_MIN, Math.round(next)));

  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || draft.trim() === '') {
      setDraft(String(value));
      return;
    }
    const clamped = clamp(parsed);
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className="shrink-0 text-[13px] text-gray-800">{label}</span>
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="range"
            min={THEME_LOGO_HEIGHT_MIN}
            max={THEME_LOGO_HEIGHT_MAX}
            step={1}
            value={value}
            onChange={(e) => onChange(clamp(Number(e.target.value)))}
            onInput={(e) => onChange(clamp(Number((e.target as HTMLInputElement).value)))}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-gray-900"
            aria-label={label}
          />
          <div className="flex shrink-0 items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitDraft();
                }
              }}
              className="w-12 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
              aria-label={`${label} in pixels`}
            />
            <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">px</span>
          </div>
        </div>
      </div>
      {helper ? <p className="text-[12px] leading-relaxed text-gray-600">{helper}</p> : null}
    </div>
  );
}
