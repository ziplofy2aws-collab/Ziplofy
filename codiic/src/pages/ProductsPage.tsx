import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ConfirmUndeleteProductModal from "../components/ConfirmUndeleteProductModal";
import ProductsPageFilters from "../components/products/ProductsPageFilters";
import ProductsPageHeader from "../components/products/ProductsPageHeader";
import ProductsTable from "../components/products/ProductsTable";
import { Product, useProducts } from "../contexts/product.context";
import { useStore } from "../contexts/store.context";

type FilterTab = "All" | "Active" | "Draft";

const ProductsPage: React.FC = () => {
  const { products, fetchProductsByStoreId, updateProduct, loading } = useProducts();
  const { activeStoreId } = useStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [restoreCandidate, setRestoreCandidate] = useState<Product | null>(null);
  const [restoringProduct, setRestoringProduct] = useState(false);

  useEffect(() => {
    if (activeStoreId) {
      fetchProductsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchProductsByStoreId]);

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
      const productTypeName =
        typeof p.productType === "object" ? p.productType?.name : String(p.productType || "");
      const vendorName = typeof p.vendor === "object" ? p.vendor?.name : String(p.vendor || "");
      return (
        p.title.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        productTypeName.toLowerCase().includes(q) ||
        vendorName.toLowerCase().includes(q)
      );
    });
  }, [products, activeTab, search]);

  const hasProducts = (products || []).length > 0;
  const showInitialSkeleton = loading && !hasProducts;

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
    <div className="w-full">
      <div className="mx-auto max-w-[1000px]">
        <ProductsPageHeader />

        {/* White surface on #f1f1f1 canvas — same pop hierarchy as Shopify */}
        <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
          <ProductsPageFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            search={search}
            onSearchChange={setSearch}
          />

          {showInitialSkeleton ? (
            <ProductsTable products={[]} loading />
          ) : !hasProducts ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-admin-text">Add your products</p>
              <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
                Start by stocking your store with products your customers will love
              </p>
            </div>
          ) : (
            <ProductsTable
              products={filteredProducts}
              onUndeleteProduct={handleOpenUndeleteModal}
            />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className="text-[#005bd3] hover:underline">
              Learn more about products
            </a>
          </p>
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
