import { useEffect, useMemo } from 'react';
import { PencilSquareIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useCollections } from '../../contexts/collection.context';
import { useStore } from '../../contexts/store.context';
import { pickDefaultPreviewCollection } from '../utils/collection-page-preview.util';

type Props = {
  previewCollectionHandle: string | null;
  onPreviewCollectionHandleChange: (handle: string) => void;
};

export function CollectionTemplatePreviewCard({
  previewCollectionHandle,
  onPreviewCollectionHandleChange,
}: Props) {
  const { activeStoreId } = useStore();
  const { collections, fetchCollectionsByStoreId, loading } = useCollections();

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchCollectionsByStoreId(activeStoreId);
  }, [activeStoreId, fetchCollectionsByStoreId]);

  useEffect(() => {
    if (previewCollectionHandle || !collections.length) return;
    const fallback = pickDefaultPreviewCollection(collections);
    if (fallback?.urlHandle) {
      onPreviewCollectionHandleChange(fallback.urlHandle);
    }
  }, [collections, previewCollectionHandle, onPreviewCollectionHandleChange]);

  const active = useMemo(() => {
    if (!previewCollectionHandle) return pickDefaultPreviewCollection(collections);
    return (
      collections.find((c) => c.urlHandle === previewCollectionHandle) ??
      pickDefaultPreviewCollection(collections)
    );
  }, [collections, previewCollectionHandle]);

  return (
    <div className="border-b border-[#e1e1e1] bg-white px-3 py-3">
      <p className="mb-2 text-[12px] font-medium text-gray-600">Preview</p>
      <div className="flex items-center gap-3 rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2.5">
        {active?.imageUrl ? (
          <img
            src={active.imageUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded object-cover bg-gray-100"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
            <PhotoIcon className="h-5 w-5 text-gray-400" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-gray-900">
            {loading && !active ? 'Loading…' : active?.title ?? 'No collections'}
          </p>
          {active?.urlHandle ? (
            <p className="truncate text-[12px] text-gray-500">/collection/{active.urlHandle}</p>
          ) : null}
        </div>
        <select
          className="sr-only"
          aria-label="Preview collection"
          value={previewCollectionHandle ?? active?.urlHandle ?? ''}
          onChange={(e) => {
            const next = e.target.value.trim();
            if (next) onPreviewCollectionHandleChange(next);
          }}
        >
          {!collections.length ? <option value="">No collections</option> : null}
          {collections.map((col) => (
            <option key={col._id} value={col.urlHandle}>
              {col.title}
            </option>
          ))}
        </select>
        <button
          type="button"
          title="Change preview collection"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-white"
          onClick={() => {
            const select = document.querySelector<HTMLSelectElement>(
              '[aria-label="Preview collection"]'
            );
            select?.showPicker?.();
            select?.click();
          }}
        >
          <PencilSquareIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
