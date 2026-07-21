import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { defaultContentFilesFolder, useStoreCloudStorage } from '../contexts/store-cloud-storage.context';
import { useCategories } from '../contexts/category.context';
import { type Product, useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import { uploadDescriptionImagesToCloudStorage, useProductMediaUrls } from './useProductMediaUrls';
import {
  descriptionHasPendingLocalImages,
  isDescriptionWithinMaxLength,
  sanitizeProductDescriptionHtml,
} from '../utils/product-description-html.util';

export type NewProductFormData = {
  title: string;
  category: string;
  description: string;
  status: 'draft' | 'active';
  productType: string;
  vendor: string;
  tags: string[];
  price: string;
  compareAtPrice: string;
  unitPriceTotalAmount: string;
  unitPriceBaseMeasure: string;
  selectedUnit: string;
  selectedBaseMeasureUnit: string;
  chargeTaxOnProduct: boolean;
  cost: string;
  inventoryTrackingEnabled: boolean;
  quantity: string;
  sku: string;
  barcode: string;
  continueSellingWhenOutOfStock: boolean;
  physicalProduct: boolean;
  selectedPackage: string;
  productWeight: string;
  weightUnit: string;
  countryOfOrigin: string;
  hsCode: string;
  variants: Array<{ optionName: string; values: string[] }>;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  images: string[];
};

export const INITIAL_NEW_PRODUCT_FORM_DATA: NewProductFormData = {
  title: '',
  category: '',
  description: '',
  status: 'draft',
  productType: '',
  vendor: '',
  tags: [],
  price: '',
  compareAtPrice: '',
  unitPriceTotalAmount: '',
  unitPriceBaseMeasure: '',
  selectedUnit: '',
  selectedBaseMeasureUnit: '',
  chargeTaxOnProduct: false,
  cost: '',
  inventoryTrackingEnabled: false,
  quantity: '',
  sku: '',
  barcode: '',
  continueSellingWhenOutOfStock: false,
  physicalProduct: false,
  selectedPackage: '',
  productWeight: '',
  weightUnit: 'kg',
  countryOfOrigin: '',
  hsCode: '',
  variants: [],
  pageTitle: '',
  metaDescription: '',
  urlHandle: '',
  images: [],
};

type UseNewProductFormOptions = {
  onSuccess?: (product: Product) => void;
  navigateOnSuccess?: boolean;
  transformBeforeSubmit?: (data: NewProductFormData) => NewProductFormData;
};

export function useNewProductForm(options: UseNewProductFormOptions = {}) {
  const { onSuccess, navigateOnSuccess = true, transformBeforeSubmit } = options;
  const { fetchBaseCategories } = useCategories();
  const { createProduct, loading: productLoading } = useProducts();
  const { activeStoreId } = useStore();
  const { uploadFileForStore } = useStoreCloudStorage();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mediaUrls, displayImages, addImageUrl, removeImage, resetMediaUrls } = useProductMediaUrls();
  const [formData, setFormData] = useState<NewProductFormData>(INITIAL_NEW_PRODUCT_FORM_DATA);

  useEffect(() => {
    fetchBaseCategories();
  }, [fetchBaseCategories]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const getErrorMessage = useCallback((error: unknown): string => {
    const err = error as {
      response?: { data?: { message?: string; error?: string; details?: { message?: string }; errors?: unknown[]; data?: { message?: string } } };
      message?: string;
    };
    const apiMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.details?.message ||
      err?.response?.data?.data?.message;

    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;

    const errors = err?.response?.data?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];
      if (typeof firstError === 'string') return firstError;
      if (typeof (firstError as { message?: string })?.message === 'string') {
        return (firstError as { message: string }).message;
      }
    }

    if (typeof err?.message === 'string' && err.message.trim()) return err.message;
    return 'Failed to create product';
  }, []);

  const stripHtml = useCallback((html: string): string => {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }, []);

  const slugify = useCallback((input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const uploadDescriptionImages = useCallback(
    async (descriptionHtml: string): Promise<string> => {
      if (!activeStoreId) {
        throw new Error('Select a store before saving description images');
      }
      return uploadDescriptionImagesToCloudStorage(descriptionHtml, activeStoreId, (storeId, file, options) =>
        uploadFileForStore(storeId, file, {
          folder: options?.folder ?? defaultContentFilesFolder(storeId),
        }).then((r) => ({ objectUrl: r.objectUrl }))
      );
    },
    [activeStoreId, uploadFileForStore]
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_NEW_PRODUCT_FORM_DATA);
    resetMediaUrls([]);
  }, [resetMediaUrls]);

  const handleSubmit = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('Please select a store first');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!mediaUrls.length) {
      toast.error('Add at least one product image');
      return;
    }

    if (formData.physicalProduct && formData.hsCode.trim() !== '' && !/^\d{6}$/.test(formData.hsCode.trim())) {
      toast.error('HS code must be exactly 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveFormData = transformBeforeSubmit ? transformBeforeSubmit(formData) : formData;

      if (descriptionHasPendingLocalImages(effectiveFormData.description)) {
        toast.error('Some description images are still uploading. Try again in a moment.');
        return;
      }

      let descriptionWithUploadedImages = await uploadDescriptionImages(effectiveFormData.description);
      descriptionWithUploadedImages = sanitizeProductDescriptionHtml(descriptionWithUploadedImages);

      if (!isDescriptionWithinMaxLength(descriptionWithUploadedImages)) {
        toast.error('Description is too long (max 5000 characters)');
        return;
      }

      const price = parseFloat(effectiveFormData.price) || 0;
      const cost = parseFloat(effectiveFormData.cost) || 0;
      const profit = Math.max(0, price - cost);
      const marginPercent = price > 0 ? Math.min(100, Math.max(0, (profit / price) * 100)) : 0;

      const descriptionPlainText = stripHtml(descriptionWithUploadedImages);
      const safePageTitle = (effectiveFormData.pageTitle || '').trim() || (effectiveFormData.title || '').trim();
      const safeMetaDescription =
        (effectiveFormData.metaDescription || '').trim() || descriptionPlainText.slice(0, 240);
      const safeUrlHandle =
        (effectiveFormData.urlHandle || '').trim() ||
        slugify((effectiveFormData.title || '').trim()) ||
        `product-${Date.now()}`;

      const requestBody = {
        title: effectiveFormData.title,
        description: descriptionWithUploadedImages,
        category: effectiveFormData.category,
        price,
        compareAtPrice: effectiveFormData.compareAtPrice ? parseFloat(effectiveFormData.compareAtPrice) : undefined,
        chargeTax: effectiveFormData.chargeTaxOnProduct,
        cost,
        profit,
        marginPercent,
        storeId: activeStoreId,
        unitPriceTotalAmount: effectiveFormData.unitPriceTotalAmount
          ? parseFloat(effectiveFormData.unitPriceTotalAmount)
          : undefined,
        unitPriceTotalAmountMetric: effectiveFormData.selectedUnit || undefined,
        unitPriceBaseMeasure: effectiveFormData.unitPriceBaseMeasure
          ? parseFloat(effectiveFormData.unitPriceBaseMeasure)
          : undefined,
        unitPriceBaseMeasureMetric: effectiveFormData.selectedBaseMeasureUnit || undefined,
        inventoryTrackingEnabled: effectiveFormData.inventoryTrackingEnabled,
        continueSellingWhenOutOfStock: effectiveFormData.continueSellingWhenOutOfStock,
        sku: effectiveFormData.sku,
        barcode: effectiveFormData.barcode,
        isPhysicalProduct: effectiveFormData.physicalProduct,
        package: effectiveFormData.physicalProduct ? effectiveFormData.selectedPackage : undefined,
        productWeight: effectiveFormData.physicalProduct ? parseFloat(effectiveFormData.productWeight) : undefined,
        productWeightUnit: effectiveFormData.physicalProduct ? effectiveFormData.weightUnit : undefined,
        countryOfOrigin: effectiveFormData.physicalProduct ? effectiveFormData.countryOfOrigin : undefined,
        harmonizedSystemCode: effectiveFormData.physicalProduct ? effectiveFormData.hsCode : undefined,
        variants: effectiveFormData.variants,
        pageTitle: safePageTitle,
        metaDescription: safeMetaDescription,
        urlHandle: safeUrlHandle,
        status: effectiveFormData.status,
        onlineStorePublishing: true,
        pointOfSalePublishing: false,
        images: mediaUrls,
        productType: effectiveFormData.productType,
        vendor: effectiveFormData.vendor,
        tagIds: effectiveFormData.tags || [],
      };

      const created = await createProduct(requestBody);
      resetForm();

      if (onSuccess) {
        onSuccess(created);
      } else if (navigateOnSuccess && created._id) {
        navigate(`/products/${created._id}`, { state: { productJustCreated: true } });
      }
    } catch (error: unknown) {
      console.error('Error creating product:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeStoreId,
    createProduct,
    formData,
    getErrorMessage,
    navigate,
    navigateOnSuccess,
    onSuccess,
    resetForm,
    mediaUrls,
    slugify,
    stripHtml,
    transformBeforeSubmit,
    uploadDescriptionImages,
  ]);

  const addVariant = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { optionName: '', values: [''] }],
    }));
  }, []);

  const removeVariant = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }, []);

  const updateVariantOptionName = useCallback((index: number, optionName: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => (i === index ? { ...variant, optionName } : variant)),
    }));
  }, []);

  const addVariantValue = useCallback((variantIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex ? { ...variant, values: [...variant.values, ''] } : variant
      ),
    }));
  }, []);

  const removeVariantValue = useCallback((variantIndex: number, valueIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex
          ? { ...variant, values: variant.values.filter((_, j) => j !== valueIndex) }
          : variant
      ),
    }));
  }, []);

  const updateVariantValue = useCallback((variantIndex: number, valueIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex
          ? { ...variant, values: variant.values.map((v, j) => (j === valueIndex ? value : v)) }
          : variant
      ),
    }));
  }, []);

  return {
    activeStoreId,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    productLoading,
    displayImages,
    addImageUrl,
    removeImage,
    addVariant,
    removeVariant,
    updateVariantOptionName,
    addVariantValue,
    removeVariantValue,
    updateVariantValue,
  };
}
