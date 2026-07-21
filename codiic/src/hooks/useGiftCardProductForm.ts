import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  type CreateGiftCardProductRequest,
  type GiftCardProduct,
  type GiftCardProductStatus,
  useGiftCardProducts,
} from '../contexts/gift-card-products.context';
import { useStore } from '../contexts/store.context';
import { useProductMediaUrls } from './useProductMediaUrls';

export type GiftCardProductFormData = {
  title: string;
  description: string;
  status: GiftCardProductStatus;
  productType: string;
  vendor: string;
  tags: string[];
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
};

const INITIAL_FORM_DATA: GiftCardProductFormData = {
  title: '',
  description: '',
  status: 'active',
  productType: '',
  vendor: '',
  tags: [],
  pageTitle: '',
  metaDescription: '',
  urlHandle: '',
};

type UseGiftCardProductFormOptions = {
  onSuccess?: (product: GiftCardProduct) => void;
};

export function useGiftCardProductForm(options: UseGiftCardProductFormOptions = {}) {
  const { onSuccess } = options;
  const { activeStoreId, stores } = useStore();
  const { createGiftCardProduct, loading } = useGiftCardProducts();
  const { mediaUrls, displayImages, addImageUrl, removeImage, resetMediaUrls } = useProductMediaUrls();

  const [formData, setFormData] = useState<GiftCardProductFormData>(INITIAL_FORM_DATA);
  const [denominations, setDenominations] = useState<string[]>(['10.00', '25.00', '50.00', '100.00']);
  const [redemptionScope, setRedemptionScope] = useState<'all' | 'store'>('all');
  const [themeTemplate, setThemeTemplate] = useState('default-product');
  const [giftCardTemplate, setGiftCardTemplate] = useState('gift_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const activeStore = stores.find((store) => store._id === activeStoreId) ?? null;

  useEffect(() => {
    if (!activeStore || initialized) return;
    setFormData((prev) => ({
      ...prev,
      title: `${activeStore.storeName} gift card`,
      status: 'active',
    }));
    setInitialized(true);
  }, [activeStore, initialized]);

  const handleInputChange = useCallback((field: keyof GiftCardProductFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const slugify = useCallback((input: string) => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('Please select a store first');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const parsedDenominations = denominations
      .map((value) => parseFloat(value))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (!parsedDenominations.length) {
      toast.error('Add at least one valid denomination');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateGiftCardProductRequest = {
        storeId: activeStoreId,
        title: formData.title.trim(),
        description: formData.description,
        imageUrls: mediaUrls,
        denominations: parsedDenominations,
        storeCurrencyCode: 'INR',
        redemptionScope: redemptionScope === 'store' ? 'store_currency' : 'all_currencies',
        status: formData.status,
        pageTitle: formData.pageTitle.trim() || formData.title.trim(),
        metaDescription: formData.metaDescription.trim(),
        urlHandle: formData.urlHandle.trim() || slugify(formData.title.trim()),
        productType: formData.productType || null,
        vendor: formData.vendor || null,
        tagIds: formData.tags,
        themeTemplate,
        giftCardTemplate,
      };

      const created = await createGiftCardProduct(payload);
      toast.success('Gift card product created successfully');
      resetMediaUrls([]);
      onSuccess?.(created);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create gift card product';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeStoreId,
    createGiftCardProduct,
    denominations,
    formData,
    giftCardTemplate,
    mediaUrls,
    onSuccess,
    redemptionScope,
    resetMediaUrls,
    slugify,
    themeTemplate,
  ]);

  return {
    activeStoreId,
    activeStore,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    loading,
    displayImages,
    addImageUrl,
    removeImage,
    denominations,
    setDenominations,
    redemptionScope,
    setRedemptionScope,
    themeTemplate,
    setThemeTemplate,
    giftCardTemplate,
    setGiftCardTemplate,
  };
}
