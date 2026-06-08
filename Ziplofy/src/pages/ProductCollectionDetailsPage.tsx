import {
  ArrowLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AddProductsToCollectionSection from '../components/collections/AddProductsToCollectionSection';
import DeleteCollectionModal from '../components/collections/DeleteCollectionModal';
import EditCollectionModal from '../components/collections/EditCollectionModal';
import ProductsInCollectionSection from '../components/collections/ProductsInCollectionSection';
import SelectedProductsToAddSection from '../components/collections/SelectedProductsToAddSection';
import { useCollectionEntries } from '../contexts/collection-entries.context';
import type { UpdateCollectionPayload } from '../contexts/collection.context';
import { useCollections } from '../contexts/collection.context';
import { useProducts } from '../contexts/product.context';

const ProductCollectionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { collections, deleteCollection, updateCollection } = useCollections();
  const { fetchProductsByStoreId, searchBasic } = useProducts();
  const {
    createCollectionEntry,
    deleteCollectionEntry,
    fetchCollectionEntriesByCollectionId,
    collectionEntries,
    loading: collectionEntriesLoading,
  } = useCollectionEntries();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const collection = collections.find((c) => c._id === id);

  const initialEdit = useMemo(
    () => ({
      title: collection?.title || '',
      imageUrl: collection?.imageUrl || '',
      imageAltText: collection?.imageAltText || '',
      description: collection?.description || '',
      pageTitle: collection?.pageTitle || '',
      metaDescription: collection?.metaDescription || '',
      urlHandle: collection?.urlHandle || '',
      productSort:
        (collection?.productSort as
          | 'manual'
          | 'title-asc'
          | 'title-desc'
          | 'price-high'
          | 'price-low'
          | 'newest'
          | 'oldest') || 'manual',
      status: (collection?.status as 'draft' | 'published') || 'published',
    }),
    [collection]
  );
  const [editForm, setEditForm] = useState(initialEdit);
  useEffect(() => {
    setEditForm(initialEdit);
  }, [initialEdit]);

  const changedEditPayload = useMemo(() => {
    const payload: Record<string, string> = {};
    const keys = Object.keys(initialEdit) as Array<keyof typeof initialEdit>;
    keys.forEach((key) => {
      if (editForm[key] !== initialEdit[key]) {
        payload[key] = editForm[key] as string;
      }
    });
    return payload;
  }, [editForm, initialEdit]);

  const hasEditChanges = Object.keys(changedEditPayload).length > 0;

  useEffect(() => {
    if (collection?.storeId) {
      fetchProductsByStoreId(collection.storeId);
    }
  }, [collection?.storeId, fetchProductsByStoreId]);

  useEffect(() => {
    if (id) {
      fetchCollectionEntriesByCollectionId(id);
    }
  }, [id, fetchCollectionEntriesByCollectionId]);

  useEffect(() => {
    let cancelled = false;
    const doSearch = async () => {
      const q = searchQuery.trim();
      if (!q) {
        setFilteredProducts([]);
        return;
      }
      try {
        const res = await searchBasic({ q, storeId: collection?.storeId });
        if (!cancelled) setFilteredProducts(res as any);
      } catch {
        if (!cancelled) setFilteredProducts([]);
      }
    };

    const timeoutId = setTimeout(() => {
      doSearch();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, searchBasic, collection?.storeId]);

  const handleBack = useCallback(() => {
    navigate('/products/collections');
  }, [navigate]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleProductSelect = useCallback(
    (product: any) => {
      const isAlreadySelected = selectedProducts.some((p) => p._id === product._id);
      if (!isAlreadySelected) {
        setSelectedProducts((prev) => [...prev, product]);
      }
      handleSearchClose();
    },
    [selectedProducts, handleSearchClose]
  );

  const handleRemoveProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
  }, []);

  const handleAddProductsToCollection = useCallback(async () => {
    if (!collection?._id || selectedProducts.length === 0) return;
    try {
      const promises = selectedProducts.map((product) =>
        createCollectionEntry({
          collectionId: collection._id,
          productId: product._id,
        })
      );
      await Promise.all(promises);
      setSelectedProducts([]);
    } catch (error) {
      console.error('Failed to add products to collection:', error);
    }
  }, [collection?._id, selectedProducts, createCollectionEntry]);

  const handleRemoveProductFromCollection = useCallback(
    async (entryId: string) => {
      try {
        await deleteCollectionEntry(entryId);
      } catch (error) {
        console.error('Failed to remove product from collection:', error);
      }
    },
    [deleteCollectionEntry]
  );

  const handleDeleteCollection = useCallback(async () => {
    if (collection?._id) {
      try {
        await deleteCollection(collection._id);
      } finally {
        navigate('/products/collections');
      }
    } else {
      setConfirmOpen(false);
    }
  }, [collection?._id, deleteCollection, navigate]);

  const handleUpdateCollection = useCallback(async () => {
    if (!collection?._id) {
      setEditOpen(false);
      return;
    }
    if (!hasEditChanges) {
      setEditOpen(false);
      return;
    }
    try {
      const patchPayload: UpdateCollectionPayload = { ...changedEditPayload };
      if (Object.prototype.hasOwnProperty.call(patchPayload, 'imageUrl')) {
        patchPayload.imageUrl = editForm.imageUrl || undefined;
      }
      if (Object.prototype.hasOwnProperty.call(patchPayload, 'imageAltText')) {
        patchPayload.imageAltText = editForm.imageAltText || undefined;
      }
      await updateCollection(collection._id, patchPayload);
      setEditOpen(false);
    } catch {}
  }, [collection?._id, changedEditPayload, editForm.imageAltText, editForm.imageUrl, hasEditChanges, updateCollection]);

  const handleProductClick = useCallback(
    (product: any) => {
      handleProductSelect(product);
    },
    [handleProductSelect]
  );

  const handleNavigateToProduct = useCallback(
    (productId: string) => {
      if (productId) {
        navigate(`/products/${productId}`);
      }
    },
    [navigate]
  );

  const handleRemoveProductWithStopPropagation = useCallback(
    (e: React.MouseEvent, entryId: string) => {
      e.stopPropagation();
      handleRemoveProductFromCollection(entryId);
    },
    [handleRemoveProductFromCollection]
  );

  const handleEditFormChange = useCallback(
    (field: keyof typeof editForm, value: string | 'draft' | 'published') => {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const productCount = collectionEntries.length;

  if (!collection) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Collections
          </button>
          <div className="flex flex-col items-center rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center shadow-sm sm:py-20">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
              <FolderIcon className="h-8 w-8 text-gray-400" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Collection not found</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              This collection isn&apos;t loaded yet or doesn&apos;t exist. Open it from the collections list or
              check the link.
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="mt-8 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Back to collections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Collections
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RectangleStackIcon className="h-5 w-5 text-blue-600" aria-hidden />
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{collection.title}</h1>
                </div>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>
              {collection.description ? (
                <div
                  className="prose prose-sm mt-2 max-w-none text-gray-600
                    [&_h1]:my-2 [&_h1]:text-2xl [&_h1]:font-semibold
                    [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold
                    [&_h3]:my-1.5 [&_h3]:text-lg [&_h3]:font-semibold
                    [&_p]:my-1.5 [&_p]:leading-relaxed
                    [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
                    [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
                    [&_img]:my-2 [&_img]:max-h-64 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-gray-200
                    [&_iframe]:my-2 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-md [&_iframe]:border [&_iframe]:border-gray-200"
                  dangerouslySetInnerHTML={{ __html: collection.description }}
                />
              ) : (
                <p className="mt-2 text-sm text-gray-400">No description</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold text-gray-900">Products</h2>
              <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                <AddProductsToCollectionSection
                  searchQuery={searchQuery}
                  filteredProducts={filteredProducts}
                  selectedProducts={selectedProducts}
                  onSearchChange={handleSearchChange}
                  onProductSelect={handleProductClick}
                />
                <SelectedProductsToAddSection
                  selectedProducts={selectedProducts}
                  loading={collectionEntriesLoading}
                  onRemoveProduct={handleRemoveProduct}
                  onAddProducts={handleAddProductsToCollection}
                  onClearAll={() => setSelectedProducts([])}
                />
                <ProductsInCollectionSection
                  collectionEntries={collectionEntries}
                  loading={collectionEntriesLoading}
                  onProductClick={handleNavigateToProduct}
                  onRemoveProduct={handleRemoveProductWithStopPropagation}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Search engine listing</h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Edit search engine listing"
                >
                  <ChevronRightIcon className="h-4 w-4 -rotate-45" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{collection.pageTitle || collection.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                https://your-store.com/collections/{collection.urlHandle || ''}
              </p>
              <p className="mt-2 text-sm text-gray-500">{collection.metaDescription || 'No meta description'}</p>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Publishing</h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  {collection.status === 'published' ? 'Published' : 'Draft'}
                </p>
                <p>
                  <span className="font-medium">Sort:</span> {collection.productSort || 'manual'}
                </p>
                <p>
                  <span className="font-medium">Products:</span> {productCount}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Image</h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
              {collection.imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={collection.imageUrl}
                    alt={collection.imageAltText || collection.title}
                    className="h-44 w-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400">No image</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold text-gray-900">Theme template</h2>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <select
                  value="default"
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                >
                  <option value="default">Default collection</option>
                </select>
              </div>
            </section>

            <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Delete collection
              </button>
            </section>
          </aside>
        </div>
      </div>

      <EditCollectionModal
        isOpen={editOpen}
        formData={editForm}
        onChange={handleEditFormChange}
        onClose={() => setEditOpen(false)}
        onUpdate={handleUpdateCollection}
        hasChanges={hasEditChanges}
      />

      <DeleteCollectionModal
        isOpen={confirmOpen}
        collectionTitle={collection?.title}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteCollection}
      />
    </div>
  );
};

export default ProductCollectionDetailsPage;
