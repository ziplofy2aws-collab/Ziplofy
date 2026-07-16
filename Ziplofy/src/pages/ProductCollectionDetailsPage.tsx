import {
  ArrowLeftIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CollectionAddedBanner from '../components/collections/CollectionAddedBanner';
import CollectionBasicInfoSection from '../components/collections/CollectionBasicInfoSection';
import CollectionFormHeader from '../components/collections/CollectionFormHeader';
import CollectionImageSidebarSection from '../components/collections/CollectionImageSidebarSection';
import CollectionPublishingSection from '../components/collections/CollectionPublishingSection';
import CollectionSeoSection from '../components/collections/CollectionSeoSection';
import CollectionThemeTemplateSection from '../components/collections/CollectionThemeTemplateSection';
import DeleteCollectionModal from '../components/collections/DeleteCollectionModal';
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
import Modal from '../components/Modal';
import ProductFormPageSkeleton from '../components/products/ProductFormPageSkeleton';
import { useCollectionEntries, type CollectionEntry } from '../contexts/collection-entries.context';
import type { UpdateCollectionPayload } from '../contexts/collection.context';
import { useCollections } from '../contexts/collection.context';
import { useProducts } from '../contexts/product.context';
import { useDescriptionCloudStorageSave } from '../hooks/useDescriptionCloudStorageSave';
import { readCollectionJustCreated } from '../utils/collection-navigation.util';

const FORM_APPEARANCE = 'minimal' as const;

type CollectionFormState = {
  title: string;
  imageUrl: string;
  imageAltText: string;
  description: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  productSort: CollectionProductSort;
  status: 'draft' | 'published';
  themeTemplate: string;
};

type SearchProduct = {
  _id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
};

function getEntryImageUrl(entry: CollectionEntry): string | null {
  return entry.productId?.imageUrls?.[0] ?? null;
}

function sortCollectionEntries(entries: CollectionEntry[], productSort: CollectionProductSort): CollectionEntry[] {
  const sorted = [...entries];
  if (productSort === 'title-asc') {
    sorted.sort((a, b) =>
      (a.productId?.title || '').localeCompare(b.productId?.title || '', undefined, { sensitivity: 'base' })
    );
  } else if (productSort === 'title-desc') {
    sorted.sort((a, b) =>
      (b.productId?.title || '').localeCompare(a.productId?.title || '', undefined, { sensitivity: 'base' })
    );
  } else if (productSort === 'price-high') {
    sorted.sort((a, b) => (b.productId?.price ?? Number.NEGATIVE_INFINITY) - (a.productId?.price ?? Number.NEGATIVE_INFINITY));
  } else if (productSort === 'price-low') {
    sorted.sort((a, b) => (a.productId?.price ?? Number.POSITIVE_INFINITY) - (b.productId?.price ?? Number.POSITIVE_INFINITY));
  } else if (productSort === 'newest') {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (productSort === 'oldest') {
    sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    sorted.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }
  return sorted;
}

const ProductCollectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const collectionJustCreatedOnMount = useRef(readCollectionJustCreated(location.state));
  const previousCollectionIdRef = useRef(id);
  const [showCollectionAddedBanner, setShowCollectionAddedBanner] = useState(
    () => collectionJustCreatedOnMount.current
  );
  const { collections, activeCollection, activeCollectionLoading, deleteCollection, fetchCollectionById, clearActiveCollection, updateCollection, loading: collectionSaving } = useCollections();
  const { searchProductsWithVariants } = useProducts();
  const {
    createCollectionEntry,
    deleteCollectionEntry,
    fetchCollectionEntriesByCollectionId,
    collectionEntries,
    loading: collectionEntriesLoading,
  } = useCollectionEntries();

  const collection =
    activeCollection?._id === id ? activeCollection : collections.find((c) => c._id === id);
  const prepareDescriptionForSave = useDescriptionCloudStorageSave(collection?.storeId);

  useEffect(() => {
    if (id) {
      fetchCollectionById(id).catch(() => {
        // errors handled by context and not-found state
      });
    }
    return () => {
      clearActiveCollection();
    };
  }, [id, fetchCollectionById, clearActiveCollection]);

  const initialForm = useMemo<CollectionFormState>(
    () => ({
      title: collection?.title || '',
      imageUrl: collection?.imageUrl || '',
      imageAltText: collection?.imageAltText || '',
      description: collection?.description || '',
      pageTitle: collection?.pageTitle || '',
      metaDescription: collection?.metaDescription || '',
      urlHandle: collection?.urlHandle || '',
      productSort: (collection?.productSort as CollectionProductSort) || 'manual',
      status: (collection?.status as 'draft' | 'published') || 'published',
      themeTemplate: collection?.themeTemplate || 'default',
    }),
    [collection]
  );

  const [form, setForm] = useState<CollectionFormState>(initialForm);
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isImageAltModalOpen, setIsImageAltModalOpen] = useState(false);
  const [imageAltTextDraft, setImageAltTextDraft] = useState('');
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'all' | 'title' | 'sku'>('all');
  const [productSearchResults, setProductSearchResults] = useState<SearchProduct[]>([]);
  const [isProductsSearching, setIsProductsSearching] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const modalSearchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (id) {
      fetchCollectionEntriesByCollectionId(id);
    }
  }, [id, fetchCollectionEntriesByCollectionId]);

  useEffect(() => {
    const q = productSearchQuery.trim();
    if (!q || !collection?.storeId) {
      setProductSearchResults([]);
      setIsProductsSearching(false);
      return;
    }

    let cancelled = false;
    setIsProductsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await searchProductsWithVariants({
          storeId: collection.storeId,
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
        if (!cancelled) setProductSearchResults(results);
      } catch {
        if (!cancelled) setProductSearchResults([]);
      } finally {
        if (!cancelled) setIsProductsSearching(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [productSearchQuery, collection?.storeId, searchProductsWithVariants]);

  useEffect(() => {
    if (!isProductsModalOpen) return;
    const timeout = setTimeout(() => {
      modalSearchInputRef.current?.focus();
      modalSearchInputRef.current?.select();
    }, 0);
    return () => clearTimeout(timeout);
  }, [isProductsModalOpen]);

  const existingProductIds = useMemo(
    () => new Set(collectionEntries.map((entry) => entry.productId._id)),
    [collectionEntries]
  );

  const changedPayload = useMemo(() => {
    const payload: UpdateCollectionPayload = {};
    (Object.keys(initialForm) as Array<keyof CollectionFormState>).forEach((key) => {
      if (form[key] !== initialForm[key]) {
        (payload as Record<string, unknown>)[key] = form[key];
      }
    });
    return payload;
  }, [form, initialForm]);

  const hasChanges = Object.keys(changedPayload).length > 0;

  const displayedEntries = useMemo(
    () => sortCollectionEntries(collectionEntries, form.productSort),
    [collectionEntries, form.productSort]
  );

  const sortedProductSearchResults = useMemo(() => {
    const results = [...productSearchResults];
    if (form.productSort === 'title-asc') {
      results.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    } else if (form.productSort === 'title-desc') {
      results.sort((a, b) => (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' }));
    } else if (form.productSort === 'price-high') {
      results.sort((a, b) => {
        const aPrice = typeof a.price === 'number' ? a.price : Number.NEGATIVE_INFINITY;
        const bPrice = typeof b.price === 'number' ? b.price : Number.NEGATIVE_INFINITY;
        return bPrice - aPrice;
      });
    } else if (form.productSort === 'price-low') {
      results.sort((a, b) => {
        const aPrice = typeof a.price === 'number' ? a.price : Number.POSITIVE_INFINITY;
        const bPrice = typeof b.price === 'number' ? b.price : Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      });
    } else if (form.productSort === 'oldest') {
      results.reverse();
    }
    return results;
  }, [productSearchResults, form.productSort]);

  const handleBack = useCallback(() => {
    navigate('/products/collections');
  }, [navigate]);

  useEffect(() => {
    if (collectionJustCreatedOnMount.current) {
      collectionJustCreatedOnMount.current = false;
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (previousCollectionIdRef.current !== id) {
      previousCollectionIdRef.current = id;
      setShowCollectionAddedBanner(false);
    }
  }, [id]);

  const handleDismissCollectionAddedBanner = useCallback(() => {
    setShowCollectionAddedBanner(false);
  }, []);

  const handleAddAnotherCollection = useCallback(() => {
    navigate('/products/collections/new');
  }, [navigate]);

  const handleChange = useCallback((field: keyof CollectionFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!collection?._id) return;
    if (!form.title.trim()) {
      toast.error('Collection title is required');
      return;
    }
    if (!hasChanges) return;

    try {
      const patchPayload: UpdateCollectionPayload = { ...changedPayload };
      if (Object.prototype.hasOwnProperty.call(patchPayload, 'imageUrl')) {
        patchPayload.imageUrl = form.imageUrl || undefined;
      }
      if (Object.prototype.hasOwnProperty.call(patchPayload, 'imageAltText')) {
        patchPayload.imageAltText = form.imageAltText || undefined;
      }
      if (Object.prototype.hasOwnProperty.call(patchPayload, 'description')) {
        patchPayload.description = await prepareDescriptionForSave(form.description);
      }
      await updateCollection(collection._id, patchPayload);
      toast.success('Collection saved');
    } catch (error: unknown) {
      const message = (error as Error)?.message;
      if (message) toast.error(message);
    }
  }, [
    changedPayload,
    collection?._id,
    form.description,
    form.imageAltText,
    form.imageUrl,
    form.title,
    hasChanges,
    prepareDescriptionForSave,
    updateCollection,
  ]);

  const handleAddProductToCollection = useCallback(
    async (productId: string) => {
      if (!collection?._id || existingProductIds.has(productId)) return;
      setAddingProductId(productId);
      try {
        await createCollectionEntry({ collectionId: collection._id, productId });
        toast.success('Product added to collection');
        setProductSearchQuery('');
        setProductSearchResults([]);
      } catch (error: unknown) {
        const message = (error as Error)?.message;
        if (message) toast.error(message);
      } finally {
        setAddingProductId(null);
      }
    },
    [collection?._id, createCollectionEntry, existingProductIds]
  );

  const handleToggleProductSelection = useCallback((productId: string, checked: boolean) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  const handleAddSelectedProducts = useCallback(async () => {
    if (!collection?._id || selectedProductIds.size === 0) return;
    const toAdd = [...selectedProductIds].filter((productId) => !existingProductIds.has(productId));
    if (!toAdd.length) {
      setIsProductsModalOpen(false);
      setSelectedProductIds(new Set());
      return;
    }

    try {
      await Promise.all(
        toAdd.map((productId) => createCollectionEntry({ collectionId: collection._id, productId }))
      );
      toast.success(`${toAdd.length} product${toAdd.length > 1 ? 's' : ''} added`);
      setSelectedProductIds(new Set());
      setIsProductsModalOpen(false);
      setProductSearchQuery('');
      setProductSearchResults([]);
    } catch (error: unknown) {
      const message = (error as Error)?.message;
      if (message) toast.error(message);
    }
  }, [collection?._id, createCollectionEntry, existingProductIds, selectedProductIds]);

  const handleRemoveProductFromCollection = useCallback(
    async (entryId: string) => {
      try {
        await deleteCollectionEntry(entryId);
        toast.success('Product removed from collection');
      } catch (error: unknown) {
        const message = (error as Error)?.message;
        if (message) toast.error(message);
      }
    },
    [deleteCollectionEntry]
  );

  const handleDeleteCollection = useCallback(async () => {
    if (!collection?._id) {
      setConfirmOpen(false);
      return;
    }
    try {
      await deleteCollection(collection._id);
      navigate('/products/collections');
    } catch {
      setConfirmOpen(false);
    }
  }, [collection?._id, deleteCollection, navigate]);

  const handleNavigateToProduct = useCallback(
    (productId: string) => {
      if (productId) navigate(`/products/${productId}`);
    },
    [navigate]
  );

  if (activeCollectionLoading) {
    return <ProductFormPageSkeleton />;
  }

  if (!collection) {
    return (
      <div className={productFormPageClass(FORM_APPEARANCE)}>
        <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
          <button
            type="button"
            onClick={handleBack}
            className="mb-3 flex items-center gap-2 text-sm font-normal text-gray-400 transition-colors hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back to collections
          </button>
          <div className="flex flex-col items-center rounded-lg border border-gray-200/50 bg-white px-6 py-16 text-center">
            <FolderIcon className="mb-4 h-10 w-10 text-gray-300" aria-hidden />
            <h2 className="text-[15px] font-semibold text-gray-900">Collection not found</h2>
            <p className="mt-1.5 max-w-md text-[13px] font-normal text-gray-500">
              This collection isn&apos;t loaded yet or doesn&apos;t exist.
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Back to collections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={productFormPageClass(FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        {showCollectionAddedBanner ? (
          <CollectionAddedBanner
            collectionTitle={form.title || collection.title || 'Collection'}
            onDismiss={handleDismissCollectionAddedBanner}
            onAddAnother={handleAddAnotherCollection}
          />
        ) : null}

        <CollectionFormHeader
          mode="edit"
          title={form.title}
          status={form.status}
          submitLabel={collectionSaving ? 'Saving…' : 'Save'}
          submitDisabled={collectionSaving || !hasChanges}
          onBack={handleBack}
          onSubmit={() => void handleSave()}
        />

        <div className={productFormGridClass(FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(FORM_APPEARANCE)}>
            <CollectionBasicInfoSection
              title={form.title}
              description={form.description}
              titleInputId="collection-title"
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
                    value={form.productSort}
                    onChange={(e) => handleChange('productSort', e.target.value)}
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
                            const alreadyAdded = existingProductIds.has(product._id);
                            const isAdding = addingProductId === product._id;
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
                                  disabled={alreadyAdded || isAdding}
                                  onClick={() => void handleAddProductToCollection(product._id)}
                                  className={alreadyAdded || isAdding ? collectionMutedAddButtonClass : collectionPrimaryButtonClass}
                                >
                                  {alreadyAdded ? 'Added' : isAdding ? 'Adding…' : 'Add'}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="px-4 py-8 text-center text-sm text-gray-500">No products found</p>
                      )}
                    </div>
                  ) : collectionEntriesLoading ? (
                    <p className="py-6 text-center text-sm text-gray-500">Loading products…</p>
                  ) : displayedEntries.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-[13px] text-gray-500">No products in this collection yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white text-left">
                      {displayedEntries.map((entry, index) => {
                        const imageUrl = getEntryImageUrl(entry);
                        return (
                          <div key={entry._id} className={collectionProductRowClass}>
                            <span className="w-6 shrink-0 text-right text-[12px] text-gray-400">{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleNavigateToProduct(entry.productId._id)}
                              className="h-9 w-9 overflow-hidden rounded-md border border-gray-200 bg-gray-50"
                            >
                              {imageUrl ? (
                                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                  <RectangleStackIcon className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNavigateToProduct(entry.productId._id)}
                              className="min-w-0 flex-1 truncate text-left text-[13px] font-medium text-gray-900 hover:text-gray-700"
                            >
                              {entry.productId.title}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRemoveProductFromCollection(entry._id)}
                              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                              aria-label={`Remove ${entry.productId.title}`}
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <CollectionSeoSection
              pageTitle={form.pageTitle}
              metaDescription={form.metaDescription}
              urlHandle={form.urlHandle}
              expanded={isSeoExpanded}
              onToggleExpanded={() => setIsSeoExpanded((prev) => !prev)}
              onPageTitleChange={(value) => handleChange('pageTitle', value)}
              onMetaDescriptionChange={(value) => handleChange('metaDescription', value)}
              onUrlHandleChange={(value) => handleChange('urlHandle', value)}
            />
          </div>

          <aside className={productFormAsideStackClass(FORM_APPEARANCE)}>
            <CollectionPublishingSection
              status={form.status}
              onStatusChange={(status) => handleChange('status', status)}
            />

            <CollectionThemeTemplateSection
              storeId={collection?.storeId}
              value={form.themeTemplate || 'default'}
              onChange={(themeTemplate) => handleChange('themeTemplate', themeTemplate)}
              appearance={FORM_APPEARANCE}
            />

            <CollectionImageSidebarSection
              imageUrl={form.imageUrl}
              imageAlt={form.imageAltText || form.title || 'Collection'}
              onImageUrlChange={(url) => handleChange('imageUrl', url)}
              onEditAltText={
                form.imageUrl
                  ? () => {
                      setImageAltTextDraft(form.imageAltText);
                      setIsImageAltModalOpen(true);
                    }
                  : undefined
              }
            />

            <section className={productFormCardClass(FORM_APPEARANCE)}>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-[13px] font-normal text-red-600 transition-colors hover:bg-red-50"
              >
                Delete collection
              </button>
            </section>
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
                handleChange('imageAltText', imageAltTextDraft.trim());
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
              <img
                src={form.imageUrl}
                alt={form.imageAltText || 'Collection'}
                className="h-full w-full object-cover"
              />
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
        title={<h2 className="text-xl font-semibold text-gray-900">Add products</h2>}
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
              onClick={() => void handleAddSelectedProducts()}
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
                className={`${collectionInputClass} h-11 pl-10 pr-10`}
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

          <div className="rounded-xl border border-gray-100 bg-white">
            {isProductsSearching ? (
              <div className="px-4 py-16 text-center text-sm text-gray-500">Searching products…</div>
            ) : sortedProductSearchResults.length > 0 ? (
              <ul className="max-h-[340px] divide-y divide-gray-100 overflow-y-auto">
                {sortedProductSearchResults.map((product) => {
                  const isChecked = selectedProductIds.has(product._id);
                  const alreadyAdded = existingProductIds.has(product._id);
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
                        disabled={alreadyAdded}
                        onChange={(e) => handleToggleProductSelection(product._id, e.target.checked)}
                        aria-label={`Select ${product.title}`}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-300 disabled:opacity-40"
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
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{product.title}</p>
                      {alreadyAdded ? (
                        <span className="text-xs font-medium text-gray-400">Added</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-16 text-center text-sm text-gray-500">
                {productSearchQuery.trim() ? 'No products found' : 'Search to find products'}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <DeleteCollectionModal
        isOpen={confirmOpen}
        collectionTitle={collection.title}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteCollection}
      />
    </div>
  );
};

export default ProductCollectionDetailsPage;
