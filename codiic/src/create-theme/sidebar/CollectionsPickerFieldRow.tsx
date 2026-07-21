import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleStackIcon, MagnifyingGlassIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Collection } from '../../contexts/collection.context';
import { useCollections } from '../../contexts/collection.context';
import { useStore } from '../../contexts/store.context';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import { fieldValueAsString } from './create-theme-field.utils';
import { parseCollectionLinksPicker } from '../utils/collection-links-collections.util';
import { ThemeEditorCreateCollectionSheet } from './ThemeEditorCreateCollectionSheet';

const PICKER_WIDTH = 300;

type MenuPos = { top: number; left: number; width: number };

function collectionsById(collections: Collection[], extra: Collection[] = []): Map<string, Collection> {
  const map = new Map<string, Collection>();
  for (const col of [...collections, ...extra]) {
    map.set(col._id, col);
  }
  return map;
}

/** Map persisted picker handles → unique collection ids (handles can be empty/duplicate). */
function selectedIdsFromHandles(handles: string[], collections: Collection[]): string[] {
  const ids: string[] = [];
  const usedIds = new Set<string>();
  for (const handle of handles) {
    const match = collections.find(
      (col) => col.urlHandle === handle && col.urlHandle.trim() && !usedIds.has(col._id)
    );
    if (match) {
      ids.push(match._id);
      usedIds.add(match._id);
    }
  }
  return ids;
}

type Props = {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onCollectionsApply?: (settingsPath: string, collections: Collection[]) => void;
};

export function CollectionsPickerFieldRow({
  field,
  values,
  onCollectionsApply = () => {},
}: Props) {
  const { activeStoreId } = useStore();
  const { collections, loading, fetchCollectionsByStoreId } = useCollections();
  const [open, setOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const skipPickerSyncRef = useRef(false);
  const pendingOpenInitRef = useRef(false);

  const pickerRaw = fieldValueAsString(values, field);

  useEffect(() => {
    if (open || skipPickerSyncRef.current) return;
    const handles = parseCollectionLinksPicker(pickerRaw);
    setSelectedIds(selectedIdsFromHandles(handles, collections));
  }, [pickerRaw, collections, open]);

  useEffect(() => {
    if (!open || !pendingOpenInitRef.current || loading) return;
    pendingOpenInitRef.current = false;
    const handles = parseCollectionLinksPicker(pickerRaw);
    setSelectedIds(selectedIdsFromHandles(handles, collections));
  }, [open, loading, collections, pickerRaw]);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const aside = el.closest('aside');
    const asideRect = aside?.getBoundingClientRect();
    const left = asideRect ? asideRect.right + 8 : rect.right + 8;
    const maxTop = window.innerHeight - 360;
    const top = Math.max(8, Math.min(rect.top, maxTop));
    setMenuPos({ top, left, width: PICKER_WIDTH });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    const onResize = () => updateMenuPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const openPicker = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('Select a store before choosing collections');
      return;
    }
    pendingOpenInitRef.current = true;
    setOpen(true);
    try {
      await fetchCollectionsByStoreId(activeStoreId);
    } catch {
      toast.error('Failed to load collections');
    }
  }, [activeStoreId, fetchCollectionsByStoreId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.urlHandle.toLowerCase().includes(q)
    );
  }, [collections, search]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const applySelectedIds = useCallback(
    (ids: string[], extra: Collection[] = []) => {
      const byId = collectionsById(collections, extra);
      const picked = ids
        .map((id) => byId.get(id))
        .filter((c): c is Collection => Boolean(c));
      skipPickerSyncRef.current = true;
      onCollectionsApply(field.path, picked);
      setSelectedIds(ids);
      window.setTimeout(() => {
        skipPickerSyncRef.current = false;
      }, 0);
    },
    [collections, field.path, onCollectionsApply]
  );

  const toggleCollection = useCallback(
    (collectionId: string) => {
      const next = selectedIdSet.has(collectionId)
        ? selectedIds.filter((id) => id !== collectionId)
        : [...selectedIds, collectionId];
      applySelectedIds(next);
    },
    [applySelectedIds, selectedIds, selectedIdSet]
  );

  const buttonLabel = useMemo(() => {
    if (!selectedIds.length) return 'Select';
    if (selectedIds.length === 1) {
      const col = collections.find((c) => c._id === selectedIds[0]);
      return col?.title ?? '1 collection';
    }
    return `${selectedIds.length} collections`;
  }, [collections, selectedIds]);

  const pickerMenu =
    open && menuPos
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[1400] cursor-default bg-transparent"
              aria-label="Close collections picker"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-[1410] overflow-hidden rounded-xl border border-[#8cb4f8] bg-white shadow-lg"
              style={{
                top: menuPos.top,
                left: Math.min(menuPos.left, window.innerWidth - menuPos.width - 8),
                width: menuPos.width,
              }}
              role="listbox"
              aria-label="Collections"
              aria-multiselectable
            >
              <div className="border-b border-gray-100 p-2">
                <div className="flex items-center gap-2 rounded-lg border border-[#8cb4f8] bg-white px-2 py-1.5">
                  <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-gray-900 outline-none ring-0"
                  />
                </div>
              </div>

              <div className="max-h-[min(280px,45vh)] overflow-y-auto py-1">
                {loading ? (
                  <p className="px-3 py-4 text-center text-[13px] text-gray-500">Loading collections…</p>
                ) : filtered.length === 0 ? (
                  <p className="px-3 py-4 text-center text-[13px] text-gray-500">No collections found</p>
                ) : (
                  filtered.map((col) => {
                    const checked = selectedIdSet.has(col._id);
                    return (
                      <button
                        key={col._id}
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => toggleCollection(col._id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                          aria-hidden
                        >
                          {checked ? (
                            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
                              <path d="M10.2 3.2 4.8 8.6 2 5.8l-.9.9 3.7 3.7 6.3-6.3-.9-.9z" />
                            </svg>
                          ) : null}
                        </span>
                        {col.imageUrl ? (
                          <img
                            src={col.imageUrl}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded object-cover bg-gray-100"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100">
                            <PhotoIcon className="h-5 w-5 text-gray-400" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900">
                          {col.title}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-gray-100 px-3 py-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[#2c6ecb] hover:underline"
                  onClick={() => {
                    setOpen(false);
                    setCreateSheetOpen(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  Create collection
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <div className="space-y-2 py-1">
      <span className="block text-[13px] font-medium text-gray-800">{field.label}</span>
      <div className="flex items-center gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => void openPicker()}
          className="min-h-9 flex-1 rounded-lg border border-[#c9cccf] bg-white px-4 py-2 text-left text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          {buttonLabel}
        </button>
        <button
          type="button"
          title="Browse collections"
          onClick={() => void openPicker()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          aria-label="Browse collections"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      {pickerMenu}
      <ThemeEditorCreateCollectionSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        onCreated={(collection) => {
          const nextIds = selectedIds.includes(collection._id)
            ? selectedIds
            : [...selectedIds, collection._id];
          applySelectedIds(nextIds, [collection]);
          setCreateSheetOpen(false);
        }}
      />
    </div>
  );
}
