import React, { useCallback } from "react";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
  productFormSectionTitleClass,
} from "./product-form-appearance";

interface ProductInventorySectionProps {
  sku: string;
  barcode: string;
  onSkuChange: (value: string) => void;
  onBarcodeChange: (value: string) => void;
  appearance?: ProductFormAppearance;
  hideTitle?: boolean;
}

const ProductInventorySection: React.FC<ProductInventorySectionProps> = ({
  sku,
  barcode,
  onSkuChange,
  onBarcodeChange,
  appearance = 'default',
  hideTitle = false,
}) => {
  const handleSkuChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSkuChange(e.target.value);
  }, [onSkuChange]);

  const handleBarcodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onBarcodeChange(e.target.value);
  }, [onBarcodeChange]);

  return (
    <div className={productFormCardClass(appearance)}>
      {!hideTitle ? (
        <h2 className={productFormSectionTitleClass(appearance)}>Inventory</h2>
      ) : null}

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
    </div>
  );
};

export default ProductInventorySection;
