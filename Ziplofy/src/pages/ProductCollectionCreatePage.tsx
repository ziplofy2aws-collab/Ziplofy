import {
  ArrowLeftIcon,
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PlusIcon,
  RectangleStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import CollectionThemeTemplateSection from '../components/collections/CollectionThemeTemplateSection';
import ProductDescriptionInput from '../components/products/ProductDescriptionInput';
import ProductSearchEngineListingSection from '../components/products/ProductSearchEngineListingSection';
import { useAwsUpload } from '../contexts/aws-upload.context';
import { useCollections } from '../contexts/collection.context';
import { useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';

const inputClass =
  'w-full rounded-lg border border-gray-200/90 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

function stripHtml(html: string): string {
  if (!html.trim()) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugFromTitle(title: string, fallback = 'collection'): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

interface BrowseCollectionProduct {
  _id: string;
  title: string;
  sku: string;
  imageUrl: string | null;
  price: number | null;
}

interface SelectedCollectionProduct extends BrowseCollectionProduct {
  addedAt: number;
  addedSequence: number;
}

const ProductCollectionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createCollection } = useCollections();
  const { searchProductsWithVariants } = useProducts();
  const { uploadImageWithSignedUrl, loading: awsUploading } = useAwsUpload();
  const { activeStoreId } = useStore();
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    description: '',
    pageTitle: '',
    metaDescription: '',
    urlHandle: '',
    themeTemplate: 'default',
    status: 'published' as 'draft' | 'published',
  });
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'all' | 'title' | 'sku'>('all');
  const [productSearchResults, setProductSearchResults] = useState<BrowseCollectionProduct[]>([]);
  const [productBrowsePage, setProductBrowsePage] = useState(1);
  const [productBrowseHasNext, setProductBrowseHasNext] = useState(false);
  const [productBrowseTotal, setProductBrowseTotal] = useState(0);
  const [productSort, setProductSort] = useState<
    'manual' | 'title-asc' | 'title-desc' | 'price-high' | 'price-low' | 'newest' | 'oldest'
  >('manual');
  const [isProductsSearching, setIsProductsSearching] = useState(false);
  const [selectedProductDrafts, setSelectedProductDrafts] = useState<Map<string, BrowseCollectionProduct>>(new Map());
  const [selectedProducts, setSelectedProducts] = useState<SelectedCollectionProduct[]>([]);
  const [selectedCollectionProductIds, setSelectedCollectionProductIds] = useState<Set<string>>(new Set());
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
  const lastReorderTargetRef = useRef<string | null>(null);
  const nextAddedSequenceRef = useRef(1);
  const [isImageActionsOpen, setIsImageActionsOpen] = useState(false);
  const [isImageAltModalOpen, setIsImageAltModalOpen] = useState(false);
  const [imageAltText, setImageAltText] = useState('');
  const [imageAltTextDraft, setImageAltTextDraft] = useState('');
  const modalSearchInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBack = useCallback(() => {
    navigate('/products/collections');
  }, [navigate]);

  const dataUrlToFile = useCallback((dataUrl: string, fallbackName: string): File | null => {
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;
    const mimeType = match[1];
    const base64Data = match[2];
    const binary = window.atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const extension = mimeType.split('/')[1] || 'png';
    return new File([bytes], `${fallbackName}.${extension}`, { type: mimeType });
  }, []);

  const uploadDescriptionImages = useCallback(
    async (descriptionHtml: string): Promise<string> => {
      if (!descriptionHtml.trim() || !activeStoreId) return descriptionHtml;

      const parser = new DOMParser();
      const doc = parser.parseFromString(descriptionHtml, 'text/html');
      const imageNodes = Array.from(doc.querySelectorAll('img[src]'));
      const localImages = imageNodes.filter((img) => {
        const src = img.getAttribute('src') || '';
        return src.startsWith('data:image/') || src.startsWith('blob:');
      });

      if (!localImages.length) return descriptionHtml;

      const uploadToastId = toast.loading(
        `Uploading ${localImages.length} description image${localImages.length > 1 ? 's' : ''}...`
      );

      try {
        await Promise.all(
          localImages.map(async (img, index) => {
            const src = img.getAttribute('src') || '';
            let file: File | null = null;

            if (src.startsWith('data:image/')) {
              file = dataUrlToFile(src, `collection-description-image-${index + 1}`);
            } else if (src.startsWith('blob:')) {
              const blob = await fetch(src).then((res) => res.blob());
              const extension = (blob.type || 'image/png').split('/')[1] || 'png';
              file = new File([blob], `collection-description-image-${index + 1}.${extension}`, {
                type: blob.type || 'image/png',
              });
            }

            if (!file) return;
            const uploaded = await uploadImageWithSignedUrl(file, {
              folder: `${activeStoreId}/collection-description-image`,
            });
            img.setAttribute('src', uploaded.objectUrl);
          })
        );

        toast.success('Description images uploaded', { id: uploadToastId });
        return doc.body.innerHTML;
      } catch (error) {
        toast.error('Failed to upload description images', { id: uploadToastId });
        throw error;
      }
    },
    [activeStoreId, dataUrlToFile, uploadImageWithSignedUrl]
  );

  const uploadCollectionImageIfNeeded = useCallback(
    async (imageUrl: string): Promise<string> => {
      if (!imageUrl || !activeStoreId) return imageUrl;
      const isLocalImage = imageUrl.startsWith('data:image/') || imageUrl.startsWith('blob:');
      if (!isLocalImage) return imageUrl;

      const uploadToastId = toast.loading('Uploading collection image...');
      try {
        let file: File | null = null;

        if (imageUrl.startsWith('data:image/')) {
          file = dataUrlToFile(imageUrl, 'collection-image');
        } else if (imageUrl.startsWith('blob:')) {
          const blob = await fetch(imageUrl).then((res) => res.blob());
          const extension = (blob.type || 'image/png').split('/')[1] || 'png';
          file = new File([blob], `collection-image.${extension}`, {
            type: blob.type || 'image/png',
          });
        }

        if (!file) {
          toast.error('Failed to prepare collection image for upload', { id: uploadToastId });
          return imageUrl;
        }

        const uploaded = await uploadImageWithSignedUrl(file, { folder: 'collections' });
        toast.success('Collection image uploaded', { id: uploadToastId });
        return uploaded.objectUrl;
      } catch (error) {
        toast.error('Failed to upload collection image', { id: uploadToastId });
        throw error;
      }
    },
    [activeStoreId, dataUrlToFile, uploadImageWithSignedUrl]
  );

  const handleSubmit = useCallback(async () => {
    if (!activeStoreId) {
      navigate('/products/collections');
      return;
    }

    const title = form.title.trim();
    if (title.length < 2) {
      toast.error('Collection title must be at least 2 characters');
      return;
    }

    try {
      const uploadedCollectionImageUrl = await uploadCollectionImageIfNeeded(form.imageUrl);
      const descriptionWithUploadedImages = await uploadDescriptionImages(form.description);
      const descriptionPlainText = stripHtml(descriptionWithUploadedImages);
      const safeDescription = descriptionWithUploadedImages.trim() || title;
      const safePageTitle = form.pageTitle.trim() || title;
      const safeMetaDescription =
        form.metaDescription.trim() ||
        descriptionPlainText.slice(0, 160) ||
        `Browse the ${title} collection in our store.`;
      const safeUrlHandle =
        form.urlHandle.trim() || slugFromTitle(title) || `collection-${Date.now()}`;

      await createCollection({
        storeId: activeStoreId,
        title,
        imageUrl: uploadedCollectionImageUrl || undefined,
        imageAltText: imageAltText.trim() || undefined,
        description: safeDescription,
        pageTitle: safePageTitle,
        metaDescription: safeMetaDescription,
        urlHandle: safeUrlHandle,
        productSort,
        productIds: selectedProducts.map((product) => product._id),
        themeTemplate: form.themeTemplate,
        status: form.status,
      });
      toast.success('Collection created');
      navigate('/products/collections');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create collection');
    }
  }, [activeStoreId, form, createCollection, navigate, productSort, selectedProducts, uploadCollectionImageIfNeeded, uploadDescriptionImages, imageAltText]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      const uploaded = await uploadImageWithSignedUrl(file, { folder: 'collections' });
      handleChange('imageUrl', uploaded.objectUrl);
    },
    [handleChange, uploadImageWithSignedUrl]
  );

  const handleImageDrop = useCallback(
    async (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsImageDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      try {
        await handleImageUpload(file);
      } catch {
        // upload errors are handled in context
      }
    },
    [handleImageUpload]
  );

  const handleImageFileSelection = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.currentTarget.value = '';
      if (!file) return;
      try {
        await handleImageUpload(file);
      } catch {
        // upload errors are handled in context
      }
    },
    [handleImageUpload]
  );

  const mapSearchResponseToBrowseProducts = useCallback(
    (items: Array<{ product: { _id: string; title: string; sku?: string; imageUrl: string | null }; variants: Array<{ price: number }> }>) =>
      items.map((item) => {
        const prices = (item.variants || [])
          .map((variant) => variant.price)
          .filter((price): price is number => typeof price === 'number' && Number.isFinite(price));
        return {
          _id: item.product._id,
          title: item.product.title,
          sku: item.product.sku || '',
          imageUrl: item.product.imageUrl,
          price: prices.length ? Math.min(...prices) : null,
        };
      }),
    []
  );

  const filterBrowseProducts = useCallback(
    (products: BrowseCollectionProduct[], query: string, mode: 'all' | 'title' | 'sku') => {
      const q = query.trim().toLowerCase();
      if (!q) return products;
      if (mode === 'title') {
        return products.filter((product) => product.title.toLowerCase().includes(q));
      }
      if (mode === 'sku') {
        return products.filter((product) => product.sku.toLowerCase().includes(q));
      }
      return products.filter(
        (product) => product.title.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q)
      );
    },
    []
  );

  useEffect(() => {
    if (!isProductsModalOpen || !activeStoreId) return;

    let cancelled = false;
    setIsProductsSearching(true);
    const debounceMs = productSearchQuery.trim() ? 280 : 0;
    const timeout = setTimeout(async () => {
      try {
        const response = await searchProductsWithVariants({
          storeId: activeStoreId,
          q: productSearchQuery.trim(),
          page: productBrowsePage,
          limit: 50,
        });
        const results = mapSearchResponseToBrowseProducts(response?.data || []);
        if (!cancelled) {
          setProductSearchResults((prev) =>
            productBrowsePage === 1 ? results : [...prev, ...results.filter((item) => !prev.some((p) => p._id === item._id))]
          );
          setProductBrowseHasNext(Boolean(response?.pagination?.hasNext));
          setProductBrowseTotal(response?.pagination?.total ?? results.length);
        }
      } catch {
        if (!cancelled) {
          if (productBrowsePage === 1) {
            setProductSearchResults([]);
          }
          setProductBrowseHasNext(false);
          setProductBrowseTotal(0);
        }
      } finally {
        if (!cancelled) {
          setIsProductsSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    isProductsModalOpen,
    productSearchQuery,
    activeStoreId,
    searchProductsWithVariants,
    productBrowsePage,
    mapSearchResponseToBrowseProducts,
  ]);

  useEffect(() => {
    setProductBrowsePage(1);
    setProductSearchResults([]);
  }, [productSearchQuery, searchBy]);

  useEffect(() => {
    if (!isProductsModalOpen) return;
    const timeout = setTimeout(() => {
      modalSearchInputRef.current?.focus();
      modalSearchInputRef.current?.select();
    }, 0);
    return () => clearTimeout(timeout);
  }, [isProductsModalOpen]);

  const handleOpenProductsModal = useCallback((options?: { browse?: boolean }) => {
    if (options?.browse) {
      setProductSearchQuery('');
    }
    setProductBrowsePage(1);
    setIsProductsModalOpen(true);
  }, []);

  const handleCloseProductsModal = useCallback(() => {
    setIsProductsModalOpen(false);
    setSelectedProductDrafts(new Map());
  }, []);

  const handleToggleProductSelection = useCallback((product: BrowseCollectionProduct, checked: boolean) => {
    setSelectedProductDrafts((prev) => {
      const next = new Map(prev);
      if (checked) next.set(product._id, product);
      else next.delete(product._id);
      return next;
    });
  }, []);

  const handleAddSelectedProducts = useCallback(() => {
    if (selectedProductDrafts.size === 0) return;

    setSelectedProducts((prev) => {
      const next = [...prev];
      const existingIds = new Set(prev.map((p) => p._id));
      selectedProductDrafts.forEach((product) => {
        if (!existingIds.has(product._id)) {
          next.push({
            ...product,
            addedAt: Date.now(),
            addedSequence: nextAddedSequenceRef.current++,
          });
          existingIds.add(product._id);
        }
      });
      return next;
    });

    setSelectedProductDrafts(new Map());
    setIsProductsModalOpen(false);
  }, [selectedProductDrafts]);

  const displayedSelectedProducts = useMemo(() => {
    const items = [...selectedProducts];
    if (productSort === 'title-asc') {
      items.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    } else if (productSort === 'title-desc') {
      items.sort((a, b) => (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' }));
    } else if (productSort === 'price-high') {
      items.sort((a, b) => {
        const aPrice = typeof a.price === 'number' ? a.price : Number.NEGATIVE_INFINITY;
        const bPrice = typeof b.price === 'number' ? b.price : Number.NEGATIVE_INFINITY;
        return bPrice - aPrice;
      });
    } else if (productSort === 'price-low') {
      items.sort((a, b) => {
        const aPrice = typeof a.price === 'number' ? a.price : Number.POSITIVE_INFINITY;
        const bPrice = typeof b.price === 'number' ? b.price : Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      });
    } else if (productSort === 'newest') {
      items.sort((a, b) => b.addedSequence - a.addedSequence);
    } else if (productSort === 'oldest') {
      items.sort((a, b) => a.addedSequence - b.addedSequence);
    }
    return items;
  }, [selectedProducts, productSort]);

  const reorderSelectedProducts = useCallback((sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setSelectedProducts((prev) => {
      const sourceIndex = prev.findIndex((p) => p._id === sourceId);
      const targetIndex = prev.findIndex((p) => p._id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }, []);

  const handleDragOverRow = useCallback(
    (targetId: string) => {
      if (productSort !== 'manual' || !draggedProductId || draggedProductId === targetId) return;
      if (lastReorderTargetRef.current === targetId) return;
      lastReorderTargetRef.current = targetId;
      reorderSelectedProducts(draggedProductId, targetId);
      setDragOverProductId(targetId);
    },
    [draggedProductId, productSort, reorderSelectedProducts]
  );

  const sortedProductSearchResults = useMemo(() => {
    const results = filterBrowseProducts(productSearchResults, productSearchQuery, searchBy);
    if (productSort === 'title-asc') {
      results.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    } else if (productSort === 'title-desc') {
      results.sort((a, b) => (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' }));
    } else if (productSort === 'price-high') {
      results.sort((a, b) => {
        const aPrice = typeof a.price === 'number' ? a.price : Number.NEGATIVE_INFINITY;
        const bPrice = typeof b.price === 'number' ? b.price : Number.NEGATIVE_INFINITY;
        return bPrice - aPrice;
      });
    } else if (productSort === 'price-low') {
      results.sort((a, b) => {
        const aPrice = typeof a.price === 'number' ? a.price : Number.POSITIVE_INFINITY;
        const bPrice = typeof b.price === 'number' ? b.price : Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      });
    } else if (productSort === 'oldest') {
      results.reverse();
    }
    return results;
  }, [productSearchResults, productSearchQuery, searchBy, productSort, filterBrowseProducts]);

  const alreadySelectedProductIds = useMemo(
    () => new Set(selectedProducts.map((product) => product._id)),
    [selectedProducts]
  );

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        {/* Page header — aligned with Collections list */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
              Back to collections
            </button>
            <div className="border-l-4 border-blue-500/60 pl-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <RectangleStackIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create collection</h1>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Add details, products, and SEO settings before saving.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Save collection
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="min-w-0 space-y-6 xl:col-span-8">
            <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold text-gray-900">Title and description</h2>
              <p className="mt-1 text-sm text-gray-500">Shown on your storefront where this collection appears.</p>
              <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    className={inputClass}
                    placeholder="e.g. Summer sale"
                  />
                </div>
                <div>
                  <ProductDescriptionInput
                    value={form.description}
                    onChange={(html) => handleChange('description', html)}
                    placeholder="Optional description for customers"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold text-gray-900">Products</h2>
              <p className="mt-1 text-sm text-gray-500">Search or browse your catalog to add products to this collection.</p>
              <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[220px] flex-1">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onFocus={() => handleOpenProductsModal()}
                      onChange={(e) => {
                        setProductSearchQuery(e.target.value);
                        handleOpenProductsModal();
                      }}
                      placeholder="Search products"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenProductsModal({ browse: true })}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Browse
                  </button>
                  <select
                    value={productSort}
                    onChange={(e) =>
                      setProductSort(
                        e.target.value as
                          | 'manual'
                          | 'title-asc'
                          | 'title-desc'
                          | 'price-high'
                          | 'price-low'
                          | 'newest'
                          | 'oldest'
                      )
                    }
                    className="min-w-48 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="title-asc">Sort: Product title A-Z</option>
                    <option value="title-desc">Sort: Product title Z-A</option>
                    <option value="price-high">Sort: Highest price</option>
                    <option value="price-low">Sort: Lowest price</option>
                    <option value="newest">Sort: Newest</option>
                    <option value="oldest">Sort: Oldest</option>
                    <option value="manual">Sort: Manually</option>
                  </select>
                </div>
                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50/40 px-4 py-10 text-center">
                  {displayedSelectedProducts.length === 0 ? (
                    <>
                      <p className="text-sm text-gray-500">There are no products in this collection.</p>
                      <p className="mt-1 text-xs text-gray-400">Search or browse to add products.</p>
                    </>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white text-left">
                      {displayedSelectedProducts.map((product, index) => (
                        <div
                          key={product._id}
                          draggable={productSort === 'manual'}
                          onDragStart={() => {
                            if (productSort !== 'manual') return;
                            setDraggedProductId(product._id);
                            lastReorderTargetRef.current = null;
                          }}
                          onDragOver={(e) => {
                            if (productSort !== 'manual') return;
                            e.preventDefault();
                            handleDragOverRow(product._id);
                          }}
                          onDrop={(e) => {
                            if (productSort !== 'manual') return;
                            e.preventDefault();
                            setDraggedProductId(null);
                            setDragOverProductId(null);
                            lastReorderTargetRef.current = null;
                          }}
                          onDragEnd={() => {
                            setDraggedProductId(null);
                            setDragOverProductId(null);
                            lastReorderTargetRef.current = null;
                          }}
                          className={`flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 transition-all duration-200 ease-out last:border-b-0 ${
                            productSort === 'manual' ? 'cursor-grab active:cursor-grabbing' : ''
                          } ${
                            draggedProductId === product._id ? 'scale-[0.995] opacity-85' : ''
                          } ${
                            dragOverProductId === product._id && draggedProductId !== product._id
                              ? 'bg-blue-50/70 ring-1 ring-blue-200'
                              : ''
                          }`}
                        >
                          {productSort === 'manual' ? (
                            <>
                              <button
                                type="button"
                                aria-label={`Reorder ${product.title}`}
                                className="cursor-grab text-gray-400"
                              >
                                <Bars3Icon className="h-4 w-4" />
                              </button>
                              <input
                                type="checkbox"
                                checked={selectedCollectionProductIds.has(product._id)}
                                onChange={(e) => {
                                  setSelectedCollectionProductIds((prev) => {
                                    const next = new Set(prev);
                                    if (e.target.checked) next.add(product._id);
                                    else next.delete(product._id);
                                    return next;
                                  });
                                }}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/40"
                              />
                            </>
                          ) : null}
                          <span className="w-7 shrink-0 text-right text-sm text-gray-700">{index + 1}.</span>
                          <div className="h-9 w-9 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{product.title}</p>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-sm font-semibold text-emerald-800">
                            Active
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProducts((prev) => prev.filter((p) => p._id !== product._id));
                              setSelectedCollectionProductIds((prev) => {
                                const next = new Set(prev);
                                next.delete(product._id);
                                return next;
                              });
                            }}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            aria-label={`Remove ${product.title}`}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <ProductSearchEngineListingSection
              productTitle={form.title}
              productDescription={form.description}
              pageTitle={form.pageTitle}
              metaDescription={form.metaDescription}
              urlHandle={form.urlHandle}
              onPageTitleChange={(value) => handleChange('pageTitle', value)}
              onMetaDescriptionChange={(value) => handleChange('metaDescription', value)}
              onUrlHandleChange={(value) => handleChange('urlHandle', value)}
              urlPathPrefix="collections/"
              resourceLabel="collection"
            />
          </div>

          <aside className="space-y-6 xl:col-span-4">
            <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold text-gray-900">Publishing</h2>
              <p className="mt-1 text-sm text-gray-500">Set whether this collection is visible on your store.</p>
              <div className="mt-5 border-t border-gray-100 pt-5">
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value as 'draft' | 'published')}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Image</h2>
                {form.imageUrl ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsImageActionsOpen((prev) => !prev)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                    >
                      Edit
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    {isImageActionsOpen ? (
                      <div className="absolute right-0 z-20 mt-2 min-w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setIsImageActionsOpen(false);
                            imageFileInputRef.current?.click();
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Change image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsImageActionsOpen(false);
                            setImageAltTextDraft(imageAltText);
                            setIsImageAltModalOpen(true);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Edit alt text
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsImageActionsOpen(false);
                            setIsImageAltModalOpen(false);
                            setImageAltText('');
                            handleChange('imageUrl', '');
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-gray-500">Upload a featured image for this collection.</p>
              <div className="mt-5 border-t border-gray-100 pt-5">
                {form.imageUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img src={form.imageUrl} alt={imageAltText || 'Collection'} className="h-44 w-full object-cover" />
                  </div>
                ) : (
                  <label
                    onClick={() => imageFileInputRef.current?.click()}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsImageDragOver(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsImageDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsImageDragOver(false);
                    }}
                    onDrop={handleImageDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
                      isImageDragOver
                        ? 'border-blue-400 bg-blue-50/60'
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-700">
                      {awsUploading ? 'Uploading image...' : 'Upload collection image'}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">Drag and drop, or click to upload (PNG, JPG, WEBP)</span>
                  </label>
                )}
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileSelection}
                />
              </div>
            </section>

            <CollectionThemeTemplateSection
              storeId={activeStoreId || undefined}
              value={form.themeTemplate}
              onChange={(value) => handleChange('themeTemplate', value)}
            />
          </aside>
        </div>
      </div>

      <Modal
        open={isImageAltModalOpen}
        onClose={() => setIsImageAltModalOpen(false)}
        maxWidth="lg"
        title={<h2 className="text-xl font-semibold text-gray-900">Edit alt text</h2>}
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsImageAltModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setImageAltText(imageAltTextDraft.trim());
                setIsImageAltModalOpen(false);
              }}
              className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Save
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt={imageAltText || 'Collection'} className="h-full w-full object-cover" />
            ) : (
              <div className="flex min-h-56 items-center justify-center text-sm text-gray-500">No image selected</div>
            )}
          </div>
          <div>
            <label htmlFor="collection-image-alt-modal" className="mb-2 block text-sm font-medium text-gray-700">
              Alt text
            </label>
            <input
              id="collection-image-alt-modal"
              type="text"
              value={imageAltTextDraft}
              onChange={(e) => setImageAltTextDraft(e.target.value)}
              className={inputClass}
              placeholder="Describe this image"
            />
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Write a brief description of the file for people with visual impairment or low-bandwidth connections.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={isProductsModalOpen}
        onClose={handleCloseProductsModal}
        maxWidth="lg"
        title={
          <h2 className="text-xl font-semibold text-gray-900">
            Add products
          </h2>
        }
        actions={
          <>
            <button
              type="button"
              onClick={handleCloseProductsModal}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSelectedProducts}
              disabled={selectedProductDrafts.size === 0}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white ${
                selectedProductDrafts.size === 0
                  ? 'cursor-not-allowed bg-gray-200'
                  : 'bg-gray-900 transition-colors hover:bg-gray-800'
              }`}
            >
              Add{selectedProductDrafts.size > 0 ? ` (${selectedProductDrafts.size})` : ''}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[300px] flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                ref={modalSearchInputRef}
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search products by title or SKU"
                className={`${inputClass} h-11 pl-10 pr-10 text-base`}
              />
              {productSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setProductSearchQuery('')}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as 'all' | 'title' | 'sku')}
              className="h-11 min-w-60 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Search by all</option>
              <option value="title">Search by title</option>
              <option value="sku">Search by SKU</option>
            </select>
          </div>

          <p className="text-sm text-gray-500">
            {productSearchQuery.trim()
              ? `Showing matches for "${productSearchQuery.trim()}"`
              : `Browsing ${productBrowseTotal || sortedProductSearchResults.length} product${
                  (productBrowseTotal || sortedProductSearchResults.length) === 1 ? '' : 's'
                } in your store`}
          </p>

          <div className="rounded-xl border border-gray-100 bg-white">
            {isProductsSearching && productBrowsePage === 1 ? (
              <div className="px-4 py-16 text-center text-sm text-gray-500">Loading products...</div>
            ) : sortedProductSearchResults.length > 0 ? (
              <>
                <ul className="max-h-[340px] divide-y divide-gray-100 overflow-y-auto">
                  {sortedProductSearchResults.map((product) => {
                    const isChecked = selectedProductDrafts.has(product._id);
                    const isAlreadyAdded = alreadySelectedProductIds.has(product._id);
                    return (
                      <li
                        key={product._id}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          isChecked ? 'bg-blue-50/40' : 'hover:bg-gray-50/70'
                        } ${isAlreadyAdded ? 'opacity-60' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isAlreadyAdded}
                          onChange={(e) => handleToggleProductSelection(product, e.target.checked)}
                          aria-label={`Select ${product.title}`}
                          className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/40 disabled:cursor-not-allowed"
                        />
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                              <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{product.title}</p>
                          {product.sku ? (
                            <p className="truncate text-xs text-gray-500">SKU: {product.sku}</p>
                          ) : null}
                        </div>
                        {isAlreadyAdded ? (
                          <span className="shrink-0 text-xs font-semibold text-emerald-600">Added</span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {productBrowseHasNext ? (
                  <div className="border-t border-gray-100 px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setProductBrowsePage((prev) => prev + 1)}
                      disabled={isProductsSearching}
                      className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProductsSearching ? 'Loading more...' : 'Load more products'}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="px-4 py-16 text-center">
                <MagnifyingGlassIcon className="mx-auto h-7 w-7 text-gray-400" />
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  {productSearchQuery.trim() ? 'No products found' : 'No products in your store yet'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {productSearchQuery.trim()
                    ? 'Try changing the search term or filters'
                    : 'Create products first, then add them to this collection'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductCollectionCreatePage;
