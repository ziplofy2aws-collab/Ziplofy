import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowPathIcon,
  ChevronDownIcon,
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
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm min-h-[400px] flex justify-center items-center p-12">
      <div className="flex flex-col justify-center items-center text-center gap-4 max-w-md">
        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
          <FolderIcon className="w-7 h-7 text-blue-600" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-lg font-semibold text-gray-900">{title}</span>
          <span className="text-sm text-gray-500">{description}</span>
        </div>
        {showUploadButton && (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={deleteLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold transition-colors mt-2"
          >
            <DocumentArrowUpIcon className="w-4 h-4" />
            Upload files
          </button>
        )}
      </div>
    </div>
  );

  const renderLibraryGrid = () => (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 sm:p-6">
      <p className="text-sm text-gray-500 mb-4">
        {uploads.length} file{uploads.length === 1 ? '' : 's'} in your library
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {uploads.map((upload) => {
          const previewUrl = resolveUploadPreviewUrl(upload);
          const name = fileNameFromStorageKey(upload.key);
          const isDeleting = deletingId === upload._id;

          return (
            <div
              key={upload._id}
              className="group relative flex flex-col rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
            >
              <div className="aspect-square flex items-center justify-center bg-gray-100 relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400 p-3">
                    {isImageStorageKey(upload.key) ? (
                      <PhotoIcon className="w-10 h-10" />
                    ) : (
                      <DocumentIcon className="w-10 h-10" />
                    )}
                    <span className="text-[10px] text-center line-clamp-2">{name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(upload)}
                  disabled={isDeleting || isProcessingQueue || deleteLoading}
                  className="absolute top-2 right-2 rounded-md bg-white/90 p-1.5 text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-white disabled:opacity-50 transition-opacity"
                  aria-label={`Delete ${name}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 border-t border-gray-200 bg-white">
                <p className="text-xs font-medium text-gray-900 truncate" title={name}>
                  {name}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">{formatUploadedAt(upload.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

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
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm min-h-[400px] flex justify-center items-center p-12">
          <p className="text-sm text-gray-500">Loading files…</p>
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
      <div className="min-h-screen bg-page-background-color">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />

        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="pl-3 border-l-4 border-blue-500/60">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Files</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Upload and manage images, videos, documents, and more
              </p>
            </div>
            <button
              type="button"
              onClick={openFilePicker}
              disabled={deleteLoading || !activeStoreId}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold transition-colors shadow-sm"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              {isProcessingQueue ? 'Uploading…' : 'Upload files'}
            </button>
          </div>

          {renderMainContent()}
        </div>
      </div>

      {renderUploadQueuePanel()}
    </>
  );
};
