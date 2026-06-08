import { CalendarDaysIcon, CubeIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Product } from '../contexts/product.context';

interface ProductStatusDetailsProps {
  product: Product;
}

const ProductStatusDetails: React.FC<ProductStatusDetailsProps> = ({ product }) => {
  const created = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';
  const updated = product.updatedAt
    ? new Date(product.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Status &amp; inventory</h2>
        <p className="mt-0.5 text-xs text-gray-500">Quick snapshot of this product</p>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Listing status</p>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                product.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {product.status === 'active' ? 'Active' : product.status || 'Draft'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <CubeIcon className="h-4 w-4 text-blue-600" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Inventory tracking</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {product.inventoryTrackingEnabled ? 'Enabled' : 'Disabled'}
              </p>
              {product.inventoryTrackingEnabled ? (
                <p className="mt-1 text-xs text-gray-600">
                  Quantity on hand: <span className="font-semibold text-gray-900">{product.quantity ?? 0}</span>
                </p>
              ) : null}
            </div>
          </div>

        </div>

        <div className="space-y-2 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span>
              <span className="font-semibold text-gray-800">Created</span> · {created}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span>
              <span className="font-semibold text-gray-800">Updated</span> · {updated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStatusDetails;
