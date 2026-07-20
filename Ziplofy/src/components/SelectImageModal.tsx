import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useStore } from '../contexts/store.context';
import {
  defaultContentFilesFolder,
  fileNameFromStorageKey,
  isImageStorageKey,
  useStoreCloudStorage,
} from '../contexts/store-cloud-storage.context';

export type SelectedImageAsset = {
  url: string;
  key: string;
  uploadId: string;
  name: string;
};

export type SelectImageModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: SelectedImageAsset) => void;
  initialUrl?: string;
};

type SortKey = 'newest' | 'name';

type PickerImage = {
  id: string;
  key: string;
  name: string;
  url: string | null;
  createdAt: string;
  extension: string;
};

function fileExtensionLabel(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
}

export function SelectImageModal({
  open,
  onClose,
  onSelect,
  initialUrl = '',
}: SelectImageModalProps) {
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setDragActive(false);
    clearError();
    if (!activeStoreId) return;
    void fetchUploadsByStoreId(activeStoreId).catch((err: unknown) => {
      toast.error((err as Error)?.message || 'Failed to load store files');
    });
  }, [open, activeStoreId, fetchUploadsByStoreId, clearError]);

  const images = useMemo((): PickerImage[] => {
    return uploads
      .filter((upload) => isImageStorageKey(upload.key))
      .map((upload) => {
        const name = fileNameFromStorageKey(upload.key);
        return {
          id: upload._id,
          key: upload.key,
          name,
          url: resolveUploadPreviewUrl(upload),
          createdAt: upload.createdAt,
          extension: fileExtensionLabel(name),
        };
      });
  }, [uploads, resolveUploadPreviewUrl]);

  const selectableImages = useMemo(
    () => images.filter((file): file is PickerImage & { url: string } => Boolean(file.url)),
    [images]
  );

  useEffect(() => {
    if (!open) return;
    if (!initialUrl) {
      setSelectedId(null);
      return;
    }
    const match = selectableImages.find((file) => file.url === initialUrl);
    setSelectedId(match?.id ?? null);
  }, [open, initialUrl, selectableImages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = selectableImages;
    if (q) {
      list = list.filter(
        (file) =>
          file.name.toLowerCase().includes(q) ||
          file.extension.toLowerCase().includes(q) ||
          file.url.toLowerCase().includes(q)
      );
    }
    if (sort === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [selectableImages, search, sort]);

  const selectedImage = useMemo(
    () => selectableImages.find((file) => file.id === selectedId) ?? null,
    [selectableImages, selectedId]
  );

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
      const { upload, objectUrl } = await uploadFileForStoreQuiet(activeStoreId, file, {
        folder: defaultContentFilesFolder(activeStoreId),
      });
      if (!objectUrl) {
        toast.error('Upload failed');
        return;
      }
      setSelectedId(upload._id);
      toast.success('Image uploaded');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Could not upload image');
    }
  };

  const handleFiles = (files: FileList | File[] | null | undefined) => {
    const file = Array.from(files ?? []).find((item) => item.type.startsWith('image/'));
    if (!file) {
      toast.error('Please choose an image file');
      return;
    }
    void handleUpload(file);
  };

  const handleDone = () => {
    if (!selectedImage?.url) return;
    onSelect({
      url: selectedImage.url,
      key: selectedImage.key,
      uploadId: selectedImage.id,
      name: selectedImage.name,
    });
    onClose();
  };

  const uploadBusy = imageUploadLoading;

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[6500] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-[min(640px,90vh)] w-full max-w-[900px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-image-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <h2 id="select-image-modal-title" className="text-[15px] font-semibold text-gray-900">
            Select image
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 space-y-3 border-b border-gray-200 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-[13px] text-gray-900 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
              />
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-[13px] font-normal text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                aria-label="Sort"
              >
                <option value="newest">Sort</option>
                <option value="name">Name</option>
              </select>
              <ArrowsUpDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
            <button
              type="button"
              className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700"
              title="Grid view"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['File size', 'Used in', 'Product'].map((label) => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-[12px] font-normal text-gray-700"
              >
                {label}
                <ChevronDownIcon className="h-3.5 w-3.5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`mb-4 flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-50/40' : 'border-gray-300 bg-gray-50/50'
            }`}
          >
            <button
              type="button"
              disabled={uploadBusy || !activeStoreId}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusIcon className="h-4 w-4" />
              {uploadBusy ? 'Uploading…' : 'Add files'}
            </button>
            <p className="mt-2 text-[12px] font-normal text-gray-500">Drag and drop images</p>
          </div>

          {!activeStoreId ? (
            <p className="py-8 text-center text-[13px] text-gray-500">
              Select a store before choosing an image.
            </p>
          ) : fetchLoading ? (
            <p className="py-8 text-center text-[13px] text-gray-500">Loading files…</p>
          ) : storageError && selectableImages.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-gray-500">{storageError}</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-gray-500">
              {search.trim() ? 'No images match your search.' : 'No images in your library yet.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((file) => {
                const selected = selectedId === file.id;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedId(file.id)}
                    className={`overflow-hidden rounded-lg border bg-white text-left transition-colors ${
                      selected
                        ? 'border-blue-600 ring-2 ring-blue-600/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-gray-50">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span
                        className={`absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded border bg-white ${
                          selected ? 'border-blue-600' : 'border-gray-300'
                        }`}
                        aria-hidden
                      >
                        {selected ? <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> : null}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 px-2 py-1.5">
                      <p className="truncate text-[12px] font-medium text-gray-800">{file.name}</p>
                      <p className="text-[11px] font-normal text-gray-500">{file.extension}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-[13px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedImage}
            onClick={handleDone}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            Done
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    </div>,
    document.body
  );
}
