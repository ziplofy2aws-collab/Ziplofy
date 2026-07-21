import { CubeIcon, TruckIcon } from '@heroicons/react/24/outline';
import React from 'react';

const toggleTrackClass =
  'h-5 w-10 rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-blue-600 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:after:translate-x-5';

interface ProductVariantToggleControlsProps {
  isPhysicalProduct: boolean;
  isInventoryTrackingEnabled: boolean;
  onIsPhysicalProductChange: (value: boolean) => void;
  onIsInventoryTrackingEnabledChange: (value: boolean) => void;
  onSaveChanges: () => void;
}

const ProductVariantToggleControls: React.FC<ProductVariantToggleControlsProps> = ({
  isPhysicalProduct,
  isInventoryTrackingEnabled,
  onIsPhysicalProductChange,
  onIsInventoryTrackingEnabledChange,
  onSaveChanges,
}) => {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <h2 className="text-sm font-semibold text-gray-900">Fulfillment</h2>
        <p className="mt-0.5 text-xs text-gray-500">Physical product and inventory tracking for this SKU</p>
      </div>
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-3 transition-colors hover:bg-gray-50">
            <div className="relative inline-block h-5 w-10 shrink-0">
              <input
                type="checkbox"
                checked={isPhysicalProduct}
                onChange={(e) => onIsPhysicalProductChange(e.target.checked)}
                className="peer sr-only"
              />
              <div className={`relative ${toggleTrackClass} after:content-['']`} />
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <TruckIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-gray-900">Physical product</p>
                <p className="text-xs text-gray-500">
                  {isPhysicalProduct ? 'Shipping & package fields apply' : 'Digital or service'}
                </p>
              </div>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-3 transition-colors hover:bg-gray-50">
            <div className="relative inline-block h-5 w-10 shrink-0">
              <input
                type="checkbox"
                checked={isInventoryTrackingEnabled}
                onChange={(e) => onIsInventoryTrackingEnabledChange(e.target.checked)}
                className="peer sr-only"
              />
              <div className={`relative ${toggleTrackClass} after:content-['']`} />
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <CubeIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-gray-900">Inventory tracking</p>
                <p className="text-xs text-gray-500">
                  {isInventoryTrackingEnabled ? 'Stock tracked for this variant' : 'Not tracked'}
                </p>
              </div>
            </div>
          </label>
        </div>
        <button
          type="button"
          onClick={onSaveChanges}
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Save fulfillment
        </button>
      </div>
    </div>
  );
};

export default ProductVariantToggleControls;
