import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { defaultContentFilesFolder, useStoreCloudStorage } from '../contexts/store-cloud-storage.context';
import { useCategories } from '../contexts/category.context';
import { type Product, useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import { uploadDescriptionImagesToCloudStorage, useProductMediaUrls } from './useProductMediaUrls';
import { getProductApiErrorMessage } from '../utils/product-api-error.util';
import {
  descriptionHasPendingLocalImages,
  isDescriptionWithinMaxLength,
  sanitizeProductDescriptionHtml,
} from '../utils/product-description-html.util';
import { plainTextFromHtml } from '../seo/seo-text.util';

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
  /** Initial on-hand / available stock per location id */
  locationQuantities: Record<string, string>;
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
  locationQuantities: {},
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

    const title = formData.title.trim();
    if (!title) {
      toast.error('Product title is required');
      return;
    }
    if (title.length < 2) {
      toast.error('Product title must be at least 2 characters');
      return;
    }

    const descriptionPlain = plainTextFromHtml(formData.description);
    if (!descriptionPlain) {
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

      const descriptionPlainText = plainTextFromHtml(descriptionWithUploadedImages);
      const trimmedTitle = (effectiveFormData.title || '').trim();
      const safePageTitle = (effectiveFormData.pageTitle || '').trim() || trimmedTitle;
      const derivedMeta = descriptionPlainText.slice(0, 240);
      const safeMetaDescription =
        (effectiveFormData.metaDescription || '').trim() ||
        (derivedMeta.length >= 10
          ? derivedMeta
          : `${derivedMeta}${derivedMeta ? ' ' : ''}${trimmedTitle} product`.trim().slice(0, 500));
      const safeUrlHandle =
        (effectiveFormData.urlHandle || '').trim() ||
        slugify(trimmedTitle) ||
        `product-${Date.now()}`;

      const locationQuantities = Object.entries(effectiveFormData.locationQuantities || {}).map(
        ([locationId, raw]) => ({
          locationId,
          quantity: Math.max(0, parseInt(String(raw).trim() || '0', 10) || 0),
        })
      );
      const hasLocationStock = locationQuantities.some((entry) => entry.quantity > 0);

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
        inventoryTrackingEnabled:
          effectiveFormData.inventoryTrackingEnabled || hasLocationStock,
        continueSellingWhenOutOfStock: effectiveFormData.continueSellingWhenOutOfStock,
        sku: effectiveFormData.sku,
        barcode: effectiveFormData.barcode,
        isPhysicalProduct: effectiveFormData.physicalProduct,
        package:
          effectiveFormData.physicalProduct && effectiveFormData.selectedPackage.trim()
            ? effectiveFormData.selectedPackage.trim()
            : undefined,
        productWeight: effectiveFormData.physicalProduct ? parseFloat(effectiveFormData.productWeight) : undefined,
        productWeightUnit: effectiveFormData.physicalProduct ? effectiveFormData.weightUnit : undefined,
        countryOfOrigin:
          effectiveFormData.physicalProduct && effectiveFormData.countryOfOrigin.trim()
            ? effectiveFormData.countryOfOrigin.trim()
            : undefined,
        harmonizedSystemCode:
          effectiveFormData.physicalProduct && effectiveFormData.hsCode.trim()
            ? effectiveFormData.hsCode.trim()
            : undefined,
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
        locationQuantities,
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
      toast.error(getProductApiErrorMessage(error, 'Failed to create product'));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeStoreId,
    createProduct,
    formData,
    navigate,
    navigateOnSuccess,
    onSuccess,
    resetForm,
    mediaUrls,
    slugify,
    transformBeforeSubmit,
    uploadDescriptionImages,
  ]);

  const setLocationQuantity = useCallback((locationId: string, quantity: string) => {
    setFormData((prev) => ({
      ...prev,
      locationQuantities: {
        ...prev.locationQuantities,
        [locationId]: quantity,
      },
    }));
  }, []);

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

  const setVariantValues = useCallback((variantIndex: number, values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex
          ? { ...variant, values: values.length > 0 ? values : [''] }
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
    setVariantValues,
    setLocationQuantity,
  };
}
