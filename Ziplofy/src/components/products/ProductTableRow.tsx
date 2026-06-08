import React, { useCallback } from "react";
import { Product } from "../../contexts/product.context";

interface ProductTableRowProps {
  product: Product;
  onRowClick: (productId: string) => void;
  onUndeleteProduct?: (product: Product) => void;
}

const ProductTableRow: React.FC<ProductTableRowProps> = ({ product, onRowClick, onUndeleteProduct }) => {
  const handleClick = useCallback(() => {
    onRowClick(product._id);
  }, [product._id, onRowClick]);

  const handleUndeleteClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onUndeleteProduct?.(product);
  }, [onUndeleteProduct, product]);

  const categoryName = product.category && typeof product.category === "object" ? product.category.name : "—";
  const preview = product.imageUrls?.[0];

  return (
    <tr 
      className="hover:bg-blue-50/40 cursor-pointer transition-colors even:bg-gray-50/30"
      onClick={handleClick}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-[260px]">
          <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {preview ? (
              <img src={preview} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-gray-500">{product.title.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 leading-tight truncate">{product.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{categoryName} · {product.sku || "No SKU"}</p>
            {product.isDeleted ? (
              <span className="mt-1 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                Deleted
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">₹{Number(product.price).toFixed(2)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 capitalize">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          product.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}>
          {product.status === "active" ? "Published" : "Draft"}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
        <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
          {typeof product.quantity === 'number' ? product.quantity : 0}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{new Date(product.updatedAt).toLocaleString()}</td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        {product.isDeleted ? (
          <button
            type="button"
            onClick={handleUndeleteClick}
            className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Un-delete
          </button>
        ) : null}
      </td>
    </tr>
  );
};

export default ProductTableRow;

