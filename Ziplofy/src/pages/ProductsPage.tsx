import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmUndeleteProductModal from "../components/ConfirmUndeleteProductModal";
import ProductsPageEmptyState from "../components/products/ProductsPageEmptyState";
import ProductsPageFilters from "../components/products/ProductsPageFilters";
import ProductsPageHeader from "../components/products/ProductsPageHeader";
import ProductsTable from "../components/products/ProductsTable";
import { Product, useProducts } from "../contexts/product.context";
import { useStore } from "../contexts/store.context";

type FilterTab = "All" | "Active" | "Draft";

const ProductsPage: React.FC = () => {
  const { products, fetchProductsByStoreId, updateProduct } = useProducts();
  const { activeStoreId } = useStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [restoreCandidate, setRestoreCandidate] = useState<Product | null>(null);
  const [restoringProduct, setRestoringProduct] = useState(false);

  useEffect(() => {
    if (activeStoreId) {
      fetchProductsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchProductsByStoreId]);

  const counts = useMemo(() => {
    const list = products || [];
    return {
      All: list.length,
      Active: list.filter((p) => p.status === "active").length,
      Draft: list.filter((p) => p.status === "draft").length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = products || [];
    const byTab = list.filter((p) => {
      if (activeTab === "All") return true;
      return activeTab === "Active" ? p.status === "active" : p.status === "draft";
    });
    const q = search.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((p) => {
      const categoryName = typeof p.category === "object" ? p.category?.name : String(p.category || "");
      return (
        p.title.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [products, activeTab, search]);

  const handleOpenUndeleteModal = (product: Product) => {
    setRestoreCandidate(product);
  };

  const handleCloseUndeleteModal = () => {
    setRestoreCandidate(null);
  };

  const handleConfirmUndelete = async () => {
    if (!restoreCandidate) return;
    try {
      setRestoringProduct(true);
      await updateProduct(restoreCandidate._id, { isDeleted: false });
      toast.success("Product restored");
      setRestoreCandidate(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to un-delete product";
      toast.error(message);
    } finally {
      setRestoringProduct(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <ProductsPageHeader />
        <ProductsPageFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          counts={counts}
        />

        <div>
          {(!filteredProducts || filteredProducts.length === 0) ? (
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
              <ProductsPageEmptyState />
            </div>
          ) : (
            <ProductsTable
              products={filteredProducts}
              viewMode={viewMode}
              onUndeleteProduct={handleOpenUndeleteModal}
            />
          )}
        </div>
      </div>
      <ConfirmUndeleteProductModal
        isOpen={Boolean(restoreCandidate)}
        productTitle={restoreCandidate?.title || ""}
        undeletingProduct={restoringProduct}
        onClose={handleCloseUndeleteModal}
        onConfirm={handleConfirmUndelete}
      />
    </div>
  );
};

export default ProductsPage;