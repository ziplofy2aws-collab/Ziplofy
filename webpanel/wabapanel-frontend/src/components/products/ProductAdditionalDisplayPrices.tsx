import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useMemo, useState } from "react";
import CompareAtPriceInput from "./CompareAtPriceInput";
import type { ProductFormAppearance } from "./product-form-appearance";
import ProductTaxCheckbox from "./ProductTaxCheckbox";
import ProductUnitPriceSection from "./ProductUnitPriceSection";

interface ProductAdditionalDisplayPricesProps {
  price: string;
  compareAtPrice: string;
  unitPriceTotalAmount: string;
  unitPriceBaseMeasure: string;
  selectedUnit: string;
  selectedBaseMeasureUnit: string;
  chargeTaxOnProduct: boolean;
  cost: string;
  onCompareAtPriceChange: (value: string) => void;
  onUnitPriceTotalAmountChange: (value: string) => void;
  onUnitPriceBaseMeasureChange: (value: string) => void;
  onSelectedUnitChange: (value: string) => void;
  onSelectedBaseMeasureUnitChange: (value: string) => void;
  onChargeTaxOnProductChange: (checked: boolean) => void;
  onCostChange: (value: string) => void;
  appearance?: ProductFormAppearance;
}

const pillClass =
  "rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800";

const ProductAdditionalDisplayPrices: React.FC<
  ProductAdditionalDisplayPricesProps
> = ({
  price,
  compareAtPrice,
  unitPriceTotalAmount,
  unitPriceBaseMeasure,
  selectedUnit,
  selectedBaseMeasureUnit,
  chargeTaxOnProduct,
  cost,
  onCompareAtPriceChange,
  onUnitPriceTotalAmountChange,
  onUnitPriceBaseMeasureChange,
  onSelectedUnitChange,
  onSelectedBaseMeasureUnitChange,
  onChargeTaxOnProductChange,
  onCostChange,
  appearance = "default",
}) => {
  const [expanded, setExpanded] = useState(false);
  const isMinimal = appearance === "minimal";

  const { profitDisplay, marginDisplay, profitNonNegative } = useMemo(() => {
    const priceTrim = price.trim();
    const costTrim = cost.trim();
    if (!priceTrim || !costTrim) {
      return {
        profitDisplay: "--",
        marginDisplay: "--",
        profitNonNegative: true,
      };
    }
    const priceNum = parseFloat(price) || 0;
    const costNum = parseFloat(cost) || 0;
    const prof = priceNum - costNum;
    const marg = priceNum !== 0 ? (prof / priceNum) * 100 : null;
    return {
      profitDisplay: `₹${prof.toFixed(2)}`,
      marginDisplay: marg === null ? "--" : `${marg.toFixed(1)}%`,
      profitNonNegative: prof >= 0,
    };
  }, [price, cost]);

  const handleCostChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onCostChange(e.target.value);
    },
    [onCostChange]
  );

  const metricBoxClass =
    "w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700";

  return (
    <div className={isMinimal ? "mt-4 border-t border-gray-100/80" : "border-t border-gray-200"}>
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:bg-gray-50/50"
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={
                  isMinimal
                    ? "text-[13px] font-medium text-gray-600"
                    : "text-sm font-medium text-gray-700"
                }
              >
                More pricing options
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                Optional
              </span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className={pillClass}>Compare-at</span>
              <span className={pillClass}>Unit price</span>
              <span className={`${pillClass} inline-flex items-center gap-1.5`}>
                Charge tax
                {chargeTaxOnProduct ? (
                  <span className="rounded-md bg-gray-200/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700">
                    Yes
                  </span>
                ) : null}
              </span>
              <span className={pillClass}>Cost per item</span>
            </div>
          </div>
          <ChevronDownIcon
            className="h-5 w-5 shrink-0 text-gray-500"
            aria-hidden
          />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex w-full items-center justify-between gap-3 border-b border-gray-100 py-4 text-left transition-colors hover:bg-gray-50/50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              More pricing options
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                Optional
              </span>
            </span>
            <ChevronUpIcon
              className="h-5 w-5 shrink-0 text-gray-500"
              aria-hidden
            />
          </button>

          <div className="py-4">
            <p className="mb-4 text-[13px] text-gray-500">
              Skip these unless you need a compare-at price, unit pricing, tax, or cost tracking.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <CompareAtPriceInput
                value={compareAtPrice}
                onChange={onCompareAtPriceChange}
              />
              <ProductUnitPriceSection
                unitPriceTotalAmount={unitPriceTotalAmount}
                unitPriceBaseMeasure={unitPriceBaseMeasure}
                selectedUnit={selectedUnit}
                selectedBaseMeasureUnit={selectedBaseMeasureUnit}
                onUnitPriceTotalAmountChange={onUnitPriceTotalAmountChange}
                onUnitPriceBaseMeasureChange={onUnitPriceBaseMeasureChange}
                onSelectedUnitChange={onSelectedUnitChange}
                onSelectedBaseMeasureUnitChange={
                  onSelectedBaseMeasureUnitChange
                }
              />
            </div>

            <div className="mt-4">
              <ProductTaxCheckbox
                checked={chargeTaxOnProduct}
                onChange={onChargeTaxOnProductChange}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-medium text-gray-600">
                  Cost <span className="font-normal text-gray-400">(optional)</span>
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={cost}
                    onChange={handleCostChange}
                    placeholder="--"
                    className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm transition-colors focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-gray-600">Profit</p>
                <div
                  className={`${metricBoxClass} ${
                    profitDisplay !== "--" && !profitNonNegative
                      ? "text-red-600"
                      : profitDisplay !== "--" && profitNonNegative
                        ? "text-green-600"
                        : ""
                  }`}
                >
                  {profitDisplay}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-gray-600">Margin</p>
                <div
                  className={`${metricBoxClass} ${
                    marginDisplay !== "--" && !profitNonNegative
                      ? "text-red-600"
                      : marginDisplay !== "--" && profitNonNegative
                        ? "text-green-600"
                        : ""
                  }`}
                >
                  {marginDisplay}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductAdditionalDisplayPrices;
