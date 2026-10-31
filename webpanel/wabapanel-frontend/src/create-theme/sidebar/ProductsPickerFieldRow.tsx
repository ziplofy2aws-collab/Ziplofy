import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleStackIcon, MagnifyingGlassIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useProducts, type Product } from '../../contexts/product.context';
import { useStore } from '../../contexts/store.context';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import { fieldValueAsString } from './create-theme-field.utils';
import {
  parseCollectionLinksPicker,
  serializeCollectionLinksPicker,
} from '../utils/collection-links-collections.util';

const PICKER_WIDTH = 300;

type MenuPos = { top: number; left: number; width: number };

function productsById(products: Product[], extra: Product[] = []): Map<string, Product> {
  const map = new Map<string, Product>();
  for (const product of [...products, ...extra]) {
    map.set(product._id, product);
  }
  return map;
}

function selectedIdsFromRaw(raw: string, products: Product[]): string[] {
  const ids = parseCollectionLinksPicker(raw);
  const out: string[] = [];
  const used = new Set<string>();
  for (const id of ids) {
    if (!id || used.has(id)) continue;
    out.push(id);
    used.add(id);
  }
  // Prefer known product order when available, but keep ids even if list hasn't loaded yet.
  void products;
  return out;
}

type Props = {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onProductsApply?: (settingsPath: string, productIds: string[]) => void;
};

export function ProductsPickerFieldRow({
  field,
  values,
  onProductsApply = () => {},
}: Props) {
  const { activeStoreId } = useStore();
  const { products, loading, fetchProductsByStoreId } = useProducts();
  const [open, setOpen] = useState(false);
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
    setSelectedIds(selectedIdsFromRaw(pickerRaw, products));
  }, [pickerRaw, products, open]);

  useEffect(() => {
    if (!open || !pendingOpenInitRef.current || loading) return;
    pendingOpenInitRef.current = false;
    setSelectedIds(selectedIdsFromRaw(pickerRaw, products));
  }, [open, loading, products, pickerRaw]);

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
      toast.error('Select a store before choosing products');
      return;
    }
    pendingOpenInitRef.current = true;
    setOpen(true);
    try {
      await fetchProductsByStoreId(activeStoreId);
    } catch {
      toast.error('Failed to load products');
    }
  }, [activeStoreId, fetchProductsByStoreId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q) ||
        (p.urlHandle ?? '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const applySelectedIds = useCallback(
    (ids: string[]) => {
      skipPickerSyncRef.current = true;
      onProductsApply(field.path, ids);
      setSelectedIds(ids);
      window.setTimeout(() => {
        skipPickerSyncRef.current = false;
      }, 0);
    },
    [field.path, onProductsApply]
  );

  const toggleProduct = useCallback(
    (productId: string) => {
      const next = selectedIdSet.has(productId)
        ? selectedIds.filter((id) => id !== productId)
        : [...selectedIds, productId];
      applySelectedIds(next);
    },
    [applySelectedIds, selectedIds, selectedIdSet]
  );

  const buttonLabel = useMemo(() => {
    if (!selectedIds.length) return 'Select';
    if (selectedIds.length === 1) {
      const product = products.find((p) => p._id === selectedIds[0]);
      return product?.title ?? '1 product';
    }
    return `${selectedIds.length} products`;
  }, [products, selectedIds]);

  const byId = useMemo(() => productsById(products), [products]);

  const pickerMenu =
    open && menuPos
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[1400] cursor-default bg-transparent"
              aria-label="Close products picker"
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
              aria-label="Products"
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
                  <p className="px-3 py-4 text-center text-[13px] text-gray-500">Loading products…</p>
                ) : filtered.length === 0 ? (
                  <p className="px-3 py-4 text-center text-[13px] text-gray-500">No products found</p>
                ) : (
                  filtered.map((product) => {
                    const checked = selectedIdSet.has(product._id);
                    const thumb = product.imageUrls?.[0];
                    return (
                      <button
                        key={product._id}
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => toggleProduct(product._id)}
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
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded object-cover bg-gray-100"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100">
                            <PhotoIcon className="h-5 w-5 text-gray-400" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900">
                          {product.title}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedIds.length > 0 ? (
                <div className="border-t border-gray-100 px-3 py-2 text-[12px] text-gray-500">
                  {selectedIds
                    .map((id) => byId.get(id)?.title)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(', ')}
                  {selectedIds.length > 3 ? ` +${selectedIds.length - 3} more` : ''}
                </div>
              ) : null}
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
          title="Browse products"
          onClick={() => void openPicker()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          aria-label="Browse products"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      {pickerMenu}
    </div>
  );
}

export function serializeProductsPicker(productIds: string[]): string {
  return serializeCollectionLinksPicker(productIds);
}
