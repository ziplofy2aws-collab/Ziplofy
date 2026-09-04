'use client';

import toast from 'react-hot-toast';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, ImageIcon, Loader2, Search, Upload, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  fileNameFromKey,
  persistS3Meta,
  resolveStoreMediaUrl,
  storeMediaApi,
  uploadStoreMediaFile,
  type StoreMediaItem,
} from '@/lib/store-media';

export type StoreMediaLibraryPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  storeId: string | null;
  initialUrl?: string;
  title?: string;
};

type SortKey = 'newest' | 'name';

export function StoreMediaLibraryPickerModal({
  open,
  onClose,
  onSelect,
  storeId,
  initialUrl = '',
  title = 'Choose image',
}: StoreMediaLibraryPickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<StoreMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [pendingUrl, setPendingUrl] = useState(initialUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadMedia = useCallback(async () => {
    if (!storeId) {
      setFiles([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await storeMediaApi.list(storeId);
      const list = res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
      if (res.data?.s3?.bucket && res.data?.s3?.region) {
        persistS3Meta({ bucket: res.data.s3.bucket, region: res.data.s3.region });
      }
      setFiles(list);
    } catch (err) {
      setFiles([]);
      setLoadError((err as Error)?.message || 'Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setPendingUrl(initialUrl);
    setLoadError(null);
    void loadMedia();
  }, [open, initialUrl, loadMedia]);

  const selectable = useMemo(
    () =>
      files
        .map((item) => ({
          id: item._id,
          name: item.originalName || fileNameFromKey(item.key),
          url: resolveStoreMediaUrl(item),
          createdAt: item.createdAt,
        }))
        .filter((item): item is typeof item & { url: string } => Boolean(item.url)),
    [files]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = selectable;
    if (q) {
      list = list.filter(
        (item) => item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)
      );
    }
    if (sort === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [selectable, search, sort]);

  const handleUpload = async (file: File | undefined) => {
    if (!storeId) {
      toast.error('Select a store before uploading');
      return;
    }
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setUploading(true);
    try {
      const item = await uploadStoreMediaFile(storeId, file);
      setFiles((prev) => [item, ...prev]);
      setPendingUrl(resolveStoreMediaUrl(item));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error((err as Error)?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDone = () => {
    const url = pendingUrl.trim();
    if (!url) return;
    onSelect(url);
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 z-0 bg-black/45" aria-hidden />
      <div
        className="relative z-10 flex h-[min(520px,88vh)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-media-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-admin-border px-5 py-3.5">
          <h3 id="store-media-picker-title" className="text-[16px] font-semibold tracking-tight text-admin-text">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-admin-border px-5 py-3">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search images"
                className="w-full rounded-lg border border-admin-border bg-white py-2 pl-8 pr-3 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30"
                autoFocus
              />
            </div>
            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-lg border border-admin-border bg-white py-2 pl-3 pr-8 text-[13px] font-medium text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30"
                aria-label="Sort"
              >
                <option value="newest">Newest</option>
                <option value="name">Name</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
            </div>
          </div>
          {!loading && storeId && selectable.length > 0 ? (
            <p className="mt-2 text-[12px] text-admin-text-secondary">
              {selectable.length} image{selectable.length === 1 ? '' : 's'} in your store media library
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!storeId ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-admin-text">No store selected</p>
              <p className="mt-1 max-w-[280px] text-[13px] text-admin-text-secondary">
                Select a store from the account menu, then open this picker again.
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10">
              <Loader2 className="h-6 w-6 animate-spin text-admin-text-secondary" />
              <p className="text-[13px] text-admin-text-secondary">Loading media library…</p>
            </div>
          ) : loadError && selectable.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-admin-text">Could not load media</p>
              <p className="mt-1 max-w-[280px] text-[13px] text-admin-text-secondary">{loadError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <ImageIcon className="mb-3 h-12 w-12 text-admin-text-subdued" aria-hidden />
              <p className="text-[15px] font-semibold text-admin-text">No images found</p>
              <p className="mt-1 max-w-[280px] text-[13px] text-admin-text-secondary">
                {search.trim()
                  ? 'Try a different search, or upload a new image.'
                  : 'Upload an image to your store media library.'}
              </p>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-4 py-2 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7] disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((item) => {
                const selected = pendingUrl === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPendingUrl(item.url)}
                    className={`group overflow-hidden rounded-lg border-2 bg-[#f6f6f7] text-left transition-colors ${
                      selected
                        ? 'border-[#005bd3] ring-2 ring-[#005bd3]/25'
                        : 'border-transparent hover:border-admin-border'
                    }`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <p className="truncate px-1.5 py-1 text-[11px] text-admin-text-secondary">{item.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-admin-border px-5 py-3">
          <button
            type="button"
            disabled={uploading || !storeId}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#005bd3] hover:underline disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-admin-border bg-white px-4 py-2 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!pendingUrl.trim()}
              onClick={handleDone}
              className="rounded-lg bg-admin-text px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:bg-[#c9cccf] disabled:text-gray-500"
            >
              Done
            </button>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            void handleUpload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
    </div>,
    document.body
  );
}
