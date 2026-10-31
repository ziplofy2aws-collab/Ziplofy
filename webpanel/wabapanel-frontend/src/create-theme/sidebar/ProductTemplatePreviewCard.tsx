import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
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
import {
  TemplatePreviewPickerOption,
  TemplatePreviewPickerShell,
  TemplatePreviewPickerThumb,
  templatePreviewCreateClassName,
  templatePreviewSearchClassName,
  templatePreviewViewLinkClassName,
} from './TemplatePreviewPickerShell';

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
    <>
      <TemplatePreviewPickerShell
        rootRef={rootRef}
        label="Preview product"
        open={open}
        onToggle={() => setOpen((current) => !current)}
        trigger={
          <div className="flex items-center gap-3">
            <TemplatePreviewPickerThumb src={active?.imageUrls?.[0]} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-gray-900">
                {active?.title ?? emptyHint}
              </p>
              {active?.urlHandle ? (
                <p className="truncate text-[11px] text-gray-500">/product/{active.urlHandle}</p>
              ) : (
                <p className="truncate text-[11px] text-gray-500">
                  {hasDraftsOnly
                    ? 'Draft products can’t be previewed on the storefront'
                    : 'Choose which product to preview'}
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
              title="View product on storefront"
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
              placeholder="Search products"
              aria-label="Search products"
              className={templatePreviewSearchClassName}
            />
          </div>
        </div>

        <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-[12px] text-gray-500">
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
                  <TemplatePreviewPickerOption
                    selected={selected}
                    onClick={() => selectProduct(product)}
                    thumb={<TemplatePreviewPickerThumb src={product.imageUrls?.[0]} size="sm" />}
                    title={product.title}
                    subtitle={product.urlHandle ? `/product/${product.urlHandle}` : undefined}
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
            Create product
          </button>
        </div>
      </TemplatePreviewPickerShell>

      <ThemeEditorCreateProductSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
