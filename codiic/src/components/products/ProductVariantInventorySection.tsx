import React, { useCallback } from 'react';
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormSectionTitleClass,
} from './product-form-appearance';

interface ProductVariantInventorySectionProps {
  inventoryTrackingEnabled: boolean;
  continueSellingWhenOutOfStock: boolean;
  onInventoryTrackingEnabledChange: (checked: boolean) => void;
  onContinueSellingChange: (checked: boolean) => void;
  appearance?: ProductFormAppearance;
}

const ProductVariantInventorySection: React.FC<ProductVariantInventorySectionProps> = ({
  inventoryTrackingEnabled,
  continueSellingWhenOutOfStock,
  onInventoryTrackingEnabledChange,
  onContinueSellingChange,
  appearance = 'default',
}) => {
  const handleInventoryTrackingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onInventoryTrackingEnabledChange(e.target.checked);
    },
    [onInventoryTrackingEnabledChange]
  );

  const handleContinueSellingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onContinueSellingChange(e.target.checked);
    },
    [onContinueSellingChange]
  );

  const rowClass =
    appearance === 'minimal'
      ? 'flex cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-2'
      : 'flex cursor-pointer items-center justify-between gap-3 py-2';

  const labelClass =
    appearance === 'minimal' ? 'text-[13px] text-gray-600' : 'text-sm text-gray-700';

  return (
    <div className={productFormCardClass(appearance)}>
      <h2 className={productFormSectionTitleClass(appearance)}>Inventory</h2>
      {appearance === 'minimal' ? (
        <p className="-mt-1 mb-3 text-[12px] leading-snug text-gray-400">
          Control whether this variant tracks stock
        </p>
      ) : null}

      <div className={appearance === 'minimal' ? 'space-y-1' : 'space-y-2'}>
        <label className={rowClass}>
          <span className={labelClass}>Inventory tracking enabled</span>
          <input
            type="checkbox"
            checked={inventoryTrackingEnabled}
            onChange={handleInventoryTrackingChange}
            className="h-3.5 w-3.5 rounded border-gray-300 text-gray-800 focus:ring-gray-300"
          />
        </label>
        <label className={rowClass}>
          <span className={labelClass}>Continue selling when out of stock</span>
          <input
            type="checkbox"
            checked={continueSellingWhenOutOfStock}
            onChange={handleContinueSellingChange}
            className="h-3.5 w-3.5 rounded border-gray-300 text-gray-800 focus:ring-gray-300"
          />
        </label>
      </div>
    </div>
  );
};

export default ProductVariantInventorySection;
