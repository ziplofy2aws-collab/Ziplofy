import type { Product } from '../contexts/product.context';
import type { CreateProductPayload } from '../contexts/product.context';
import { plainTextFromHtml, sanitizeUrlHandle, slugFromTitle } from '../seo/seo-text.util';

function uniqueSuffix(): string {
  return Date.now().toString(36).slice(-5);
}

function withCopySuffix(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (!trimmed) return `copy-${uniqueSuffix()}`.slice(0, maxLength);
  const suffix = `-copy-${uniqueSuffix()}`;
  const base = trimmed.slice(0, Math.max(1, maxLength - suffix.length));
  return `${base}${suffix}`;
}

function normalizeWeightUnit(unit?: string): string | undefined {
  if (!unit) return undefined;
  if (unit === 'grams') return 'g';
  return unit;
}

export function buildDuplicateProductPayload(
  product: Product,
  storeId: string
): CreateProductPayload {
  const suffix = uniqueSuffix();
  const baseTitle = product.title?.trim() || 'Untitled product';
  const duplicateTitle = `${baseTitle} (copy)`;
  const baseHandle = product.urlHandle?.trim() || slugFromTitle(baseTitle, 'product');
  const duplicateHandle = sanitizeUrlHandle(`${baseHandle}-copy-${suffix}`);
  const duplicateSku = withCopySuffix(product.sku || slugFromTitle(baseTitle, 'sku'), 100);
  const duplicateBarcode = withCopySuffix(product.barcode || duplicateSku, 100);

  const descriptionPlain = plainTextFromHtml(product.description || '');
  const description = product.description?.trim() || descriptionPlain || `${duplicateTitle}.`;

  const pageTitle = (product.pageTitle?.trim() || duplicateTitle).slice(0, 200);
  const metaDescription =
    (product.metaDescription?.trim() || `${duplicateTitle} — available now.`).slice(0, 500);

  const imageUrls = Array.isArray(product.imageUrls)
    ? product.imageUrls.filter((url) => typeof url === 'string' && url.trim().length > 0)
    : [];

  const categoryId = product.category?._id || '';
  const productTypeId = product.productType?._id || '';
  const vendorId = product.vendor?._id || '';

  if (!categoryId) {
    throw new Error('This product is missing a category. Add a category before duplicating.');
  }
  if (!productTypeId) {
    throw new Error('This product is missing a product type. Add a product type before duplicating.');
  }
  if (!vendorId) {
    throw new Error('This product is missing a vendor. Add a vendor before duplicating.');
  }
  if (imageUrls.length === 0) {
    throw new Error('This product has no images. Add at least one image before duplicating.');
  }

  const payload: CreateProductPayload = {
    title: duplicateTitle,
    description,
    category: categoryId,
    price: product.price ?? 0,
    compareAtPrice: product.compareAtPrice,
    chargeTax: Boolean(product.chargeTax),
    cost: product.cost ?? 0,
    profit: product.profit ?? 0,
    marginPercent: product.marginPercent ?? 0,
    storeId,
    unitPriceTotalAmount: product.unitPriceTotalAmount,
    unitPriceTotalAmountMetric: product.unitPriceTotalAmountMetric,
    unitPriceBaseMeasure: product.unitPriceBaseMeasure,
    unitPriceBaseMeasureMetric: product.unitPriceBaseMeasureMetric,
    inventoryTrackingEnabled: Boolean(product.inventoryTrackingEnabled),
    quantity: product.quantity,
    continueSellingWhenOutOfStock: Boolean(product.continueSellingWhenOutOfStock),
    sku: duplicateSku,
    barcode: duplicateBarcode,
    isPhysicalProduct: product.isPhysicalProduct !== false,
    package: product.package?._id,
    productWeight: product.productWeight,
    productWeightUnit: normalizeWeightUnit(product.productWeightUnit),
    countryOfOrigin: product.countryOfOrigin || undefined,
    harmonizedSystemCode: product.harmonizedSystemCode || undefined,
    variants: (product.variants || []).map((variant) => ({
      optionName: variant.optionName,
      values: [...variant.values],
    })),
    pageTitle: pageTitle.length >= 2 ? pageTitle : duplicateTitle.slice(0, 200),
    metaDescription: metaDescription.length >= 10 ? metaDescription : `${duplicateTitle} copy.`,
    urlHandle: duplicateHandle.length >= 2 ? duplicateHandle : `product-copy-${suffix}`,
    status: 'draft',
    onlineStorePublishing: Boolean(product.onlineStorePublishing),
    pointOfSalePublishing: Boolean(product.pointOfSalePublishing),
    imageUrls,
    images: imageUrls,
    productType: productTypeId,
    vendor: vendorId,
    tagIds: product.tagIds?.map((tag) => tag._id) || [],
  };

  return payload;
}
