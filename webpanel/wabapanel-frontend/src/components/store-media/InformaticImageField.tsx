'use client';

import { useState } from 'react';
import { FolderOpen, ImageIcon, Pencil } from 'lucide-react';
import { StoreMediaLibraryPickerModal } from './StoreMediaLibraryPickerModal';
import { ThemeEditorImageEditorSheet } from '@/components/informatic-theme-editor/ThemeEditorImageEditorSheet';

function fileNameFromUrl(url: string): string {
  if (!url.trim()) return 'image';
  if (url.startsWith('data:')) return 'Uploaded image';
  try {
    const path = new URL(url).pathname;
    const name = path.split('/').pop();
    return name ? decodeURIComponent(name) : 'image';
  } catch {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'image');
  }
}

export type InformaticImageFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  storeId: string | null;
  helper?: string;
  /** Show optional URL paste input (logo/favicon settings). */
  allowUrlPaste?: boolean;
  /** Show full image editor (crop, resize, draw). Default true. */
  enableEditor?: boolean;
  /** Show image style panel companion (used by InformaticFieldRow). */
  showExploreLink?: boolean;
};

/**
 * Image field for Informatic theme editor — media library picker + full image editor.
 */
export function InformaticImageField({
  label,
  value,
  onChange,
  storeId,
  helper,
  allowUrlPaste = false,
  enableEditor = true,
  showExploreLink = true,
}: InformaticImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const hasImage = Boolean(value.trim());
  const fileName = hasImage ? fileNameFromUrl(value) : null;
  const canEdit = enableEditor && hasImage;

  return (
    <>
      <div className="space-y-2">
        <span className="block text-[13px] font-medium text-admin-text">{label}</span>

        <div className="rounded-lg border border-dashed border-admin-border bg-[#fafbfb] p-3">
          {hasImage ? (
            <div className="relative mb-2 overflow-hidden rounded-md border border-admin-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="max-h-28 w-full object-cover" />
              {canEdit ? (
                <button
                  type="button"
                  title="Edit image"
                  onClick={() => setEditorOpen(true)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border bg-white/95 text-admin-text shadow-sm hover:bg-white"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mb-2 flex h-20 items-center justify-center rounded-md border border-admin-border bg-white text-admin-text-subdued">
              <ImageIcon className="h-8 w-8" aria-hidden />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text shadow-sm hover:bg-[#f6f6f7]"
            >
              Select
            </button>
            <button
              type="button"
              title="Browse media library"
              onClick={() => setPickerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-text-secondary shadow-sm hover:bg-[#f6f6f7]"
            >
              <FolderOpen className="h-4 w-4" aria-hidden />
            </button>
            {canEdit ? (
              <button
                type="button"
                title="Edit image"
                onClick={() => setEditorOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-text-secondary shadow-sm hover:bg-[#f6f6f7]"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
            {hasImage ? (
              <button
                type="button"
                className="text-[12px] font-medium text-[#005bd3] hover:underline"
                onClick={() => onChange('')}
              >
                Clear
              </button>
            ) : null}
          </div>

          {showExploreLink ? (
            <button
              type="button"
              className="mt-2 text-[12px] font-medium text-[#005bd3] hover:underline"
              onClick={() => setPickerOpen(true)}
            >
              Explore free images
            </button>
          ) : null}

          {hasImage && fileName ? (
            <p className="mt-2 truncate text-[11px] text-admin-text-secondary" title={fileName}>
              {fileName}
            </p>
          ) : null}

          {allowUrlPaste ? (
            <label className="mt-2 block">
              <span className="mb-1 block text-[11px] text-admin-text-secondary">Or paste image URL</span>
              <input
                type="url"
                value={hasImage && !value.startsWith('data:') ? value : ''}
                onChange={(e) => onChange(e.target.value.trim())}
                placeholder="https://…"
                className="w-full rounded-lg border border-admin-border bg-white px-2.5 py-1.5 text-[12px] text-admin-text outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]/30"
              />
            </label>
          ) : null}

          {!storeId ? (
            <p className="mt-2 text-[11px] text-amber-800">
              Select a store to pick images from your media library.
            </p>
          ) : null}
        </div>

        {helper ? <p className="text-[12px] leading-relaxed text-admin-text-secondary">{helper}</p> : null}
      </div>

      <StoreMediaLibraryPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        storeId={storeId}
        initialUrl={value}
        title={label}
      />

      {enableEditor ? (
        <ThemeEditorImageEditorSheet
          open={editorOpen}
          imageUrl={value}
          storeId={storeId}
          onClose={() => setEditorOpen(false)}
          onSaved={onChange}
        />
      ) : null}
    </>
  );
}
