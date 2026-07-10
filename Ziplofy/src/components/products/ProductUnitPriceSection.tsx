import React, { useCallback } from "react";

interface ProductUnitPriceSectionProps {
  unitPriceTotalAmount: string;
  unitPriceBaseMeasure: string;
  selectedUnit: string;
  selectedBaseMeasureUnit: string;
  onUnitPriceTotalAmountChange: (value: string) => void;
  onUnitPriceBaseMeasureChange: (value: string) => void;
  onSelectedUnitChange: (value: string) => void;
  onSelectedBaseMeasureUnitChange: (value: string) => void;
}

const unitCategories = {
  weight: ["milligram", "gram", "kilogram"],
  volume: ["milliliter", "centiliter", "liter", "cubic meter"],
  size: ["millimeter", "centimeter", "meter"],
  area: ["square meter"],
  "per item": ["item"],
};

const ProductUnitPriceSection: React.FC<ProductUnitPriceSectionProps> = ({
  unitPriceTotalAmount,
  unitPriceBaseMeasure,
  selectedUnit,
  selectedBaseMeasureUnit,
  onUnitPriceTotalAmountChange,
  onUnitPriceBaseMeasureChange,
  onSelectedUnitChange,
  onSelectedBaseMeasureUnitChange,
}) => {
  const getAvailableBaseMeasureUnits = useCallback(() => {
    if (!selectedUnit) return [];
    for (const [, units] of Object.entries(unitCategories)) {
      if (units.includes(selectedUnit)) {
        return units;
      }
    }
    return [];
  }, [selectedUnit]);

  const handleUnitSelect = useCallback(
    (unit: string) => {
      onSelectedUnitChange(unit);
      onSelectedBaseMeasureUnitChange("");
    },
    [onSelectedUnitChange, onSelectedBaseMeasureUnitChange]
  );

  const handleUnitSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleUnitSelect(e.target.value);
    },
    [handleUnitSelect]
  );

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Unit price
      </label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-500">
              ₹
            </span>
            <input
              type="number"
              placeholder="--"
              value={unitPriceTotalAmount}
              onChange={(e) => onUnitPriceTotalAmountChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-8 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <select
            value={selectedUnit}
            onChange={handleUnitSelectChange}
            className="min-w-28 shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-800 transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="">Unit</option>
            {Object.entries(unitCategories).map(([category, units]) => (
              <optgroup
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-500">
              ₹
            </span>
            <input
              type="number"
              placeholder="—"
              value={unitPriceBaseMeasure}
              onChange={(e) => onUnitPriceBaseMeasureChange(e.target.value)}
              disabled={!selectedUnit}
              className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <select
            value={selectedBaseMeasureUnit}
            onChange={(e) => onSelectedBaseMeasureUnitChange(e.target.value)}
            disabled={!selectedUnit}
            className="min-w-28 shrink-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-800 transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            <option value="">
              {!selectedUnit ? "--" : "Per unit"}
            </option>
            {getAvailableBaseMeasureUnits().map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductUnitPriceSection;
