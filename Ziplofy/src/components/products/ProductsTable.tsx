import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../contexts/product.context";
import ProductTableRow from "./ProductTableRow";

interface ProductsTableProps {
  products: Product[];
  onUndeleteProduct?: (product: Product) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, onUndeleteProduct }) => {
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="w-10 px-3 py-2.5 text-center">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => handleSelectAllVisible(e.target.checked)}
                aria-label="Select all products"
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-gray-900 focus:ring-gray-300"
              />
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Product</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Status</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Inventory</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Category</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Channels</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Product type</th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Vendor</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {products.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No products found</p>
                <p className="mt-1.5 text-[13px] font-normal text-gray-500">
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
