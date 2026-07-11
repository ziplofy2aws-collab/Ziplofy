import React, { useCallback } from "react";
import ProductAdditionalDisplayPrices from "./ProductAdditionalDisplayPrices";
import {
  type ProductFormAppearance,
  productFormCardClass,
  productFormInputClass,
  productFormLabelClass,
} from "./product-form-appearance";

interface ProductPriceSectionProps {
  price: string;
  compareAtPrice: string;
  unitPriceTotalAmount: string;
  unitPriceBaseMeasure: string;
  selectedUnit: string;
  selectedBaseMeasureUnit: string;
  chargeTaxOnProduct: boolean;
  cost: string;
  onPriceChange: (value: string) => void;
  onCompareAtPriceChange: (value: string) => void;
  onUnitPriceTotalAmountChange: (value: string) => void;
  onUnitPriceBaseMeasureChange: (value: string) => void;
  onSelectedUnitChange: (value: string) => void;
  onSelectedBaseMeasureUnitChange: (value: string) => void;
  onChargeTaxOnProductChange: (checked: boolean) => void;
  onCostChange: (value: string) => void;
  appearance?: ProductFormAppearance;
}

const ProductPriceSection: React.FC<ProductPriceSectionProps> = ({
  price,
  compareAtPrice,
  unitPriceTotalAmount,
  unitPriceBaseMeasure,
  selectedUnit,
  selectedBaseMeasureUnit,
  chargeTaxOnProduct,
  cost,
  onPriceChange,
  onCompareAtPriceChange,
  onUnitPriceTotalAmountChange,
  onUnitPriceBaseMeasureChange,
  onSelectedUnitChange,
  onSelectedBaseMeasureUnitChange,
  onChargeTaxOnProductChange,
  onCostChange,
  appearance = 'default',
}) => {
  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPriceChange(e.target.value);
    },
    [onPriceChange]
  );

  return (
    <div className={productFormCardClass(appearance)}>
      <div className="max-w-xs">
        <label className={productFormLabelClass(appearance)}>Price</label>
        <div className="relative">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${appearance === 'minimal' ? 'text-sm text-gray-400' : 'text-base text-gray-500'}`}>
            ₹
          </span>
          <input
            type="number"
            value={price}
            onChange={handlePriceChange}
            placeholder="0.00"
            className={`${productFormInputClass(appearance)} pl-8`}
          />
        </div>
      </div>

      <ProductAdditionalDisplayPrices
        price={price}
        compareAtPrice={compareAtPrice}
        unitPriceTotalAmount={unitPriceTotalAmount}
        unitPriceBaseMeasure={unitPriceBaseMeasure}
        selectedUnit={selectedUnit}
        selectedBaseMeasureUnit={selectedBaseMeasureUnit}
        chargeTaxOnProduct={chargeTaxOnProduct}
        cost={cost}
        onCompareAtPriceChange={onCompareAtPriceChange}
        onUnitPriceTotalAmountChange={onUnitPriceTotalAmountChange}
        onUnitPriceBaseMeasureChange={onUnitPriceBaseMeasureChange}
        onSelectedUnitChange={onSelectedUnitChange}
        onSelectedBaseMeasureUnitChange={onSelectedBaseMeasureUnitChange}
        onChargeTaxOnProductChange={onChargeTaxOnProductChange}
        onCostChange={onCostChange}
      />
    </div>
  );
};

export default ProductPriceSection;
