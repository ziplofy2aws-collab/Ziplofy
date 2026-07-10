import { PlusIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CollectionsTable from '../components/collections/CollectionsTable';
import { useCollections } from '../contexts/collection.context';
import { useStore } from '../contexts/store.context';

type SortOrder = 'asc' | 'desc';

const ProductCollectionsPage: React.FC = () => {
  const { collections, fetchCollectionsByStoreId, loading } = useCollections();
  const { activeStoreId } = useStore();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (activeStoreId) {
      fetchCollectionsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchCollectionsByStoreId]);

  const handleAddCollection = useCallback(() => {
    navigate('/products/collections/new');
  }, [navigate]);

  const handleCollectionClick = useCallback(
    (collectionId: string) => {
      navigate(`/products/collections/${collectionId}`);
    },
    [navigate]
  );

  const sortedCollections = useMemo(() => {
    const sorted = [...collections].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [collections, sortOrder]);

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="pl-3 border-l-4 border-blue-500/60">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Collections</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organize your products into collections</p>
          </div>
          <button
            onClick={handleAddCollection}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Collection
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && collections.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm min-h-[320px] flex justify-center items-center p-12">
            <div className="flex flex-col justify-center items-center text-center gap-4 max-w-md">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <RectangleStackIcon className="w-7 h-7 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">No collections found for this store.</p>
              <button
                onClick={handleAddCollection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Collection
              </button>
            </div>
          </div>
        )}

        {/* Collections Table */}
        {!loading && collections.length > 0 && (
          <CollectionsTable
            collections={sortedCollections}
            onCollectionClick={handleCollectionClick}
            sortOrder={sortOrder}
            onSortToggle={handleSortToggle}
          />
        )}
      </div>
    </div>
  );
};

export default ProductCollectionsPage;


