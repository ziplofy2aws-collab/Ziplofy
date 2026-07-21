import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CubeIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../contexts/product.context';
import { ProductVariant } from '../contexts/product-variant.context';

interface ProductVariantDetailsHeaderProps {
  product: Product;
  variant: ProductVariant;
  productId: string;
}

const formatInr = (n: number) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductVariantDetailsHeader: React.FC<ProductVariantDetailsHeaderProps> = ({
  product,
  variant,
  productId,
}) => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(`/products/${productId}`);
  }, [navigate, productId]);

  const optionEntries = useMemo(
    () => Object.entries(variant.optionValues || {}),
    [variant.optionValues]
  );

  return (
    <header className="mb-8 space-y-5">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Product
      </button>

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <HomeIcon className="h-3.5 w-3.5" aria-hidden />
          Catalog
        </button>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
        <button
          type="button"
          onClick={handleBack}
          className="max-w-[200px] truncate rounded-lg px-2 py-1 text-left font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          {product.title || 'Product'}
        </button>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
        <span className="rounded-lg bg-gray-100/80 px-2 py-1 font-mono text-xs font-semibold text-gray-900">
          {variant.sku || 'Variant'}
        </span>
      </nav>

      <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-indigo-50/20 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 border-l-4 border-indigo-500/70 pl-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Variant</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              <span className="font-mono">{variant.sku || 'Untitled SKU'}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{product.title}</span>
            </p>
            {optionEntries.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {optionEntries.map(([key, value]) => (
                  <span
                    key={`${key}-${value}`}
                    className="inline-flex rounded-lg border border-indigo-100 bg-white px-2.5 py-1 text-xs font-medium text-indigo-900 shadow-sm"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
                <CubeIcon className="h-3.5 w-3.5" aria-hidden />
                {formatInr(Number(variant.price ?? 0))}
              </span>
              {variant.isInventoryTrackingEnabled ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Inventory tracked
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  No inventory tracking
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProductVariantDetailsHeader;
