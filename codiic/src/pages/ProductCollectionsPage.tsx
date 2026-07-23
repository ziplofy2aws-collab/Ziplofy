import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionsPageFilters, {
  type CollectionFilterTab,
} from "../components/collections/CollectionsPageFilters";
import CollectionsPageHeader from "../components/collections/CollectionsPageHeader";
import CollectionsTable from "../components/collections/CollectionsTable";
import { useCollections } from "../contexts/collection.context";
import { useStore } from "../contexts/store.context";

const ProductCollectionsPage: React.FC = () => {
  const { collections, fetchCollectionsByStoreId, loading } = useCollections();
  const { activeStoreId } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CollectionFilterTab>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (activeStoreId) {
      fetchCollectionsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchCollectionsByStoreId]);

  const handleAddCollection = useCallback(() => {
    navigate("/products/collections/new");
  }, [navigate]);

  const handleCollectionClick = useCallback(
    (collectionId: string) => {
      navigate(`/products/collections/${collectionId}`);
    },
    [navigate]
  );

  const filteredCollections = useMemo(() => {
    const list = collections || [];
    const byTab = list.filter((collection) => {
      if (activeTab === "All") return true;
      return activeTab === "Published"
        ? collection.status === "published"
        : collection.status === "draft";
    });

    const query = search.trim().toLowerCase();
    if (!query) return byTab;

    return byTab.filter((collection) => {
      return (
        collection.title.toLowerCase().includes(query) ||
        collection.pageTitle.toLowerCase().includes(query) ||
        collection.urlHandle.toLowerCase().includes(query)
      );
    });
  }, [collections, activeTab, search]);

  const hasCollections = (collections || []).length > 0;
  const showInitialSkeleton = loading && !hasCollections;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <CollectionsPageHeader />

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <CollectionsPageFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
          />

          {showInitialSkeleton ? (
            <CollectionsTable
              collections={[]}
              loading
              onCollectionClick={handleCollectionClick}
            />
          ) : !hasCollections ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-gray-900">Add your collections</p>
              <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                Group products into collections your customers can browse
              </p>
              <button
                type="button"
                onClick={handleAddCollection}
                className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                Add collection
              </button>
            </div>
          ) : (
            <CollectionsTable
              collections={filteredCollections}
              onCollectionClick={handleCollectionClick}
            />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Learn more about collections
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCollectionsPage;
