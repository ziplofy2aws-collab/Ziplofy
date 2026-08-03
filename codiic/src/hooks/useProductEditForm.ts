import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { defaultContentFilesFolder, useStoreCloudStorage } from '../contexts/store-cloud-storage.context';
import { type Product, useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import {
  descriptionHasPendingLocalImages,
  isDescriptionWithinMaxLength,
  sanitizeProductDescriptionHtml,
} from '../utils/product-description-html.util';
import { getProductApiErrorMessage } from '../utils/product-api-error.util';
import {
  buildProductFormSnapshot,
  productFormSnapshotsEqual,
} from '../utils/product-form-snapshot.util';
import { plainTextFromHtml, sanitizeUrlHandle, slugFromTitle } from '../seo/seo-text.util';
import { type NewProductFormData } from './useNewProductForm';
import { uploadDescriptionImagesToCloudStorage, useProductMediaUrls } from './useProductMediaUrls';

function productToFormData(product: Product): NewProductFormData {
  return {
    title: product.title || '',
    description: product.description || '',
    category: product.category?._id || '',
    status: product.status || 'draft',
    productType: product.productType?._id || '',
    vendor: product.vendor?._id || '',
    tags: product.tagIds?.map((tag) => tag._id) || [],
    price: product.price != null ? String(product.price) : '',
    compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : '',
    unitPriceTotalAmount:
      product.unitPriceTotalAmount != null ? String(product.unitPriceTotalAmount) : '',
    unitPriceBaseMeasure:
      product.unitPriceBaseMeasure != null ? String(product.unitPriceBaseMeasure) : '',
    selectedUnit: product.unitPriceTotalAmountMetric || '',
    selectedBaseMeasureUnit: product.unitPriceBaseMeasureMetric || '',
    chargeTaxOnProduct: Boolean(product.chargeTax),
    cost: product.cost != null ? String(product.cost) : '',
    inventoryTrackingEnabled: Boolean(product.inventoryTrackingEnabled),
    quantity: product.quantity != null ? String(product.quantity) : '',
    sku: product.sku || '',
    barcode: product.barcode || '',
    continueSellingWhenOutOfStock: Boolean(product.continueSellingWhenOutOfStock),
    physicalProduct: product.isPhysicalProduct !== false,
    selectedPackage: product.package?._id || '',
    productWeight: product.productWeight != null ? String(product.productWeight) : '',
    weightUnit: product.productWeightUnit || 'kg',
    countryOfOrigin: product.countryOfOrigin || '',
    hsCode: product.harmonizedSystemCode || '',
    variants: [],
    pageTitle: product.pageTitle || '',
    metaDescription: product.metaDescription || '',
    urlHandle: product.urlHandle || '',
    images: [],
  };
}

export function useProductEditForm(product: Product) {
  const { updateProduct } = useProducts();
  const { activeStoreId } = useStore();
  const { uploadFileForStore } = useStoreCloudStorage();

  const [formData, setFormData] = useState<NewProductFormData>(() => productToFormData(product));
  const {
    mediaUrls,
    displayImages,
    addImageUrl,
    removeImage,
    resetMediaUrls,
  } = useProductMediaUrls(product.imageUrls || [], product._id);
  const [isSaving, setIsSaving] = useState(false);
  const initialSnapshotRef = useRef(
    buildProductFormSnapshot(productToFormData(product), product.imageUrls || [])
  );

  useEffect(() => {
    const nextForm = productToFormData(product);
    const nextUrls = product.imageUrls || [];
    setFormData(nextForm);
    resetMediaUrls(nextUrls);
    initialSnapshotRef.current = buildProductFormSnapshot(nextForm, nextUrls);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when navigating to another product
  }, [product._id, resetMediaUrls]);

  const isDirty = useMemo(() => {
    const current = buildProductFormSnapshot(formData, mediaUrls);
    return !productFormSnapshotsEqual(current, initialSnapshotRef.current);
  }, [formData, mediaUrls]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const uploadDescriptionImages = useCallback(
    async (descriptionHtml: string) => {
      const folderStoreId = activeStoreId || product.storeId;
      if (!folderStoreId) {
        throw new Error('Select a store before saving description images');
      }
      return uploadDescriptionImagesToCloudStorage(descriptionHtml, folderStoreId, (storeId, file, options) =>
        uploadFileForStore(storeId, file, {
          folder: options?.folder ?? defaultContentFilesFolder(storeId),
        }).then((r) => ({ objectUrl: r.objectUrl }))
      );
    },
    [activeStoreId, product.storeId, uploadFileForStore]
  );

  const handleSave = useCallback(async () => {
    const title = formData.title.trim();
    if (!title) {
      toast.error('Product title is required');
      return;
    }
    if (title.length < 2) {
      toast.error('Product title must be at least 2 characters');
      return;
    }

    if (!plainTextFromHtml(formData.description)) {
      toast.error('Product description is required');
      return;
    }

    if (!mediaUrls.length) {
      toast.error('Add at least one product image');
      return;
    }

    if (formData.price.trim() === '') {
      toast.error('Product price is required');
      return;
    }
    const parsedPrice = parseFloat(formData.price);
    if (Number.isNaN(parsedPrice)) {
      toast.error('Enter a valid product price');
      return;
    }
    if (parsedPrice < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    if (!formData.category.trim()) {
      toast.error('Product category is required');
      return;
    }

    if (!formData.productType.trim()) {
      toast.error('Product type is required');
      return;
    }

    if (!formData.vendor.trim()) {
      toast.error('Vendor is required');
      return;
    }

    if (formData.physicalProduct && !formData.selectedPackage.trim()) {
      toast.error(
        'Select a shipping package for this physical product. If none exist yet, add a package first.'
      );
      return;
    }

    if (formData.physicalProduct && formData.hsCode.trim() !== '' && !/^\d{6}$/.test(formData.hsCode.trim())) {
      toast.error('HS code must be exactly 6 digits');
      return;
    }

    if (descriptionHasPendingLocalImages(formData.description)) {
      toast.error('Some description images are still uploading. Save again in a moment.');
      return;
    }

    setIsSaving(true);
    try {
      let descriptionWithUploadedImages = await uploadDescriptionImages(formData.description || '');
      descriptionWithUploadedImages = sanitizeProductDescriptionHtml(descriptionWithUploadedImages);

      if (!isDescriptionWithinMaxLength(descriptionWithUploadedImages)) {
        toast.error('Description is too long (max 5000 characters)');
        return;
      }

      const price = parseFloat(formData.price) || 0;
      const cost = parseFloat(formData.cost) || 0;
      const profit = Math.max(0, price - cost);
      const marginPercent = price > 0 ? Math.min(100, Math.max(0, (profit / price) * 100)) : 0;

      const descriptionPlainText = plainTextFromHtml(descriptionWithUploadedImages);
      const trimmedTitle = formData.title.trim();
      const safePageTitle = formData.pageTitle.trim() || trimmedTitle;
      if (safePageTitle.length < 2) {
        toast.error('Page title must be at least 2 characters');
        return;
      }

      const derivedMeta = descriptionPlainText.slice(0, 240);
      const safeMetaDescription =
        formData.metaDescription.trim() ||
        (derivedMeta.length >= 10
          ? derivedMeta
          : `${derivedMeta}${derivedMeta ? ' ' : ''}${trimmedTitle} product`.trim().slice(0, 500));
      if (safeMetaDescription.length < 10) {
        toast.error('Meta description must be at least 10 characters');
        return;
      }

      const safeUrlHandle =
        sanitizeUrlHandle(formData.urlHandle.trim()) ||
        slugFromTitle(trimmedTitle, 'product') ||
        `product-${Date.now()}`;
      if (safeUrlHandle.length < 2) {
        toast.error('URL handle must be at least 2 characters');
        return;
      }
      if (!/^[a-z0-9-]+$/.test(safeUrlHandle)) {
        toast.error('URL handle can only contain lowercase letters, numbers, and hyphens');
        return;
      }

      const updated = await updateProduct(product._id, {
        title: trimmedTitle,
        description: descriptionWithUploadedImages,
        category: formData.category,
        price,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        chargeTax: formData.chargeTaxOnProduct,
        cost,
        profit,
        marginPercent,
        unitPriceTotalAmount: formData.unitPriceTotalAmount
          ? parseFloat(formData.unitPriceTotalAmount)
          : undefined,
        unitPriceTotalAmountMetric: formData.selectedUnit || undefined,
        unitPriceBaseMeasure: formData.unitPriceBaseMeasure
          ? parseFloat(formData.unitPriceBaseMeasure)
          : undefined,
        unitPriceBaseMeasureMetric: formData.selectedBaseMeasureUnit || undefined,
        inventoryTrackingEnabled: formData.inventoryTrackingEnabled,
        continueSellingWhenOutOfStock: formData.continueSellingWhenOutOfStock,
        sku: formData.sku,
        barcode: formData.barcode,
        isPhysicalProduct: formData.physicalProduct,
        package:
          formData.physicalProduct && formData.selectedPackage.trim()
            ? formData.selectedPackage.trim()
            : undefined,
        productWeight: formData.physicalProduct ? parseFloat(formData.productWeight) || 0 : undefined,
        productWeightUnit: formData.physicalProduct ? formData.weightUnit : undefined,
        countryOfOrigin: formData.physicalProduct ? formData.countryOfOrigin : undefined,
        harmonizedSystemCode: formData.physicalProduct ? formData.hsCode : undefined,
        pageTitle: safePageTitle,
        metaDescription: safeMetaDescription,
        urlHandle: safeUrlHandle,
        status: formData.status,
        imageUrls: mediaUrls,
        productType: formData.productType,
        vendor: formData.vendor,
        tagIds: formData.tags,
      });

      const nextUrls = updated.imageUrls || mediaUrls;
      const nextForm = productToFormData(updated);
      setFormData(nextForm);
      resetMediaUrls(nextUrls);
      initialSnapshotRef.current = buildProductFormSnapshot(nextForm, nextUrls);
      toast.success('Product saved');
    } catch (error: unknown) {
      toast.error(getProductApiErrorMessage(error, 'Failed to save product'));
    } finally {
      setIsSaving(false);
    }
  }, [
    formData,
    mediaUrls,
    product._id,
    resetMediaUrls,
    updateProduct,
    uploadDescriptionImages,
  ]);

  const resetForm = useCallback(() => {
    const nextForm = productToFormData(product);
    const nextUrls = product.imageUrls || [];
    setFormData(nextForm);
    resetMediaUrls(nextUrls);
    initialSnapshotRef.current = buildProductFormSnapshot(nextForm, nextUrls);
  }, [product, resetMediaUrls]);

  return {
    activeStoreId,
    formData,
    displayImages,
    handleInputChange,
    handleSave,
    isSaving,
    isDirty,
    addImageUrl,
    removeImage,
    resetForm,
  };
}
