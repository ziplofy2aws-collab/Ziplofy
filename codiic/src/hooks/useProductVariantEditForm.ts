import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { type ProductVariant, useProductVariants } from '../contexts/product-variant.context';
import { useStore } from '../contexts/store.context';
import { getProductApiErrorMessage } from '../utils/product-api-error.util';
import { buildVariantUpdatePayload } from '../utils/variant-update-payload.util';
import { useProductMediaUrls } from './useProductMediaUrls';

export type ProductVariantFormData = {
  sku: string;
  barcode: string;
  outOfStockContinueSelling: boolean;
  inventoryTrackingEnabled: boolean;
  isPhysicalProduct: boolean;
  price: string;
  compareAtPrice: string;
  unitPriceTotalAmount: string;
  unitPriceBaseMeasure: string;
  selectedUnit: string;
  selectedBaseMeasureUnit: string;
  chargeTaxOnProduct: boolean;
  cost: string;
  selectedPackage: string;
  productWeight: string;
  weightUnit: string;
  countryOfOrigin: string;
  hsCode: string;
};

type VariantEditSnapshot = {
  formData: ProductVariantFormData;
  mediaUrls: string[];
};

function variantToFormData(variant: ProductVariant): ProductVariantFormData {
  const packageId =
    variant.package && typeof variant.package === 'object'
      ? variant.package._id
      : typeof variant.package === 'string'
        ? variant.package
        : '';

  return {
    sku: variant.sku || '',
    barcode: variant.barcode || '',
    outOfStockContinueSelling: Boolean(variant.outOfStockContinueSelling),
    inventoryTrackingEnabled: Boolean(variant.isInventoryTrackingEnabled),
    isPhysicalProduct: variant.isPhysicalProduct !== false,
    price: variant.price != null ? String(variant.price) : '',
    compareAtPrice: variant.compareAtPrice != null ? String(variant.compareAtPrice) : '',
    unitPriceTotalAmount:
      variant.unitPriceTotalAmount != null ? String(variant.unitPriceTotalAmount) : '',
    unitPriceBaseMeasure:
      variant.unitPriceBaseMeasure != null ? String(variant.unitPriceBaseMeasure) : '',
    selectedUnit: variant.unitPriceTotalAmountMetric || '',
    selectedBaseMeasureUnit: variant.unitPriceBaseMeasureMetric || '',
    chargeTaxOnProduct: Boolean(variant.chargeTax),
    cost: variant.cost != null ? String(variant.cost) : '',
    selectedPackage: packageId,
    productWeight: variant.weightValue != null ? String(variant.weightValue) : '',
    weightUnit: variant.weightUnit || 'kg',
    countryOfOrigin: variant.countryOfOrigin || '',
    hsCode: variant.hsCode || '',
  };
}

function buildSnapshot(formData: ProductVariantFormData, mediaUrls: string[]): VariantEditSnapshot {
  return { formData, mediaUrls };
}

export function getVariantDisplayTitle(variant: ProductVariant): string {
  const values = Object.values(variant.optionValues || {}).filter(Boolean);
  if (values.length > 0) return values.join(' / ');
  return variant.sku || 'Variant';
}

export function useProductVariantEditForm(variant: ProductVariant) {
  const { updateVariant } = useProductVariants();
  const { activeStoreId } = useStore();

  const [formData, setFormData] = useState<ProductVariantFormData>(() => variantToFormData(variant));
  const [displayVariant, setDisplayVariant] = useState<ProductVariant>(variant);
  const {
    mediaUrls,
    displayImages,
    addImageUrl,
    removeImage,
    resetMediaUrls,
  } = useProductMediaUrls(variant.images || [], variant._id);
  const [isSaving, setIsSaving] = useState(false);
  const initialSnapshotRef = useRef<VariantEditSnapshot>(
    buildSnapshot(variantToFormData(variant), variant.images || [])
  );

  useEffect(() => {
    const nextForm = variantToFormData(variant);
    const nextUrls = variant.images || [];
    setFormData(nextForm);
    setDisplayVariant(variant);
    resetMediaUrls(nextUrls);
    initialSnapshotRef.current = buildSnapshot(nextForm, nextUrls);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when navigating to another variant
  }, [variant._id, resetMediaUrls]);

  const isDirty = useMemo(() => {
    const current = buildSnapshot(formData, mediaUrls);
    return JSON.stringify(current) !== JSON.stringify(initialSnapshotRef.current);
  }, [formData, mediaUrls]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    const nextForm = variantToFormData(displayVariant);
    const nextUrls = displayVariant.images || [];
    setFormData(nextForm);
    resetMediaUrls(nextUrls);
    initialSnapshotRef.current = buildSnapshot(nextForm, nextUrls);
  }, [displayVariant, resetMediaUrls]);

  const handleSave = useCallback(async () => {
    const sku = formData.sku.trim();
    if (!sku) {
      toast.error('SKU is required');
      return;
    }

    const priceTrimmed = formData.price.trim();
    if (!priceTrimmed) {
      toast.error('Product price is required');
      return;
    }
    const parsedPrice = parseFloat(priceTrimmed);
    if (!Number.isFinite(parsedPrice)) {
      toast.error('Enter a valid product price');
      return;
    }
    if (parsedPrice < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    if (
      formData.isPhysicalProduct &&
      formData.hsCode.trim() !== '' &&
      !/^\d{6}$/.test(formData.hsCode.trim())
    ) {
      toast.error('HS code must be exactly 6 digits');
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildVariantUpdatePayload({ ...formData, sku }, mediaUrls);
      const updated = await updateVariant(variant._id, payload);

      const nextUrls = updated.images || mediaUrls;
      const nextForm = variantToFormData(updated);
      setFormData(nextForm);
      setDisplayVariant(updated);
      resetMediaUrls(nextUrls);
      initialSnapshotRef.current = buildSnapshot(nextForm, nextUrls);
      toast.success('Variant saved');
    } catch (error: unknown) {
      toast.error(getProductApiErrorMessage(error, 'Failed to save variant'));
    } finally {
      setIsSaving(false);
    }
  }, [formData, mediaUrls, resetMediaUrls, updateVariant, variant._id]);

  return {
    activeStoreId,
    formData,
    displayVariant,
    displayImages,
    handleInputChange,
    handleSave,
    resetForm,
    isSaving,
    isDirty,
    addImageUrl,
    removeImage,
  };
}
