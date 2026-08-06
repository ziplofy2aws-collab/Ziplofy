import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../contexts/product.context";
import ProductTableRow from "./ProductTableRow";
import { ProductsTableSkeletonRows } from "./ProductsTableSkeleton";

interface ProductsTableProps {
  products: Product[];
  loading?: boolean;
  onUndeleteProduct?: (product: Product) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  loading = false,
  onUndeleteProduct,
}) => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const handleRowClick = useCallback((productId: string) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const visibleIds = useMemo(() => products.map((product) => product._id), [products]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectRow = useCallback((productId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  const handleSelectAllVisible = useCallback((checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleIds.forEach((id) => next.add(id));
      } else {
        visibleIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  }, [visibleIds]);

  return (
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          {/* Shopify IndexTable header: soft #f7f7f7 strip + muted 12px labels */}
          <tr className="border-b border-admin-border bg-admin-table-header">
            <th scope="col" className="w-10 px-3 py-2 text-center align-middle">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                disabled={loading}
                aria-label="Select all products"
                className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </th>
            {(
              [
                "Product",
                "Status",
                "Inventory",
                "Category",
                "Channels",
                "Product type",
                "Vendor",
              ] as const
            ).map((label) => (
              <th
                key={label}
                scope="col"
                className="whitespace-nowrap px-3 py-2 align-middle text-left text-[12px] font-medium leading-5 tracking-normal text-[#616161]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
          {loading ? (
            <ProductsTableSkeletonRows />
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-admin-text">No products found</p>
                <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
                  Try changing the filters or search term
                </p>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <ProductTableRow
                key={product._id}
                product={product}
                isSelected={selectedIds.has(product._id)}
                onSelect={handleSelectRow}
                onRowClick={handleRowClick}
                onUndeleteProduct={onUndeleteProduct}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
