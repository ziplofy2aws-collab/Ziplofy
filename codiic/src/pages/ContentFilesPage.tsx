import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  FolderIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  adminListCardClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
} from '../components/admin-list-ui';
import ConfirmDeleteAllFilesModal from '../components/ConfirmDeleteAllFilesModal';
import {
  fileNameFromStorageKey,
  isImageStorageKey,
  useStoreCloudStorage,
  type StoreCloudStorageUpload,
} from '../contexts/store-cloud-storage.context';
import { useStore } from '../contexts/store.context';

type UploadQueueStatus = 'queued' | 'uploading' | 'error';

type UploadQueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadQueueStatus;
  errorMessage?: string;
};

const formatUploadedAt = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
};

const createQueueItem = (file: File): UploadQueueItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  file,
  previewUrl: URL.createObjectURL(file),
  status: 'queued',
});

export const ContentFilesPage = () => {
  const { activeStoreId } = useStore();
  const {
    uploads,
    loading: fetchLoading,
    deleteLoading,
    fetchUploadsByStoreId,
    uploadFileForStoreQuiet,
    deleteUpload,
    deleteAllUploadsForStore,
    resolveUploadPreviewUrl,
    clearUploads,
    clearError,
  } = useStoreCloudStorage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadQueueRef = useRef<UploadQueueItem[]>([]);
  const processorRunningRef = useRef(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [uploadQueueCollapsed, setUploadQueueCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const viewerUpload = viewerIndex != null ? uploads[viewerIndex] ?? null : null;
  const viewerPreviewUrl = viewerUpload ? resolveUploadPreviewUrl(viewerUpload) : null;
  const viewerName = viewerUpload ? fileNameFromStorageKey(viewerUpload.key) : '';

  const closeViewer = useCallback(() => setViewerIndex(null), []);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  const showPrev = useCallback(() => {
    setViewerIndex((current) => {
      if (current == null || uploads.length === 0) return current;
      return (current - 1 + uploads.length) % uploads.length;
    });
  }, [uploads.length]);

  const showNext = useCallback(() => {
    setViewerIndex((current) => {
      if (current == null || uploads.length === 0) return current;
      return (current + 1) % uploads.length;
    });
  }, [uploads.length]);

  useEffect(() => {
    if (viewerIndex == null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeViewer();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNext();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [viewerIndex, closeViewer, showPrev, showNext]);

  useEffect(() => {
    if (viewerIndex == null) return;
    if (uploads.length === 0) {
      setViewerIndex(null);
      return;
    }
    if (viewerIndex >= uploads.length) {
      setViewerIndex(uploads.length - 1);
    }
  }, [uploads.length, viewerIndex]);

  const setQueue = useCallback((next: UploadQueueItem[]) => {
    uploadQueueRef.current = next;
    setUploadQueue(next);
  }, []);

  useEffect(() => {
    return () => {
      uploadQueueRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (!activeStoreId) {
      clearUploads();
      return;
    }
    fetchUploadsByStoreId(activeStoreId).catch((err: unknown) => {
      toast.error((err as Error)?.message || 'Failed to load files');
    });
  }, [activeStoreId, fetchUploadsByStoreId, clearUploads]);

  const drainUploadQueue = useCallback(async () => {
    if (!activeStoreId) return;
    if (processorRunningRef.current) return;

    processorRunningRef.current = true;
    setIsProcessingQueue(true);

    let successCount = 0;
    let errorCount = 0;

    try {
      let next = uploadQueueRef.current.find((item) => item.status === 'queued');
      while (next) {
        setQueue(
          uploadQueueRef.current.map((item) =>
            item.id === next!.id ? { ...item, status: 'uploading' } : item
          )
        );

        try {
          await uploadFileForStoreQuiet(activeStoreId, next.file);
          URL.revokeObjectURL(next.previewUrl);
          setQueue(uploadQueueRef.current.filter((item) => item.id !== next!.id));
          successCount += 1;
        } catch (err: unknown) {
          const msg = (err as Error)?.message || 'Upload failed';
          setQueue(
            uploadQueueRef.current.map((item) =>
              item.id === next!.id ? { ...item, status: 'error', errorMessage: msg } : item
            )
          );
          errorCount += 1;
        }

        next = uploadQueueRef.current.find((item) => item.status === 'queued');
      }
    } finally {
      processorRunningRef.current = false;
      setIsProcessingQueue(false);

      const hasMoreQueued = uploadQueueRef.current.some((item) => item.status === 'queued');
      if (hasMoreQueued) {
        void drainUploadQueue();
        return;
      }

      if (successCount > 0 && errorCount === 0) {
        toast.success(
          successCount === 1 ? 'File uploaded successfully' : `${successCount} files uploaded successfully`
        );
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`${successCount} uploaded, ${errorCount} failed`);
      } else if (errorCount > 0 && successCount === 0) {
        toast.error('All uploads failed');
      }
    }
  }, [activeStoreId, uploadFileForStoreQuiet, setQueue]);

  const enqueueFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      const newItems = files.map(createQueueItem);
      setUploadQueueCollapsed(false);
      setQueue([...uploadQueueRef.current, ...newItems]);
      void drainUploadQueue();
    },
    [drainUploadQueue, setQueue]
  );

  const openFilePicker = () => {
    if (!activeStoreId) {
      toast.error('Select a store before uploading files');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length || !activeStoreId) return;

    clearError();
    enqueueFiles(Array.from(files));
    event.target.value = '';
  };

  const cancelQueueItem = (item: UploadQueueItem) => {
    if (item.status === 'uploading') return;
    URL.revokeObjectURL(item.previewUrl);
    setQueue(uploadQueueRef.current.filter((q) => q.id !== item.id));
    if (item.status === 'error') return;
    void drainUploadQueue();
  };

  const handleDelete = async (upload: StoreCloudStorageUpload) => {
    const name = fileNameFromStorageKey(upload.key);
    const deleteToastId = toast.loading(`Removing "${name}"…`);

    setDeletingId(upload._id);
    try {
      await deleteUpload(upload._id, { deleteFromS3: true, key: upload.key });
      toast.success('File removed', { id: deleteToastId });
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to delete file', { id: deleteToastId });
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmDeleteAll = async () => {
    if (!activeStoreId) {
      toast.error('Please select a store first');
      return;
    }

    const deleteToastId = toast.loading('Deleting all files…');
    setDeletingAll(true);
    try {
      const result = await deleteAllUploadsForStore(activeStoreId);
      setDeleteAllOpen(false);
      setViewerIndex(null);
      toast.success(
        result.deletedFromDatabase > 0
          ? `Deleted ${result.deletedFromDatabase} file${result.deletedFromDatabase === 1 ? '' : 's'}`
          : 'No files to delete',
        { id: deleteToastId }
      );
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Failed to delete all files', { id: deleteToastId });
    } finally {
      setDeletingAll(false);
    }
  };

  const renderUploadQueuePanel = () => {
    if (uploadQueue.length === 0) return null;

    const remainingCount = uploadQueue.length;

    return (
      <div
        className="fixed bottom-4 right-4 z-50 w-[min(100vw-2rem,22rem)] rounded-xl bg-[#1a1a1a] text-white shadow-2xl ring-1 ring-white/10"
        role="region"
        aria-label="Upload progress"
      >
        <button
          type="button"
          onClick={() => setUploadQueueCollapsed((c) => !c)}
          className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-white/5 rounded-t-xl transition-colors"
          aria-expanded={!uploadQueueCollapsed}
        >
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-tight">Uploading</p>
            <p className="text-[13px] text-[#9ca3af] mt-0.5">
              {remainingCount} remaining
            </p>
          </div>
          {uploadQueueCollapsed ? (
            <ChevronUpIcon className="w-5 h-5 shrink-0 text-[#9ca3af] mt-0.5" aria-hidden />
          ) : (
            <ChevronDownIcon className="w-5 h-5 shrink-0 text-[#9ca3af] mt-0.5" aria-hidden />
          )}
        </button>

        {!uploadQueueCollapsed && (
          <ul className="max-h-[min(50vh,280px)] overflow-y-auto border-t border-[#333]">
            {uploadQueue.map((item, index) => {
              const isUploading = item.status === 'uploading';
              const isError = item.status === 'error';

              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 px-3 py-2.5 ${
                    index < uploadQueue.length - 1 ? 'border-b border-[#333]' : ''
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#2a2a2a]">
                    <img
                      src={item.previewUrl}
                      alt=""
                      className={`h-full w-full object-cover ${isUploading ? 'opacity-70' : ''}`}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <ArrowPathIcon className="w-4 h-4 animate-spin text-white" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white" title={item.file.name}>
                      {item.file.name}
                    </p>
                    {isError && item.errorMessage ? (
                      <p className="truncate text-[11px] text-red-400 mt-0.5" title={item.errorMessage}>
                        {item.errorMessage}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => cancelQueueItem(item)}
                    disabled={isUploading}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#9ca3af] hover:bg-[#333] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Cancel upload of ${item.file.name}`}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const renderEmptyState = (title: string, description: string, showUploadButton: boolean) => (
    <div className={`${adminListCardClass} flex min-h-[400px] items-center justify-center p-12`}>
      <div className="flex max-w-md flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-admin-secondary">
          <FolderIcon className="h-7 w-7 text-admin-text-secondary" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold text-admin-text">{title}</span>
          <span className="text-[13px] text-admin-text-secondary">{description}</span>
        </div>
        {showUploadButton && (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={deleteLoading}
            className={`${adminListPrimaryButtonClass} mt-2 gap-1.5`}
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            Upload files
          </button>
        )}
      </div>
    </div>
  );

  const renderLibraryGrid = () => (
    <div className={`${adminListCardClass} p-4 sm:p-6`}>
      <p className="mb-4 text-[13px] text-admin-text-secondary">
        {uploads.length} file{uploads.length === 1 ? '' : 's'} in your library
      </p>
      <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {uploads.map((upload, index) => {
          const previewUrl = resolveUploadPreviewUrl(upload);
          const name = fileNameFromStorageKey(upload.key);
          const isDeleting = deletingId === upload._id;

          return (
            <div
              key={upload._id}
              className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-admin-border bg-admin-surface transition-colors hover:border-admin-text-subdued"
            >
              <button
                type="button"
                onClick={() => openViewer(index)}
                className="relative aspect-square w-full shrink-0 overflow-hidden bg-admin-secondary text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005bd3] focus-visible:ring-inset"
                aria-label={`View ${name}`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-3 text-admin-text-subdued">
                    {isImageStorageKey(upload.key) ? (
                      <PhotoIcon className="h-10 w-10" />
                    ) : (
                      <DocumentIcon className="h-10 w-10" />
                    )}
                    <span className="line-clamp-2 text-center text-[10px]">{name}</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleDelete(upload);
                }}
                disabled={isDeleting || isProcessingQueue || deleteLoading}
                className="absolute top-2 right-2 z-10 rounded-md bg-admin-surface/90 p-1.5 text-admin-text-secondary opacity-0 shadow-sm transition-opacity hover:bg-admin-surface hover:text-red-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
                aria-label={`Delete ${name}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <div className="shrink-0 border-t border-admin-divider bg-admin-surface p-2">
                <p className="truncate text-xs font-medium text-admin-text" title={name}>
                  {name}
                </p>
                <p className="mt-0.5 text-[10px] text-admin-text-subdued">
                  {formatUploadedAt(upload.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFullscreenViewer = () => {
    if (viewerIndex == null || !viewerUpload) return null;

    return (
      <div
        className="fixed inset-0 z-100 flex flex-col bg-black/95"
        role="dialog"
        aria-modal="true"
        aria-label={`Viewing ${viewerName}`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-white shrink-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" title={viewerName}>
              {viewerName}
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              {viewerIndex + 1} of {uploads.length}
            </p>
          </div>
          <button
            type="button"
            onClick={closeViewer}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close full screen view"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 pb-4">
          {uploads.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-3 sm:left-6 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous file"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 sm:right-6 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Next file"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          ) : null}

          {viewerPreviewUrl ? (
            <img
              src={viewerPreviewUrl}
              alt={viewerName}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/70 px-6 text-center">
              {isImageStorageKey(viewerUpload.key) ? (
                <PhotoIcon className="w-16 h-16" />
              ) : (
                <DocumentIcon className="w-16 h-16" />
              )}
              <p className="text-sm font-medium text-white">{viewerName}</p>
              <p className="text-xs text-white/50">Preview is not available for this file.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (!activeStoreId) {
      return renderEmptyState(
        'No store selected',
        'Choose a store from the header to upload and manage content files.',
        false
      );
    }

    const hasLibrary = uploads.length > 0;
    const hasQueue = uploadQueue.length > 0;

    if (fetchLoading && !hasLibrary && !hasQueue) {
      return (
        <div className={`${adminListCardClass} flex min-h-[400px] items-center justify-center p-12`}>
          <p className="inline-flex items-center gap-2 text-[13px] text-admin-text-secondary">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
            Loading files…
          </p>
        </div>
      );
    }

    if (!hasLibrary && !hasQueue) {
      return renderEmptyState(
        'No files yet',
        'Select one or more images to upload. Progress appears in the bottom-right corner.',
        true
      );
    }

    return hasLibrary ? renderLibraryGrid() : null;
  };

  return (
    <>
      <div className={adminListPageShellClass}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />

        <div className={adminListPageInnerClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FolderIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
                <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Files</h1>
              </div>
              <p className="mt-1 text-[13px] text-admin-text-secondary">
                Upload and manage images, videos, documents, and more
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {uploads.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setDeleteAllOpen(true)}
                  disabled={deleteLoading || deletingAll || !activeStoreId || isProcessingQueue}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-admin-surface px-3 py-1.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete all
                </button>
              ) : null}
              <button
                type="button"
                onClick={openFilePicker}
                disabled={deleteLoading || deletingAll || !activeStoreId}
                className={`${adminListPrimaryButtonClass} gap-1.5`}
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                {isProcessingQueue ? 'Uploading…' : 'Upload files'}
              </button>
            </div>
          </div>

          {renderMainContent()}
        </div>
      </div>

      {renderUploadQueuePanel()}
      {renderFullscreenViewer()}

      <ConfirmDeleteAllFilesModal
        isOpen={deleteAllOpen}
        fileCount={uploads.length}
        deleting={deletingAll}
        onClose={() => {
          if (!deletingAll) setDeleteAllOpen(false);
        }}
        onConfirm={() => void handleConfirmDeleteAll()}
      />
    </>
  );
};
