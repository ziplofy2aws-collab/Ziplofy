import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useStore } from '../../../contexts/store.context';
import {
  defaultContentFilesFolder,
  fileNameFromStorageKey,
  isImageStorageKey,
  useStoreCloudStorage,
} from '../../../contexts/store-cloud-storage.context';

export type ThemeEditorImagePickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialUrl?: string;
};

type SortKey = 'newest' | 'name';

type PickerImage = {
  id: string;
  name: string;
  url: string | null;
  createdAt: string;
};

export const ThemeEditorImagePickerModal: React.FC<ThemeEditorImagePickerModalProps> = ({
  open,
  onClose,
  onSelect,
  initialUrl = '',
}) => {
  const { activeStoreId } = useStore();

  const {
    uploads,
    loading: fetchLoading,
    imageUploadLoading,
    error: storageError,
    fetchUploadsByStoreId,
    uploadFileForStoreQuiet,
    resolveUploadPreviewUrl,
    clearError,
  } = useStoreCloudStorage();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [pendingUrl, setPendingUrl] = useState(initialUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setPendingUrl(initialUrl);
    clearError();
    if (!activeStoreId) return;
    fetchUploadsByStoreId(activeStoreId).catch((err: unknown) => {
      toast.error((err as Error)?.message || 'Failed to load store files');
    });
  }, [open, initialUrl, activeStoreId, fetchUploadsByStoreId, clearError]);

  const images = useMemo((): PickerImage[] => {
    return uploads
      .filter((upload) => isImageStorageKey(upload.key))
      .map((upload) => ({
        id: upload._id,
        name: fileNameFromStorageKey(upload.key),
        url: resolveUploadPreviewUrl(upload),
        createdAt: upload.createdAt,
      }));
  }, [uploads, resolveUploadPreviewUrl]);

  const selectableImages = useMemo(
    () => images.filter((f): f is PickerImage & { url: string } => Boolean(f.url)),
    [images]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = selectableImages;
    if (q) {
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.url.toLowerCase().includes(q)
      );
    }
    if (sort === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [selectableImages, search, sort]);

  const handleUpload = async (file: File | undefined) => {
    if (!activeStoreId) {
      toast.error('Select a store before uploading files');
      return;
    }
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    try {
      clearError();
      const { objectUrl } = await uploadFileForStoreQuiet(activeStoreId, file, {
        folder: defaultContentFilesFolder(activeStoreId),
      });
      if (!objectUrl) {
        toast.error('Upload failed');
        return;
      }
      setPendingUrl(objectUrl);
      toast.success('Image uploaded');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Could not upload image');
    }
  };

  const handleDone = () => {
    if (!pendingUrl.trim()) return;
    onSelect(pendingUrl.trim());
    onClose();
  };

  const uploadBusy = imageUploadLoading;
  const totalImageCount = images.length;
  const pendingPreviewCount = images.filter((f) => !f.url).length;

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[6500] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-[min(520px,88vh)] w-full max-w-[640px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-image-picker-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e1e1] px-4 py-3">
          <h2 id="theme-image-picker-title" className="text-[15px] font-semibold text-gray-900">
            Image
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-[#e1e1e1] px-4 py-3">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files"
                className="w-full rounded-lg border border-[#8c9196] bg-white py-2 pl-9 pr-3 text-[13px] text-gray-900 shadow-sm outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/20"
                autoFocus
              />
            </div>
            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-8 pr-8 text-[13px] font-medium text-gray-800 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
                aria-label="Sort"
              >
                <option value="newest">Newest</option>
                <option value="name">Name</option>
              </select>
              <ArrowsUpDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
            <button
              type="button"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-700 shadow-sm"
              title="Grid view"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
          </div>
          {!fetchLoading && activeStoreId && totalImageCount > 0 ? (
            <p className="mt-2 text-[12px] text-gray-500">
              {selectableImages.length} of {totalImageCount} image
              {totalImageCount === 1 ? '' : 's'} from your store library
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {!activeStoreId ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-gray-900">No store selected</p>
              <p className="mt-1 max-w-[280px] text-[13px] text-gray-500">
                Choose a store from the header, then open this picker again.
              </p>
            </div>
          ) : fetchLoading ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p className="text-[13px] text-gray-500">Loading files from cloud storage…</p>
            </div>
          ) : storageError && selectableImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-gray-900">Could not load files</p>
              <p className="mt-1 max-w-[280px] text-[13px] text-gray-500">{storageError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <MagnifyingGlassIcon className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-[15px] font-semibold text-gray-900">No images found</p>
              <p className="mt-1 max-w-[280px] text-[13px] text-gray-500">
                {search.trim()
                  ? 'Edit your search criteria, or upload a new image.'
                  : pendingPreviewCount > 0
                    ? `${pendingPreviewCount} image(s) are registered but previews are unavailable. Upload a new image or open Content → Files first.`
                    : 'Upload images in Content → Files, or add one here.'}
              </p>
              <button
                type="button"
                disabled={uploadBusy}
                onClick={() => fileRef.current?.click()}
                className="mt-5 rounded-lg border border-[#c9cccf] bg-white px-4 py-2 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {uploadBusy ? 'Uploading…' : 'Upload image'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((file) => {
                const selected = pendingUrl === file.url;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setPendingUrl(file.url)}
                    className={`group overflow-hidden rounded-lg border-2 bg-[#f6f6f7] text-left transition-colors ${
                      selected
                        ? 'border-[#005bd3] ring-2 ring-[#005bd3]/25'
                        : 'border-transparent hover:border-[#c9cccf]'
                    }`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-white">
                      <img
                        src={file.url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="truncate px-1.5 py-1 text-[11px] text-gray-700">{file.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e1e1e1] px-4 py-3">
          <button
            type="button"
            disabled={uploadBusy || !activeStoreId}
            onClick={() => fileRef.current?.click()}
            className="text-[13px] font-medium text-[#005bd3] hover:underline disabled:opacity-60"
          >
            Upload image
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#c9cccf] bg-white px-4 py-2 text-[13px] font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!pendingUrl.trim()}
              onClick={handleDone}
              className="rounded-lg bg-[#303030] px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:bg-[#c9cccf] disabled:text-gray-500"
            >
              Done
            </button>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
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
};

export default ThemeEditorImagePickerModal;
