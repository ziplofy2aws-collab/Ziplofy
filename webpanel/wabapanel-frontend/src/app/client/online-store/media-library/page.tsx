'use client';

import toast from 'react-hot-toast';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Copy,
  Folder,
  ImageIcon,
  Loader2,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { adminContentColumnClass, adminListPrimaryButtonClass } from '@/components/layout/dashboard-ui';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';
import {
  applyS3MetaFromListResponse,
  ensureS3Meta,
  fileNameFromKey,
  resolveStoreMediaUrl,
  storeMediaApi,
  uploadStoreMediaFile,
  type StoreMediaItem,
} from '@/lib/store-media';

type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'queued' | 'uploading' | 'error';
  errorMessage?: string;
};

const dangerBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';

function createQueueItem(file: File): QueueItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    status: 'queued',
  };
}

export default function OnlineStoreMediaLibraryPage() {
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [files, setFiles] = useState<StoreMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [awsConfigured, setAwsConfigured] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);

  useEffect(() => {
    void fetchStores();
    void storeMediaApi.checkAwsStatus().then((res) => {
      if (res.data?.success && res.data.data) {
        setAwsConfigured(res.data.data.configured);
        if (res.data.data.bucket && res.data.data.region) {
          applyS3MetaFromListResponse({ bucket: res.data.data.bucket, region: res.data.data.region });
        }
      }
    }).catch(() => setAwsConfigured(null));
  }, [fetchStores]);

  const setQueue = useCallback((next: QueueItem[]) => {
    queueRef.current = next;
    setUploadQueue(next);
  }, []);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const loadFiles = useCallback(async () => {
    if (!storeId) {
      setFiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storeMediaApi.list(storeId);
      applyS3MetaFromListResponse(res.data?.s3);
      await ensureS3Meta();
      setFiles(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setFiles([]);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const drainQueue = useCallback(async () => {
    if (!storeId || processingRef.current) return;
    processingRef.current = true;
    setIsProcessingQueue(true);

    let ok = 0;
    let fail = 0;

    try {
      let next = queueRef.current.find((item) => item.status === 'queued');
      while (next) {
        setQueue(
          queueRef.current.map((item) =>
            item.id === next!.id ? { ...item, status: 'uploading' } : item
          )
        );
        try {
          await uploadStoreMediaFile(storeId, next.file);
          URL.revokeObjectURL(next.previewUrl);
          setQueue(queueRef.current.filter((item) => item.id !== next!.id));
          ok += 1;
        } catch (err) {
          const msg = (err as Error)?.message || 'Upload failed';
          setQueue(
            queueRef.current.map((item) =>
              item.id === next!.id ? { ...item, status: 'error', errorMessage: msg } : item
            )
          );
          fail += 1;
        }
        next = queueRef.current.find((item) => item.status === 'queued');
      }
      if (ok) {
        toast.success(`${ok} image${ok === 1 ? '' : 's'} uploaded`);
        await loadFiles();
      }
      if (fail && !ok) toast.error(`${fail} upload${fail === 1 ? '' : 's'} failed`);
    } finally {
      processingRef.current = false;
      setIsProcessingQueue(false);
    }
  }, [loadFiles, setQueue, storeId]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!picked.length) {
      toast.error('Please choose image files');
      return;
    }
    if (!storeId) {
      toast.error('Select a store first');
      return;
    }
    setQueue([...queueRef.current, ...picked.map(createQueueItem)]);
    void drainQueue();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAll = async () => {
    if (!storeId || !files.length) return;
    const count = files.length;
    if (
      !window.confirm(
        `Delete all ${count} image${count === 1 ? '' : 's'} from S3 and your media library? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingAll(true);
    try {
      const res = await storeMediaApi.deleteAll(storeId);
      toast.success(res.data?.message || 'All media deleted');
      setQuery('');
      await loadFiles();
    } catch {
      toast.error('Failed to delete all media');
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDelete = async (item: StoreMediaItem) => {
    if (!storeId || !window.confirm('Delete this image from your store media library?')) return;
    setDeletingId(item._id);
    try {
      await storeMediaApi.delete(storeId, item._id);
      toast.success('Deleted');
      await loadFiles();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const copyUrl = async (item: StoreMediaItem) => {
    try {
      await navigator.clipboard.writeText(resolveStoreMediaUrl(item));
      toast.success('Link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const visibleFiles = query.trim()
    ? files.filter((f) => {
        const name = (f.originalName || fileNameFromKey(f.key)).toLowerCase();
        return name.includes(query.trim().toLowerCase());
      })
    : files;

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
        multiple
        className="hidden"
        onChange={onPickFiles}
      />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Media library</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Upload images for your Informatic online store — stored on AWS S3.
            {activeStore?.storeName ? (
              <>
                {' '}
                Store: <strong className="text-admin-text">{activeStore.storeName}</strong>
              </>
            ) : null}
          </p>
          <p className="mt-1 text-[12px] text-admin-text-secondary">
            <Link href="/client/themes" className="font-medium text-[#005bd3] hover:underline">
              Themes
            </Link>
            {' · '}
            <Link href="/client/online-store" className="font-medium text-[#005bd3] hover:underline">
              Online store
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {files.length > 0 ? (
            <button
              type="button"
              disabled={!storeId || deletingAll || isProcessingQueue || Boolean(deletingId)}
              className={dangerBtn}
              onClick={() => void handleDeleteAll()}
            >
              {deletingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
              {deletingAll ? 'Deleting…' : 'Delete all'}
            </button>
          ) : null}
          <button
            type="button"
            disabled={!storeId || isProcessingQueue || deletingAll}
            className={adminListPrimaryButtonClass}
            onClick={() => fileInputRef.current?.click()}
          >
            {isProcessingQueue ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {isProcessingQueue ? 'Uploading…' : 'Upload images'}
          </button>
        </div>
      </header>

      {!storeId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          Select a store from the account menu to upload media for your online store.
        </div>
      ) : null}

      {storeId && awsConfigured === false ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-950">
          AWS S3 is not configured on the server. Set <code className="rounded bg-red-100 px-1">AWS_ACCESS_KEY_ID</code>,{' '}
          <code className="rounded bg-red-100 px-1">AWS_SECRET_ACCESS_KEY</code>, and{' '}
          <code className="rounded bg-red-100 px-1">AWS_S3_BUCKET</code> in wabapanel-express env (dev inherits from codiic-server).
        </div>
      ) : null}

      {uploadQueue.length > 0 ? (
        <div className="rounded-xl border border-admin-border bg-white p-4">
          <p className="mb-3 text-[13px] font-semibold text-admin-text">Upload queue</p>
          <ul className="space-y-2">
            {uploadQueue.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-admin-border bg-admin-secondary/40 px-3 py-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="" className="h-10 w-10 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-admin-text">{item.file.name}</p>
                  <p className="text-[11px] text-admin-text-secondary">
                    {item.status === 'uploading'
                      ? 'Uploading to S3…'
                      : item.status === 'error'
                        ? item.errorMessage || 'Failed'
                        : 'Queued'}
                  </p>
                </div>
                {item.status === 'uploading' ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-admin-text-secondary" />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <div className="border-b border-admin-border px-3 py-2.5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search images"
              className="w-full rounded-lg border border-admin-border bg-white py-1.5 pl-8 pr-3 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin text-admin-text-secondary" />
          </div>
        ) : visibleFiles.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-10 text-center">
            <Folder className="h-10 w-10 text-admin-text-secondary" aria-hidden />
            <p className="text-sm font-medium text-admin-text">No images yet</p>
            <p className="max-w-sm text-[13px] text-admin-text-secondary">
              Upload pictures here, then use their URLs in your Informatic theme editor.
            </p>
            {storeId ? (
              <button type="button" className={adminListPrimaryButtonClass} onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" aria-hidden />
                Upload images
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleFiles.map((item) => {
              const src = resolveStoreMediaUrl(item);
              const label = item.originalName || fileNameFromKey(item.key);
              return (
                <article
                  key={item._id}
                  className="group overflow-hidden rounded-lg border border-admin-border bg-white"
                >
                  <div className="relative aspect-square bg-[#f6f6f7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={label} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        title="Copy URL"
                        className="rounded-md bg-white/95 p-1.5 shadow hover:bg-white"
                        onClick={() => void copyUrl(item)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        disabled={deletingId === item._id}
                        className="rounded-md bg-white/95 p-1.5 shadow hover:bg-red-50"
                        onClick={() => void handleDelete(item)}
                      >
                        {deletingId === item._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="truncate px-2 py-2 text-[11px] text-admin-text-secondary" title={label}>
                    {label}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
