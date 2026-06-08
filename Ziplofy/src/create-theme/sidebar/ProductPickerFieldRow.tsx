import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleStackIcon, MagnifyingGlassIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Product } from '../../contexts/product.context';
import { useProducts } from '../../contexts/product.context';
import { useStore } from '../../contexts/store.context';
import { THEME_EDITOR_STATIC_CONFIG } from '../../config/theme-editor-static.config';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import { fieldValueAsString, type ThemeEditorFieldType } from './create-theme-field.utils';
import { productHighlightSiblingPath } from './theme-editor-product-highlight-panel.utils';
import { formatProductPrice } from './ThemeEditorProductPickerModal';
import { ThemeEditorCreateProductSheet } from './ThemeEditorCreateProductSheet';

const PICKER_WIDTH = 300;

type MenuPos = { top: number; left: number; width: number };

type Props = {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

export function ProductPickerFieldRow({ field, values, onFieldChange }: Props) {
  const { activeStoreId } = useStore();
  const { products, loading, fetchProductsByStoreId } = useProducts();
  const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;

  const [open, setOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const productId = fieldValueAsString(values, field);
  const titlePath = productHighlightSiblingPath(field.path, 'productTitle');
  const pricePath = productHighlightSiblingPath(field.path, 'price');
  const imagePath = productHighlightSiblingPath(field.path, 'productImageUrl');
  const displayTitle = String(values[titlePath] ?? '');
  const hasProduct = Boolean(productId.trim());

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
    if (!storeId) {
      toast.error('Select a store before choosing a product');
      return;
    }
    setOpen(true);
    try {
      await fetchProductsByStoreId(storeId);
    } catch {
      toast.error('Failed to load products');
    }
  }, [storeId, fetchProductsByStoreId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const applyProduct = useCallback(
    (product: Product) => {
      onFieldChange(field.path, 'text', product._id);
      onFieldChange(titlePath, 'text', product.title);
      onFieldChange(pricePath, 'text', formatProductPrice(product.price));
      onFieldChange(imagePath, 'text', product.imageUrls?.[0] ?? '');
      setOpen(false);
    },
    [field.path, imagePath, onFieldChange, pricePath, titlePath]
  );

  const clearProduct = useCallback(() => {
    onFieldChange(field.path, 'text', '');
    onFieldChange(titlePath, 'text', 'Product title');
    onFieldChange(pricePath, 'text', 'Rs. 19.99');
    onFieldChange(imagePath, 'text', '');
  }, [field.path, imagePath, onFieldChange, pricePath, titlePath]);

  const buttonLabel = hasProduct && displayTitle ? displayTitle : 'Select';

  const pickerMenu =
    open && menuPos
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[1400] cursor-default bg-transparent"
              aria-label="Close product picker"
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
                    const thumb = product.imageUrls?.[0];
                    const selected = product._id === productId;
                    return (
                      <button
                        key={product._id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => applyProduct(product)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 ${
                          selected ? 'bg-[#f0f4ff]' : ''
                        }`}
                      >
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
                  Create product
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
          title="Browse products"
          onClick={() => void openPicker()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          aria-label="Browse products"
        >
          <CircleStackIcon className="h-4 w-4" />
        </button>
      </div>
      {hasProduct ? (
        <button type="button" className="text-[12px] text-[#005bd3] hover:underline" onClick={clearProduct}>
          Clear product
        </button>
      ) : null}
      {pickerMenu}
      <ThemeEditorCreateProductSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        onCreated={(product) => {
          applyProduct(product);
          setCreateSheetOpen(false);
        }}
      />
    </div>
  );
}
