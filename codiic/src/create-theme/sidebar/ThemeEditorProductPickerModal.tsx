import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useProducts, type Product } from '../../contexts/product.context';
import { useStore } from '../../contexts/store.context';
import { THEME_EDITOR_STATIC_CONFIG } from '../../config/theme-editor-static.config';
import { ThemeEditorCreateProductSheet } from './ThemeEditorCreateProductSheet';

export type ThemeEditorProductPickerModalProps = {
  open: boolean;
  onClose: () => void;
  selectedProductId?: string;
  onSelect: (product: Product) => void;
};

function formatProductPrice(price: number): string {
  return `Rs. ${price.toFixed(2)}`;
}

export const ThemeEditorProductPickerModal: React.FC<ThemeEditorProductPickerModalProps> = ({
  open,
  onClose,
  selectedProductId = '',
  onSelect,
}) => {
  const { activeStoreId } = useStore();
  const { products, fetchProductsByStoreId, loading } = useProducts();
  const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !storeId) return;
    setSearch('');
    void fetchProductsByStoreId(storeId);
  }, [open, storeId, fetchProductsByStoreId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.title.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
  }, [products, search]);

  if (!mounted) return null;

  return createPortal(
    <>
    {open ? (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="flex max-h-[min(640px,90vh)] w-full max-w-[480px] flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-editor-product-picker-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e1e1e1] px-4 py-3">
          <h2 id="theme-editor-product-picker-title" className="text-[15px] font-semibold text-gray-900">
            Select product
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-[#e1e1e1] px-4 py-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full rounded-lg border border-[#c9cccf] bg-white py-2 pl-9 pr-3 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <p className="px-2 py-6 text-center text-[13px] text-gray-500">Loading products…</p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-[13px] text-gray-500">
              {products.length === 0 ? 'No products in this store yet.' : 'No products match your search.'}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((product) => {
                const thumb = product.imageUrls?.[0];
                const selected = product._id === selectedProductId;
                return (
                  <li key={product._id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(product);
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#f6f6f7] ${
                        selected ? 'bg-[#f0f4ff] ring-1 ring-[#005bd3]/30' : ''
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#e1e1e1] bg-[#fafbfb]">
                        {thumb ? (
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400">No img</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-gray-900">{product.title}</p>
                        <p className="text-[12px] text-gray-500">{formatProductPrice(product.price)}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-[#e1e1e1] px-4 py-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2c6ecb] hover:underline"
            onClick={() => {
              onClose();
              setCreateSheetOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Create product
          </button>
        </div>
      </div>
    </div>
    ) : null}
    <ThemeEditorCreateProductSheet
      open={createSheetOpen}
      onClose={() => setCreateSheetOpen(false)}
      onCreated={(product) => {
        onSelect(product);
        setCreateSheetOpen(false);
      }}
    />
    </>,
    document.body
  );
};

export { formatProductPrice };
