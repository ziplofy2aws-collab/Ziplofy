import React, { useCallback } from "react";
import { Product } from "../../contexts/product.context";
import { useStore } from "../../contexts/store.context";

interface ProductTableRowProps {
  product: Product;
  isSelected?: boolean;
  onSelect?: (productId: string, checked: boolean) => void;
  onRowClick: (productId: string) => void;
  onUndeleteProduct?: (product: Product) => void;
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  isSelected,
  onSelect,
  onRowClick,
  onUndeleteProduct,
}) => {
  const { activeStoreId, stores } = useStore();
  const storeName = stores.find((s) => s._id === activeStoreId)?.storeName;

  const handleClick = useCallback(() => {
    onRowClick(product._id);
  }, [product._id, onRowClick]);

  const handleUndeleteClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onUndeleteProduct?.(product);
  }, [onUndeleteProduct, product]);

  const categoryName =
    product.category && typeof product.category === "object" && product.category.name
      ? product.category.name
      : "Uncategorized";
  const productTypeName =
    product.productType && typeof product.productType === "object" ? product.productType.name : "";
  const vendorName =
    product.vendor && typeof product.vendor === "object"
      ? product.vendor.name
      : storeName || "My Store";
  const channelCount =
    Number(product.onlineStorePublishing) + Number(product.pointOfSalePublishing);
  const inventoryLabel = product.inventoryTrackingEnabled
    ? `${typeof product.quantity === "number" ? product.quantity : 0} in stock`
    : "Inventory not tracked";
  const preview = product.imageUrls?.[0];

  return (
    <tr
      className={`group cursor-pointer border-b border-admin-divider transition-colors last:border-b-0 ${
        isSelected ? "bg-admin-row-hover" : "bg-admin-surface hover:bg-admin-row-hover"
      }`}
      onClick={handleClick}
    >
      <td
        className="w-10 px-3 py-2.5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={Boolean(isSelected)}
          onChange={(e) => onSelect?.(product._id, e.target.checked)}
          aria-label={`Select product ${product.title}`}
          className="h-3.5 w-3.5 cursor-pointer rounded border-[#8c9196] text-admin-text focus:ring-[#005bd3]/30"
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex min-w-[180px] items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin-border bg-admin-secondary">
            {preview ? (
              <img src={preview} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[11px] font-normal text-admin-text-subdued">
                {product.title.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-admin-text">{product.title}</p>
            {product.isDeleted ? (
              <div className="mt-0.5 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#fee2e2] px-1.5 py-0.5 text-[10px] font-medium text-[#8e1b1b]">
                  Deleted
                </span>
                <button
                  type="button"
                  onClick={handleUndeleteClick}
                  className="text-[11px] font-medium text-[#005bd3] hover:underline"
                >
                  Un-delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-admin-text-secondary">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${
            product.status === "active"
              ? "bg-[#cdfee1] text-[#0c5132]"
              : "bg-admin-secondary text-admin-text-secondary"
          }`}
        >
          {product.status === "active" ? "Active" : "Draft"}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">{inventoryLabel}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">{categoryName}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">{channelCount}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">{productTypeName}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-admin-text-secondary">{vendorName}</td>
    </tr>
  );
};

export default ProductTableRow;
