import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAwsUpload } from '../contexts/aws-upload.context';
import { useCategories } from '../contexts/category.context';
import { type Product, useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';

export type SelectedProductImage = {
  file: File;
  previewUrl: string;
};

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
};

export function useNewProductForm(options: UseNewProductFormOptions = {}) {
  const { onSuccess, navigateOnSuccess = true } = options;
  const { fetchBaseCategories } = useCategories();
  const { createProduct, loading: productLoading } = useProducts();
  const { activeStoreId } = useStore();
  const { uploadImageWithSignedUrl } = useAwsUpload();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedProductImage[]>([]);
  const selectedImagesRef = useRef<SelectedProductImage[]>([]);
  const [formData, setFormData] = useState<NewProductFormData>(INITIAL_NEW_PRODUCT_FORM_DATA);

  useEffect(() => {
    fetchBaseCategories();
  }, [fetchBaseCategories]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

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

  const dataUrlToFile = useCallback((dataUrl: string, fallbackName: string): File | null => {
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;
    const mimeType = match[1];
    const base64Data = match[2];
    const binary = window.atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const extension = mimeType.split('/')[1] || 'png';
    return new File([bytes], `${fallbackName}.${extension}`, { type: mimeType });
  }, []);

  const uploadDescriptionImages = useCallback(
    async (descriptionHtml: string): Promise<string> => {
      if (!descriptionHtml.trim()) return descriptionHtml;

      const parser = new DOMParser();
      const doc = parser.parseFromString(descriptionHtml, 'text/html');
      const imageNodes = Array.from(doc.querySelectorAll('img[src]'));
      const localImages = imageNodes.filter((img) => {
        const src = img.getAttribute('src') || '';
        return src.startsWith('data:image/');
      });

      if (!localImages.length) return descriptionHtml;

      const uploadToastId = toast.loading(
        `Uploading ${localImages.length} description image${localImages.length > 1 ? 's' : ''}...`
      );

      try {
        await Promise.all(
          localImages.map(async (img, index) => {
            const src = img.getAttribute('src') || '';
            const file = dataUrlToFile(src, `description-image-${index + 1}`);
            if (!file) return;
            const uploaded = await uploadImageWithSignedUrl(file, {
              folder: `${activeStoreId}/product-description-image`,
            });
            img.setAttribute('src', uploaded.objectUrl);
          })
        );
        toast.success('Description images uploaded', { id: uploadToastId });
        return doc.body.innerHTML;
      } catch {
        toast.error('Failed to upload one or more description images', { id: uploadToastId });
        throw new Error('Failed to upload description images');
      }
    },
    [activeStoreId, dataUrlToFile, uploadImageWithSignedUrl]
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_NEW_PRODUCT_FORM_DATA);
    setSelectedImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('Please select a store first');
      return;
    }

    if (formData.physicalProduct && formData.hsCode.trim() !== '' && !/^\d{6}$/.test(formData.hsCode.trim())) {
      toast.error('HS code must be exactly 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      const descriptionWithUploadedImages = await uploadDescriptionImages(formData.description);

      let uploadedImageUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadToastId = toast.loading(
          `Uploading ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}...`
        );
        const uploadedImages = await Promise.all(
          selectedImages.map((image) =>
            uploadImageWithSignedUrl(image.file, { folder: `${activeStoreId}/product-image` })
          )
        );
        uploadedImageUrls = uploadedImages.map((image) => image.objectUrl);
        toast.success('Images uploaded', { id: uploadToastId });
      }

      const price = parseFloat(formData.price) || 0;
      const cost = parseFloat(formData.cost) || 0;
      const profit = price - cost;
      const marginPercent = price > 0 ? (profit / price) * 100 : 0;

      const descriptionPlainText = stripHtml(descriptionWithUploadedImages);
      const safePageTitle = (formData.pageTitle || '').trim() || (formData.title || '').trim();
      const safeMetaDescription =
        (formData.metaDescription || '').trim() || descriptionPlainText.slice(0, 240);
      const safeUrlHandle =
        (formData.urlHandle || '').trim() ||
        slugify((formData.title || '').trim()) ||
        `product-${Date.now()}`;

      const requestBody = {
        title: formData.title,
        description: descriptionWithUploadedImages,
        category: formData.category,
        price,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        chargeTax: formData.chargeTaxOnProduct,
        cost,
        profit,
        marginPercent,
        storeId: activeStoreId,
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
        package: formData.physicalProduct ? formData.selectedPackage : undefined,
        productWeight: formData.physicalProduct ? parseFloat(formData.productWeight) : undefined,
        productWeightUnit: formData.physicalProduct ? formData.weightUnit : undefined,
        countryOfOrigin: formData.physicalProduct ? formData.countryOfOrigin : undefined,
        harmonizedSystemCode: formData.physicalProduct ? formData.hsCode : undefined,
        variants: formData.variants,
        pageTitle: safePageTitle,
        metaDescription: safeMetaDescription,
        urlHandle: safeUrlHandle,
        status: formData.status,
        onlineStorePublishing: true,
        pointOfSalePublishing: false,
        images: uploadedImageUrls,
        productType: formData.productType,
        vendor: formData.vendor,
        tagIds: formData.tags || [],
      };

      const created = await createProduct(requestBody);
      toast.success('Product created successfully');
      resetForm();

      if (onSuccess) {
        onSuccess(created);
      } else if (navigateOnSuccess) {
        setTimeout(() => navigate('/products'), 800);
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
    selectedImages,
    slugify,
    stripHtml,
    uploadDescriptionImages,
    uploadImageWithSignedUrl,
  ]);

  const addImageFiles = useCallback((files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    const rejectedFilesCount = files.length - validFiles.length;
    if (rejectedFilesCount > 0) {
      toast.error(`Skipped ${rejectedFilesCount} non-image file${rejectedFilesCount > 1 ? 's' : ''}`);
    }
    if (!validFiles.length) return;
    setSelectedImages((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev[index];
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
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

  return {
    activeStoreId,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    productLoading,
    selectedImages,
    addImageFiles,
    removeImage,
    addVariant,
    removeVariant,
    updateVariantOptionName,
    addVariantValue,
    removeVariantValue,
    updateVariantValue,
  };
}
