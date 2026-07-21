import React, { useCallback } from "react";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
} from "./product-form-appearance";

interface ProductInventorySectionProps {
  inventoryTrackingEnabled: boolean;
  continueSellingWhenOutOfStock?: boolean;
  sku: string;
  barcode: string;
  onInventoryTrackingEnabledChange: (checked: boolean) => void;
  onContinueSellingChange?: (checked: boolean) => void;
  onSkuChange: (value: string) => void;
  onBarcodeChange: (value: string) => void;
  appearance?: ProductFormAppearance;
}

const ProductInventorySection: React.FC<ProductInventorySectionProps> = ({
  inventoryTrackingEnabled,
  continueSellingWhenOutOfStock = false,
  sku,
  barcode,
  onInventoryTrackingEnabledChange,
  onContinueSellingChange,
  onSkuChange,
  onBarcodeChange,
  appearance = 'default',
}) => {
  const handleInventoryTrackingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onInventoryTrackingEnabledChange(e.target.checked);
  }, [onInventoryTrackingEnabledChange]);

  const handleSkuChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSkuChange(e.target.value);
  }, [onSkuChange]);

  const handleBarcodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onBarcodeChange(e.target.value);
  }, [onBarcodeChange]);

  return (
    <div className={productFormCardClass(appearance)}>
      <div className={`flex items-center justify-between ${appearance === 'minimal' ? 'mb-3' : 'mb-4'}`}>
        <h2 className={appearance === 'minimal' ? 'text-sm font-medium text-gray-600' : 'text-base font-semibold text-gray-900'}>
          Inventory
        </h2>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={inventoryTrackingEnabled}
            onChange={handleInventoryTrackingChange}
            className="h-3.5 w-3.5 rounded border-gray-300 text-gray-800 focus:ring-gray-300"
          />
          <span className={appearance === 'minimal' ? 'text-[13px] text-gray-500' : 'text-sm text-gray-700'}>
            Inventory tracking enabled
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={productFormLabelClass(appearance)}>
            SKU (Stock Keeping Unit)
          </label>
          <input
            type="text"
            value={sku}
            onChange={handleSkuChange}
            placeholder="Enter SKU"
            className={productFormInputClass(appearance)}
          />
        </div>
        <div>
          <label className={productFormLabelClass(appearance)}>
            Barcode (ISBN, UPC, GTIN, etc.)
          </label>
          <input
            type="text"
            value={barcode}
            onChange={handleBarcodeChange}
            placeholder="Enter barcode"
            className={productFormInputClass(appearance)}
          />
        </div>
      </div>

      {onContinueSellingChange ? (
        <label className={`mt-4 flex cursor-pointer items-center gap-2 ${appearance === 'minimal' ? 'text-[13px] text-gray-500' : 'text-sm text-gray-700'}`}>
          <input
            type="checkbox"
            checked={continueSellingWhenOutOfStock}
            onChange={(e) => onContinueSellingChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-gray-800 focus:ring-gray-300"
          />
          Continue selling when out of stock
        </label>
      ) : null}
    </div>
  );
};

export default ProductInventorySection;
