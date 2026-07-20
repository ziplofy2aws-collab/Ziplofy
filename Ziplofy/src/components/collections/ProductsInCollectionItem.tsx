import { RectangleStackIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo } from 'react';
import type { CollectionEntry } from '../../contexts/collection-entries.context';

interface ProductsInCollectionItemProps {
  entry: CollectionEntry;
  onProductClick: (productId: string) => void;
  onRemoveProduct: (e: React.MouseEvent, entryId: string) => void;
}

const formatInr = (n: number) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductsInCollectionItem: React.FC<ProductsInCollectionItemProps> = ({
  entry,
  onProductClick,
  onRemoveProduct,
}) => {
  const handleClick = useCallback(() => {
    if (entry?.productId?._id) {
      onProductClick(entry.productId._id);
    }
  }, [entry?.productId?._id, onProductClick]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      onRemoveProduct(e, entry?._id);
    },
    [entry?._id, onRemoveProduct]
  );

  const descriptionSnippet = useMemo(() => {
    const d = entry?.productId?.description?.trim();
    if (!d) return null;
    return d.length > 100 ? `${d.slice(0, 100)}…` : d;
  }, [entry?.productId?.description]);

  const price = entry?.productId?.price;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.02] transition-all hover:border-blue-200/80 hover:bg-blue-50/20 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
          {entry?.productId?.imageUrls?.[0] ? (
            <img
              src={entry.productId.imageUrls[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-600 to-gray-900">
              <RectangleStackIcon className="h-5 w-5 text-white" aria-hidden />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {entry?.productId?.title || 'Untitled product'}
          </p>
          {descriptionSnippet ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{descriptionSnippet}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
              {price != null ? formatInr(Number(price)) : '—'}
            </span>
            <span className="inline-flex rounded-lg border border-gray-200 bg-white px-2 py-0.5 font-mono text-xs text-gray-700">
              {entry?.productId?.sku || 'No SKU'}
            </span>
            {entry?.productId?.category?.name ? (
              <span className="inline-flex rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                {entry.productId.category.name}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <p className="text-[11px] text-gray-400">
          Added{' '}
          {entry?.createdAt
            ? new Date(entry.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </p>
        <button
          type="button"
          onClick={handleRemove}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Remove from collection"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductsInCollectionItem;
