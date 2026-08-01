import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useCollections, type Collection } from '../../contexts/collection.context';
import { useStore } from '../../contexts/store.context';
import { collectionPath } from '../../utils/storefront-paths';
import { normalizeStorefrontOrigin } from '../../utils/storefront-url.util';
import { pickDefaultPreviewCollection } from '../utils/collection-page-preview.util';
import { ThemeEditorCreateCollectionSheet } from './ThemeEditorCreateCollectionSheet';
import {
  TemplatePreviewPickerOption,
  TemplatePreviewPickerShell,
  TemplatePreviewPickerThumb,
  templatePreviewCreateClassName,
  templatePreviewSearchClassName,
  templatePreviewViewLinkClassName,
} from './TemplatePreviewPickerShell';

type Props = {
  previewCollectionHandle: string | null;
  onPreviewCollectionHandleChange: (handle: string) => void;
  storefrontOrigin?: string | null;
};

export function CollectionTemplatePreviewCard({
  previewCollectionHandle,
  onPreviewCollectionHandleChange,
  storefrontOrigin,
}: Props) {
  const { activeStoreId } = useStore();
  const { collections, fetchCollectionsByStoreId, loading } = useCollections();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return collections;
    return collections.filter(
      (collection) =>
        collection.title.toLowerCase().includes(normalizedQuery) ||
        collection.urlHandle.toLowerCase().includes(normalizedQuery)
    );
  }, [collections, query]);

  const viewHref = useMemo(() => {
    const origin = normalizeStorefrontOrigin(storefrontOrigin);
    const handle = active?.urlHandle?.trim();
    return origin && handle ? `${origin}${collectionPath(handle)}` : null;
  }, [active?.urlHandle, storefrontOrigin]);

  const selectCollection = useCallback(
    (collection: Collection) => {
      const handle = collection.urlHandle?.trim();
      if (!handle) return;
      onPreviewCollectionHandleChange(handle);
      setOpen(false);
      setQuery('');
    },
    [onPreviewCollectionHandleChange]
  );

  const handleCreated = useCallback(
    (collection: Collection) => {
      if (activeStoreId) {
        void fetchCollectionsByStoreId(activeStoreId);
      }
      const handle = collection.urlHandle?.trim();
      if (handle) onPreviewCollectionHandleChange(handle);
    },
    [activeStoreId, fetchCollectionsByStoreId, onPreviewCollectionHandleChange]
  );

  return (
    <>
      <TemplatePreviewPickerShell
        rootRef={rootRef}
        label="Preview collection"
        open={open}
        onToggle={() => setOpen((current) => !current)}
        trigger={
          <div className="flex items-center gap-3">
            <TemplatePreviewPickerThumb src={active?.imageUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-gray-900">
                {loading && !active ? 'Loading…' : active?.title ?? 'Select a collection'}
              </p>
              {active?.urlHandle ? (
                <p className="truncate text-[11px] text-gray-500">
                  /collection/{active.urlHandle}
                </p>
              ) : (
                <p className="truncate text-[11px] text-gray-500">
                  Choose which collection to preview
                </p>
              )}
            </div>
          </div>
        }
        triggerAside={
          viewHref ? (
            <a
              href={viewHref}
              target="_blank"
              rel="noopener noreferrer"
              title="View collection on storefront"
              onClick={(event) => event.stopPropagation()}
              className={templatePreviewViewLinkClassName}
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
            </a>
          ) : null
        }
      >
        <div className="border-b border-[#eceef0] p-2.5">
          <div className="relative">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search collections"
              aria-label="Search collections"
              className={templatePreviewSearchClassName}
            />
          </div>
        </div>

        <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-[12px] text-gray-500">
              {loading
                ? 'Loading collections…'
                : query.trim()
                  ? 'No collections match'
                  : 'No collections yet'}
            </li>
          ) : (
            filtered.map((collection) => {
              const selected =
                collection.urlHandle === (previewCollectionHandle ?? active?.urlHandle);
              return (
                <li key={collection._id}>
                  <TemplatePreviewPickerOption
                    selected={selected}
                    onClick={() => selectCollection(collection)}
                    thumb={<TemplatePreviewPickerThumb src={collection.imageUrl} size="sm" />}
                    title={collection.title}
                    subtitle={
                      collection.urlHandle ? `/collection/${collection.urlHandle}` : undefined
                    }
                  />
                </li>
              );
            })
          )}
        </ul>

        <div className="border-t border-[#eceef0] p-1.5">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCreateOpen(true);
            }}
            className={templatePreviewCreateClassName}
          >
            <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
            Create collection
          </button>
        </div>
      </TemplatePreviewPickerShell>

      <ThemeEditorCreateCollectionSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
