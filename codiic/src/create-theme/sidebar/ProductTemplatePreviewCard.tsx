import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useProducts, type Product } from '../../contexts/product.context';
import { useStore } from '../../contexts/store.context';
import { productPath } from '../../utils/storefront-paths';
import { normalizeStorefrontOrigin } from '../../utils/storefront-url.util';
import {
  isProductPreviewable,
  pickDefaultPreviewProduct,
} from '../utils/product-page-preview.util';
import { ThemeEditorCreateProductSheet } from './ThemeEditorCreateProductSheet';

type Props = {
  previewProductHandle: string | null;
  onPreviewProductHandleChange: (handle: string | null) => void;
  storefrontOrigin?: string | null;
};

export function ProductTemplatePreviewCard({
  previewProductHandle,
  onPreviewProductHandleChange,
  storefrontOrigin,
}: Props) {
  const { activeStoreId } = useStore();
  const { products, fetchProductsByStoreId, loading } = useProducts();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onPreviewProductHandleChange);
  onChangeRef.current = onPreviewProductHandleChange;
  const fetchedStoreIdRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  /** Only active/published products — drafts 404 on the storefront preview API. */
  const availableProducts = useMemo(
    () => products.filter((product) => isProductPreviewable(product)),
    [products]
  );

  useEffect(() => {
    if (!activeStoreId) return;
    if (fetchedStoreIdRef.current === activeStoreId) return;
    fetchedStoreIdRef.current = activeStoreId;
    void fetchProductsByStoreId(activeStoreId);
  }, [activeStoreId, fetchProductsByStoreId]);

  useEffect(() => {
    const stillValid =
      Boolean(previewProductHandle) &&
      availableProducts.some((product) => product.urlHandle === previewProductHandle);

    if (stillValid) return;

    if (!availableProducts.length) {
      // Drop draft/stale handles — storefront preview APIs only serve active products.
      if (previewProductHandle) onChangeRef.current(null);
      return;
    }

    const fallback = pickDefaultPreviewProduct(availableProducts);
    const handle = fallback?.urlHandle?.trim() ?? null;
    if (handle !== previewProductHandle) {
      onChangeRef.current(handle);
    }
  }, [availableProducts, previewProductHandle]);

  useEffect(() => {
    if (!open) return;
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocumentMouseDown);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const active = useMemo(() => {
    if (!previewProductHandle) return pickDefaultPreviewProduct(availableProducts);
    return (
      availableProducts.find((product) => product.urlHandle === previewProductHandle) ??
      pickDefaultPreviewProduct(availableProducts)
    );
  }, [availableProducts, previewProductHandle]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return availableProducts;
    return availableProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.urlHandle.toLowerCase().includes(normalizedQuery) ||
        product.sku?.toLowerCase().includes(normalizedQuery)
    );
  }, [availableProducts, query]);

  const viewHref = useMemo(() => {
    const origin = normalizeStorefrontOrigin(storefrontOrigin);
    const handle = active?.urlHandle?.trim();
    return origin && handle ? `${origin}${productPath(handle)}` : null;
  }, [active?.urlHandle, storefrontOrigin]);

  const selectProduct = useCallback(
    (product: Product) => {
      if (!isProductPreviewable(product)) return;
      const handle = product.urlHandle?.trim();
      if (!handle || handle === previewProductHandle) {
        setOpen(false);
        setQuery('');
        return;
      }
      onChangeRef.current(handle);
      setOpen(false);
      setQuery('');
    },
    [previewProductHandle]
  );

  const handleCreated = useCallback(
    (product: Product) => {
      if (activeStoreId) {
        fetchedStoreIdRef.current = null;
        void fetchProductsByStoreId(activeStoreId);
      }
      // Only switch preview if the new product is storefront-visible.
      if (isProductPreviewable(product)) {
        const handle = product.urlHandle?.trim();
        if (handle) onChangeRef.current(handle);
      }
    },
    [activeStoreId, fetchProductsByStoreId]
  );

  const hasDraftsOnly =
    !availableProducts.length &&
    products.some((product) => !product.isDeleted && product.status === 'draft');

  const emptyHint = loading
    ? 'Loading…'
    : hasDraftsOnly
      ? 'No active products — publish a product to preview'
      : 'Select a product';

  return (
    <div
      ref={rootRef}
      className="relative border-b border-[#e1e1e1] bg-white px-3 py-3"
    >
      <p className="mb-2 text-[12px] font-medium text-gray-600">Preview</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2.5 text-left transition-colors hover:border-[#c9cccf] hover:bg-white"
      >
        {active?.imageUrls?.[0] ? (
          <img
            src={active.imageUrls[0]}
            alt=""
            className="h-10 w-10 shrink-0 rounded bg-gray-100 object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
            <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-gray-900">
            {active?.title ?? emptyHint}
          </p>
          {active?.urlHandle ? (
            <p className="truncate text-[12px] text-gray-500">
              /product/{active.urlHandle}
            </p>
          ) : (
            <p className="truncate text-[12px] text-gray-500">
              {hasDraftsOnly
                ? 'Draft products can’t be previewed on the storefront'
                : 'Choose which product to preview'}
            </p>
          )}
        </div>
        {viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            title="View product on storefront"
            onClick={(event) => event.stopPropagation()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-800"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-3 right-3 z-[1600] mt-1.5 overflow-hidden rounded-xl border border-[#c9cccf] bg-white shadow-lg"
        >
          <div className="border-b border-[#e1e1e1] p-2">
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
                placeholder="Search"
                aria-label="Search products"
                className="w-full rounded-lg border border-[#8c9196] bg-white py-2 pl-8 pr-3 text-[13px] text-gray-900 outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/20"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-[12px] text-gray-500">
                {loading
                  ? 'Loading products…'
                  : query.trim()
                    ? 'No active products match'
                    : 'No active products — set a product to Active to preview it'}
              </li>
            ) : (
              filtered.map((product) => {
                const selected =
                  product.urlHandle === (previewProductHandle ?? active?.urlHandle);
                return (
                  <li key={product._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => selectProduct(product)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] hover:bg-gray-50 ${
                        selected ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-900'
                      }`}
                    >
                      {product.imageUrls?.[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt=""
                          className="h-7 w-7 shrink-0 rounded bg-gray-100 object-cover"
                        />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100">
                          <PhotoIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{product.title}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="border-t border-[#e1e1e1] p-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-[#005bd3] hover:bg-blue-50"
            >
              <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
              Create product
            </button>
          </div>
        </div>
      ) : null}

      <ThemeEditorCreateProductSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
