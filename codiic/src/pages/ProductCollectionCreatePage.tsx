import {
  Bars3Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  RectangleStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import CollectionBasicInfoSection from '../components/collections/CollectionBasicInfoSection';
import CollectionFormHeader from '../components/collections/CollectionFormHeader';
import CollectionImageSidebarSection from '../components/collections/CollectionImageSidebarSection';
import CollectionPublishingSection from '../components/collections/CollectionPublishingSection';
import CollectionSeoSection from '../components/collections/CollectionSeoSection';
import {
  collectionInputClass,
  collectionMutedAddButtonClass,
  collectionPrimaryButtonClass,
  collectionProductRowClass,
  collectionProductsPanelClass,
  collectionSecondaryButtonClass,
} from '../components/collections/collection-form-ui.util';
import {
  COLLECTION_PRODUCT_SORT_OPTIONS,
  type CollectionProductSort,
} from '../components/collections/collection-form.types';
import {
  productFormAsideStackClass,
  productFormCardClass,
  productFormGridClass,
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from '../components/products/product-form-appearance';
import { type Collection, useCollections } from '../contexts/collection.context';
import { useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import { useDescriptionCloudStorageSave } from '../hooks/useDescriptionCloudStorageSave';
import { THEME_EDITOR_STATIC_CONFIG } from '../config/theme-editor-static.config';
import { plainTextFromHtml } from '../seo/seo-text.util';
import {
  getCollectionApiErrorMessage,
  resolveCollectionSeoFields,
} from '../utils/collection-seo.util';

const FORM_APPEARANCE = 'minimal' as const;

interface SelectedCollectionProduct {
  _id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  addedAt: number;
  addedSequence: number;
}

export type CollectionCreateFormProps = {
  variant?: 'page' | 'sheet';
  onSuccess?: (collection: Collection) => void;
  onCancel?: () => void;
};

export const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  variant = 'page',
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const isSheet = variant === 'sheet';
  const { createCollection, loading: collectionLoading } = useCollections();
  const { searchProductsWithVariants } = useProducts();
  const { activeStoreId } = useStore();
  const prepareDescriptionForSave = useDescriptionCloudStorageSave(activeStoreId || undefined);
  const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
  const sheetModalZIndex = 16000;
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    description: '',
    pageTitle: '',
    metaDescription: '',
    urlHandle: '',
    status: 'published' as 'draft' | 'published',
  });
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'all' | 'title' | 'sku'>('all');
  const [productSearchResults, setProductSearchResults] = useState<
    Array<{ _id: string; title: string; imageUrl: string | null; price: number | null }>
  >([]);
  const [productSort, setProductSort] = useState<CollectionProductSort>('manual');
  const [isProductsSearching, setIsProductsSearching] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<SelectedCollectionProduct[]>([]);
  const [selectedCollectionProductIds, setSelectedCollectionProductIds] = useState<Set<string>>(new Set());
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
  const lastReorderTargetRef = useRef<string | null>(null);
  const nextAddedSequenceRef = useRef(1);
  const [isImageAltModalOpen, setIsImageAltModalOpen] = useState(false);
  const [imageAltText, setImageAltText] = useState('');
  const [imageAltTextDraft, setImageAltTextDraft] = useState('');
  const modalSearchInputRef = useRef<HTMLInputElement | null>(null);
  const seoTouchedRef = useRef({ pageTitle: false, metaDescription: false, urlHandle: false });

  const handleChange = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSeoFieldChange = useCallback(
    (field: 'pageTitle' | 'metaDescription' | 'urlHandle', value: string) => {
      seoTouchedRef.current[field] = true;
      handleChange(field, value);
    },
    [handleChange]
  );

  useEffect(() => {
    const derived = resolveCollectionSeoFields(form.title, form.description, {
      pageTitle: '',
      metaDescription: '',
      urlHandle: '',
    });
    setForm((prev) => {
      const next = { ...prev };
      let changed = false;
      if (!seoTouchedRef.current.pageTitle && prev.pageTitle !== derived.pageTitle) {
        next.pageTitle = derived.pageTitle;
        changed = true;
      }
      if (!seoTouchedRef.current.metaDescription && prev.metaDescription !== derived.metaDescription) {
        next.metaDescription = derived.metaDescription;
        changed = true;
      }
      if (!seoTouchedRef.current.urlHandle && prev.urlHandle !== derived.urlHandle) {
        next.urlHandle = derived.urlHandle;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [form.title, form.description]);

  const handleBack = useCallback(() => {
    if (isSheet && onCancel) {
      onCancel();
      return;
    }
    navigate('/products/collections');
  }, [isSheet, navigate, onCancel]);

  const handleSubmit = useCallback(async () => {
    if (!storeId) {
      if (isSheet && onCancel) {
        onCancel();
      } else {
        navigate('/products/collections');
      }
      return;
    }
    if (!form.title.trim()) {
      toast.error('Collection title is required');
      return;
    }
    const descriptionPlain = plainTextFromHtml(form.description);
    if (!descriptionPlain) {
      toast.error('Collection description is required');
      return;
    }
    try {
      const descriptionWithUploadedImages = await prepareDescriptionForSave(form.description);
      const seo = resolveCollectionSeoFields(form.title, descriptionWithUploadedImages, {
        pageTitle: form.pageTitle,
        metaDescription: form.metaDescription,
        urlHandle: form.urlHandle,
      });
      const created = await createCollection({
        storeId,
        title: form.title,
        imageUrl: form.imageUrl || undefined,
        imageAltText: imageAltText.trim() || undefined,
        description: descriptionWithUploadedImages,
        pageTitle: seo.pageTitle,
        metaDescription: seo.metaDescription,
        urlHandle: seo.urlHandle,
        productSort,
        productIds: selectedProducts.map((product) => product._id),
        status: form.status,
      });
      if (isSheet && onSuccess) {
        onSuccess(created);
        return;
      }
      if (created._id) {
        navigate(`/products/collections/${created._id}`, { state: { collectionJustCreated: true } });
      } else {
        navigate('/products/collections');
      }
    } catch (error: unknown) {
      toast.error(getCollectionApiErrorMessage(error, 'Failed to create collection'));
    }
  }, [
    storeId,
    form,
    createCollection,
    imageAltText,
    isSheet,
    navigate,
    onCancel,
    onSuccess,
    prepareDescriptionForSave,
    productSort,
    selectedProducts,
  ]);

  const handleQuickAddProduct = useCallback(
    (product: { _id: string; title: string; imageUrl: string | null; price: number | null }) => {
      setSelectedProducts((prev) => {
        if (prev.some((p) => p._id === product._id)) return prev;
        return [
          ...prev,
          {
            ...product,
            addedAt: Date.now(),
            addedSequence: nextAddedSequenceRef.current++,
          },
        ];
      });
      setProductSearchQuery('');
      setProductSearchResults([]);
    },
    []
  );

  useEffect(() => {
    const q = productSearchQuery.trim();
    if (!q || !storeId) {
      setProductSearchResults([]);
      setIsProductsSearching(false);
      return;
    }

    let cancelled = false;
    setIsProductsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await searchProductsWithVariants({
          storeId,
          q,
          page: 1,
          limit: 50,
        });
        const results =
          response?.data?.map((item) => {
            const prices = (item.variants || [])
              .map((variant) => variant.price)
              .filter((price): price is number => typeof price === 'number' && Number.isFinite(price));
            return {
              _id: item.product._id,
              title: item.product.title,
              imageUrl: item.product.imageUrl,
              price: prices.length ? Math.min(...prices) : null,
            };
          }) || [];
        if (!cancelled) {
          setProductSearchResults(results || []);
        }
      } catch {
        if (!cancelled) {
          setProductSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsProductsSearching(false);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [productSearchQuery, storeId, searchProductsWithVariants]);

  useEffect(() => {
    if (!isProductsModalOpen) return;
    const timeout = setTimeout(() => {
      modalSearchInputRef.current?.focus();
      modalSearchInputRef.current?.select();
    }, 0);
    return () => clearTimeout(timeout);
  }, [isProductsModalOpen]);

  const handleToggleProductSelection = useCallback((productId: string, checked: boolean) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  const handleAddSelectedProducts = useCallback(() => {
    if (selectedProductIds.size === 0) return;

    setSelectedProducts((prev) => {
      const next = [...prev];
      const existingIds = new Set(prev.map((p) => p._id));
      productSearchResults.forEach((product) => {
        if (selectedProductIds.has(product._id) && !existingIds.has(product._id)) {
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

    setSelectedProductIds(new Set());
    setIsProductsModalOpen(false);
  }, [selectedProductIds, productSearchResults]);

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
    const results = [...productSearchResults];
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
    } else if (productSort === 'newest') {
      // backend returns newest first by createdAt desc; keep as-is
    } else if (productSort === 'oldest') {
      // invert newest-first order from backend
      results.reverse();
    }
    return results;
  }, [productSearchResults, productSort]);

  return (
    <div className={isSheet ? 'bg-page-background-color' : productFormPageClass(FORM_APPEARANCE)}>
      <div className={isSheet ? 'px-4 py-4 sm:px-6' : 'mx-auto max-w-[1500px] px-3 py-4 sm:px-4'}>
        <CollectionFormHeader
          mode="create"
          title={form.title}
          submitLabel={collectionLoading ? 'Saving…' : 'Save'}
          submitDisabled={collectionLoading}
          onBack={!isSheet ? handleBack : undefined}
          onCancel={isSheet ? onCancel : undefined}
          onSubmit={() => void handleSubmit()}
        />

        <div className={productFormGridClass(FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(FORM_APPEARANCE)}>
            <CollectionBasicInfoSection
              title={form.title}
              description={form.description}
              titleInputId="title"
              onTitleChange={(value) => handleChange('title', value)}
              onDescriptionChange={(html) => handleChange('description', html)}
            />

            <section className={productFormCardClass(FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Products</h2>
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[220px] flex-1">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Search products"
                      className={`${collectionInputClass} pl-9`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProductsModalOpen(true)}
                    className={collectionSecondaryButtonClass}
                  >
                    Browse
                  </button>
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value as CollectionProductSort)}
                    className={`${collectionInputClass} min-w-44 cursor-pointer`}
                  >
                    {COLLECTION_PRODUCT_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        Sort: {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`mt-4 ${collectionProductsPanelClass} px-3 py-3`}>
                  {productSearchQuery.trim() ? (
                    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white text-left">
                      {isProductsSearching ? (
                        <p className="px-4 py-8 text-center text-sm text-gray-500">Searching products…</p>
                      ) : sortedProductSearchResults.length > 0 ? (
                        <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
                          {sortedProductSearchResults.map((product) => {
                            const alreadyAdded = selectedProducts.some((p) => p._id === product._id);
                            return (
                              <li key={product._id} className="flex items-center gap-3 px-3 py-2.5">
                                <div className="h-9 w-9 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                  {product.imageUrl ? (
                                    <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                      <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                                  {product.title}
                                </p>
                                <button
                                  type="button"
                                  disabled={alreadyAdded}
                                  onClick={() => handleQuickAddProduct(product)}
                                  className={alreadyAdded ? collectionMutedAddButtonClass : collectionPrimaryButtonClass}
                                >
                                  {alreadyAdded ? 'Added' : 'Add'}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="px-4 py-8 text-center text-sm text-gray-500">No products found</p>
                      )}
                    </div>
                  ) : displayedSelectedProducts.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-[13px] text-gray-500">No products in this collection yet.</p>
                    </div>
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
                          className={`${collectionProductRowClass} ${
                            productSort === 'manual' ? 'cursor-grab active:cursor-grabbing' : ''
                          } ${
                            draggedProductId === product._id ? 'opacity-80' : ''
                          } ${
                            dragOverProductId === product._id && draggedProductId !== product._id
                              ? 'bg-gray-100'
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
                                className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
                              />
                            </>
                          ) : null}
                          <span className="w-6 shrink-0 text-right text-[12px] text-gray-400">{index + 1}</span>
                          <div className="h-9 w-9 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900">{product.title}</p>
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

            <CollectionSeoSection
              collectionTitle={form.title}
              collectionDescription={form.description}
              pageTitle={form.pageTitle}
              metaDescription={form.metaDescription}
              urlHandle={form.urlHandle}
              onPageTitleChange={(value) => handleSeoFieldChange('pageTitle', value)}
              onMetaDescriptionChange={(value) => handleSeoFieldChange('metaDescription', value)}
              onUrlHandleChange={(value) => handleSeoFieldChange('urlHandle', value)}
            />
          </div>

          <aside className={productFormAsideStackClass(FORM_APPEARANCE)}>
            <CollectionPublishingSection
              status={form.status}
              onStatusChange={(status) => handleChange('status', status)}
            />

            <CollectionImageSidebarSection
              imageUrl={form.imageUrl}
              imageAlt={imageAltText || form.title || 'Collection'}
              onImageUrlChange={(url) => handleChange('imageUrl', url)}
              onEditAltText={
                form.imageUrl
                  ? () => {
                      setImageAltTextDraft(imageAltText);
                      setIsImageAltModalOpen(true);
                    }
                  : undefined
              }
            />
          </aside>
        </div>
      </div>

      <Modal
        open={isImageAltModalOpen}
        onClose={() => setIsImageAltModalOpen(false)}
        maxWidth="lg"
        zIndex={isSheet ? sheetModalZIndex : undefined}
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
              className={collectionInputClass}
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
        onClose={() => setIsProductsModalOpen(false)}
        maxWidth="lg"
        zIndex={isSheet ? sheetModalZIndex : undefined}
        title={
          <h2 className="text-xl font-semibold text-gray-900">
            Add products
          </h2>
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsProductsModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSelectedProducts}
              disabled={selectedProductIds.size === 0}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white ${
                selectedProductIds.size === 0
                  ? 'cursor-not-allowed bg-gray-200'
                  : 'bg-gray-900 transition-colors hover:bg-gray-800'
              }`}
            >
              Add
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
                placeholder="Search products"
                className={`${collectionInputClass} h-11 pl-10 pr-10 text-base`}
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
              className={`${collectionInputClass} h-11 min-w-60`}
            >
              <option value="all">Search by All</option>
              <option value="title">Search by Title</option>
              <option value="sku">Search by SKU</option>
            </select>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Add filter <PlusIcon className="h-4 w-4" />
          </button>

          <div className="rounded-xl border border-gray-100 bg-white">
            {isProductsSearching ? (
              <div className="px-4 py-16 text-center text-sm text-gray-500">Searching products...</div>
            ) : sortedProductSearchResults.length > 0 ? (
              <ul className="max-h-[340px] divide-y divide-gray-100 overflow-y-auto">
                {sortedProductSearchResults.map((product) => {
                  const isChecked = selectedProductIds.has(product._id);
                  return (
                  <li
                    key={product._id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isChecked ? 'bg-gray-50' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleToggleProductSelection(product._id, e.target.checked)}
                      aria-label={`Select ${product.title}`}
                      className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
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
                    <p className="truncate text-sm font-medium text-gray-900">{product.title}</p>
                  </li>
                )})}
              </ul>
            ) : (
              <div className="px-4 py-16 text-center">
                <MagnifyingGlassIcon className="mx-auto h-7 w-7 text-gray-400" />
                <p className="mt-2 text-sm font-semibold text-gray-700">No products found</p>
                <p className="mt-1 text-sm text-gray-500">Try changing the filters or search term</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

const ProductCollectionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  return <CollectionCreateForm variant="page" onCancel={() => navigate('/products/collections')} />;
};

export default ProductCollectionCreatePage;
