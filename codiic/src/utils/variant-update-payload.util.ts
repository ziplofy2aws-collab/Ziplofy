import type { ProductVariantFormData } from '../hooks/useProductVariantEditForm';

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeProfitMetrics(price: number, cost: number | null): {
  profit: number | null;
  marginPercent: number | null;
} {
  if (cost === null) return { profit: null, marginPercent: null };
  const profit = Math.max(0, price - cost);
  const marginPercent =
    price > 0 ? Math.min(100, Math.max(0, (profit / price) * 100)) : 0;
  return { profit, marginPercent };
}

export type VariantUpdatePayload = {
  sku: string;
  barcode: string | null;
  outOfStockContinueSelling: boolean;
  isInventoryTrackingEnabled: boolean;
  isPhysicalProduct: boolean;
  price: number;
  compareAtPrice: number | null;
  cost: number | null;
  profit: number | null;
  marginPercent: number | null;
  chargeTax: boolean;
  unitPriceTotalAmount: number | null;
  unitPriceTotalAmountMetric: string | null;
  unitPriceBaseMeasure: number | null;
  unitPriceBaseMeasureMetric: string | null;
  package: string | null;
  weightValue: number;
  weightUnit: string;
  countryOfOrigin: string | null;
  hsCode: string | null;
  images: string[];
};

export function buildVariantUpdatePayload(
  formData: ProductVariantFormData,
  mediaUrls: string[]
): VariantUpdatePayload {
  const price = parseFloat(formData.price) || 0;
  const cost = parseOptionalNumber(formData.cost);
  const { profit, marginPercent } = computeProfitMetrics(price, cost);
  const isPhysical = formData.isPhysicalProduct;

  return {
    sku: formData.sku.trim(),
    barcode: formData.barcode.trim() || null,
    outOfStockContinueSelling: formData.outOfStockContinueSelling,
    isInventoryTrackingEnabled: formData.inventoryTrackingEnabled,
    isPhysicalProduct: isPhysical,
    price,
    compareAtPrice: parseOptionalNumber(formData.compareAtPrice),
    cost,
    profit,
    marginPercent,
    chargeTax: formData.chargeTaxOnProduct,
    unitPriceTotalAmount: parseOptionalNumber(formData.unitPriceTotalAmount),
    unitPriceTotalAmountMetric: formData.selectedUnit.trim() || null,
    unitPriceBaseMeasure: parseOptionalNumber(formData.unitPriceBaseMeasure),
    unitPriceBaseMeasureMetric: formData.selectedBaseMeasureUnit.trim() || null,
    package: isPhysical && formData.selectedPackage.trim() ? formData.selectedPackage.trim() : null,
    weightValue: isPhysical ? parseFloat(formData.productWeight) || 0 : 0,
    weightUnit: formData.weightUnit || 'kg',
    countryOfOrigin: isPhysical ? formData.countryOfOrigin.trim() || null : null,
    hsCode: isPhysical ? formData.hsCode.trim() || null : null,
    images: mediaUrls,
  };
}
