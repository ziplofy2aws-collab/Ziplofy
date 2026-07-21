import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Collection } from '../../contexts/collection.context';
import { useCollections } from '../../contexts/collection.context';
import { useStore } from '../../contexts/store.context';
import { ThemeEditorCreateCollectionSheet } from '../sidebar/ThemeEditorCreateCollectionSheet';

const PICKER_WIDTH = 300;

type MenuPos = { top: number; left: number; width: number };

type Props = {
  collectionId: string;
  collectionTitle: string;
  onSelect: (collection: { id: string; title: string; handle: string } | null) => void;
};

export function ThemeSearchEmptyStateCollectionField({
  collectionId,
  collectionTitle,
  onSelect,
}: Props) {
  const { activeStoreId } = useStore();
  const { collections, loading, fetchCollectionsByStoreId } = useCollections();
  const [open, setOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchCollectionsByStoreId(activeStoreId);
  }, [activeStoreId, fetchCollectionsByStoreId]);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.right - PICKER_WIDTH,
      width: PICKER_WIDTH,
    });
  }, []);

  const openPicker = useCallback(async () => {
    if (!activeStoreId) return;
    updateMenuPosition();
    setOpen(true);
    if (!collections.length) {
      await fetchCollectionsByStoreId(activeStoreId);
    }
    requestAnimationFrame(() => searchRef.current?.focus());
  }, [activeStoreId, collections.length, fetchCollectionsByStoreId, updateMenuPosition]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter((col) => col.title.toLowerCase().includes(q));
  }, [collections, search]);

  const buttonLabel = collectionTitle.trim() || 'Select';

  const applyCollection = useCallback(
    (col: Collection | null) => {
      if (!col) {
        onSelect(null);
        return;
      }
      onSelect({
        id: col._id,
        title: col.title,
        handle: col.urlHandle?.trim() ?? '',
      });
    },
    [onSelect]
  );

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
                    const selected = col._id === collectionId;
                    return (
                      <button
                        key={col._id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          applyCollection(selected ? null : col);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
                      >
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
    <>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-2">
        <div className="min-w-0">
          <p className="text-[13px] text-gray-800">Empty state collection</p>
          <p className="text-[12px] leading-snug text-gray-500">Shown before a search is entered</p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => void openPicker()}
          className="min-h-9 shrink-0 rounded-lg border border-[#c9cccf] bg-white px-4 py-2 text-[13px] font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          {buttonLabel}
        </button>
      </div>
      {pickerMenu}
      <ThemeEditorCreateCollectionSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        onCreated={(collection) => {
          applyCollection(collection);
          setCreateSheetOpen(false);
        }}
      />
    </>
  );
}
