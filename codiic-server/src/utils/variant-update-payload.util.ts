import mongoose from "mongoose";
import { CustomError } from "../utils/error.utils";

const VARIANT_UPDATE_FIELDS = [
  "sku",
  "barcode",
  "price",
  "compareAtPrice",
  "cost",
  "profit",
  "marginPercent",
  "unitPriceTotalAmount",
  "unitPriceTotalAmountMetric",
  "unitPriceBaseMeasure",
  "unitPriceBaseMeasureMetric",
  "chargeTax",
  "weightValue",
  "weightUnit",
  "package",
  "countryOfOrigin",
  "hsCode",
  "images",
  "outOfStockContinueSelling",
  "isInventoryTrackingEnabled",
  "isPhysicalProduct",
] as const;

const UNIT_METRICS = new Set([
  "milligram",
  "gram",
  "kilogram",
  "milliliter",
  "centiliter",
  "liter",
  "cubic_meter",
  "centimeter",
  "meter",
  "square_meter",
  "item",
]);

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseRequiredNumber(value: unknown, emptyMessage: string, invalidMessage: string): number {
  if (value === undefined || value === null || value === "") {
    throw new CustomError(emptyMessage, 400);
  }
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) throw new CustomError(invalidMessage, 400);
  return num;
}

function parseOptionalNumber(
  value: unknown,
  invalidMessage: string
): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) throw new CustomError(invalidMessage, 400);
  return num;
}

function normalizeWeightUnit(value: unknown): string {
  const unit = asTrimmedString(value) || "kg";
  if (unit === "grams") return "g";
  return unit;
}

function normalizeOptionalMetric(value: unknown, fieldLabel: string): string | null {
  const metric = asTrimmedString(value);
  if (!metric) return null;
  if (!UNIT_METRICS.has(metric)) {
    throw new CustomError(`Select a valid ${fieldLabel}`, 400);
  }
  return metric;
}

/**
 * Build a validated partial update for a product variant.
 * Throws CustomError with merchant-friendly messages.
 */
export function buildVariantUpdatePayload(body: Record<string, unknown>): Record<string, unknown> {
  const updatePayload: Record<string, unknown> = {};

  for (const field of VARIANT_UPDATE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    updatePayload[field] = body[field];
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "sku")) {
    const sku = asTrimmedString(updatePayload.sku);
    if (!sku) throw new CustomError("SKU is required", 400);
    if (sku.length > 100) throw new CustomError("SKU cannot exceed 100 characters", 400);
    updatePayload.sku = sku;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "barcode")) {
    const barcode = asTrimmedString(updatePayload.barcode);
    if (barcode.length > 100) {
      throw new CustomError("Barcode cannot exceed 100 characters", 400);
    }
    updatePayload.barcode = barcode || null;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "price")) {
    const price = parseRequiredNumber(
      updatePayload.price,
      "Variant price is required",
      "Enter a valid variant price"
    );
    if (price < 0) throw new CustomError("Price cannot be negative", 400);
    updatePayload.price = price;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "compareAtPrice")) {
    const compareAtPrice = parseOptionalNumber(
      updatePayload.compareAtPrice,
      "Enter a valid compare-at price"
    );
    if (compareAtPrice !== null && compareAtPrice < 0) {
      throw new CustomError("Compare-at price cannot be negative", 400);
    }
    updatePayload.compareAtPrice = compareAtPrice;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "cost")) {
    const cost = parseOptionalNumber(updatePayload.cost, "Enter a valid cost");
    if (cost !== null && cost < 0) throw new CustomError("Cost cannot be negative", 400);
    updatePayload.cost = cost;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "profit")) {
    updatePayload.profit = parseOptionalNumber(updatePayload.profit, "Enter a valid profit");
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "marginPercent")) {
    const margin = parseOptionalNumber(
      updatePayload.marginPercent,
      "Enter a valid margin percent"
    );
    if (margin !== null && (margin < 0 || margin > 100)) {
      throw new CustomError("Margin percent must be between 0 and 100", 400);
    }
    updatePayload.marginPercent = margin;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "unitPriceTotalAmount")) {
    const amount = parseOptionalNumber(
      updatePayload.unitPriceTotalAmount,
      "Enter a valid unit price amount"
    );
    if (amount !== null && amount < 0) {
      throw new CustomError("Unit price amount cannot be negative", 400);
    }
    updatePayload.unitPriceTotalAmount = amount === null ? undefined : amount;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "unitPriceBaseMeasure")) {
    const amount = parseOptionalNumber(
      updatePayload.unitPriceBaseMeasure,
      "Enter a valid unit price base measure"
    );
    if (amount !== null && amount < 0) {
      throw new CustomError("Unit price base measure cannot be negative", 400);
    }
    updatePayload.unitPriceBaseMeasure = amount === null ? undefined : amount;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "unitPriceTotalAmountMetric")) {
    updatePayload.unitPriceTotalAmountMetric = normalizeOptionalMetric(
      updatePayload.unitPriceTotalAmountMetric,
      "unit for total amount"
    );
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "unitPriceBaseMeasureMetric")) {
    updatePayload.unitPriceBaseMeasureMetric = normalizeOptionalMetric(
      updatePayload.unitPriceBaseMeasureMetric,
      "unit for base measure"
    );
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "weightValue")) {
    const weight = parseOptionalNumber(updatePayload.weightValue, "Enter a valid product weight");
    if (weight !== null && weight < 0) {
      throw new CustomError("Product weight cannot be negative", 400);
    }
    updatePayload.weightValue = weight ?? 0;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "weightUnit")) {
    updatePayload.weightUnit = normalizeWeightUnit(updatePayload.weightUnit);
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "hsCode")) {
    const hsCode = asTrimmedString(updatePayload.hsCode);
    if (hsCode && !/^\d{6}$/.test(hsCode)) {
      throw new CustomError("HS code must be exactly 6 digits", 400);
    }
    updatePayload.hsCode = hsCode || null;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "countryOfOrigin")) {
    const country = asTrimmedString(updatePayload.countryOfOrigin);
    if (country.length > 100) {
      throw new CustomError("Country of origin cannot exceed 100 characters", 400);
    }
    updatePayload.countryOfOrigin = country || null;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "images")) {
    if (!Array.isArray(updatePayload.images)) {
      throw new CustomError("Variant images must be a list of image URLs", 400);
    }
    updatePayload.images = (updatePayload.images as unknown[])
      .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
      .map((url) => url.trim());
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "package")) {
    const pkg = updatePayload.package;
    if (pkg === null || pkg === undefined || pkg === "") {
      updatePayload.package = null;
    } else {
      const packageId = asTrimmedString(pkg);
      if (!packageId || !mongoose.Types.ObjectId.isValid(packageId)) {
        throw new CustomError(
          "Select a shipping package for this physical product. If none exist yet, add a package first.",
          400
        );
      }
      updatePayload.package = packageId;
    }
  }

  return updatePayload;
}

export { VARIANT_UPDATE_FIELDS };
