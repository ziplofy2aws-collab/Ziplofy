import { TagIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ProductsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProduct = useCallback(() => {
    navigate("/products/new");
  }, [navigate]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <TagIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Products</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
        >
          Add product
        </button>
      </div>
    </div>
  );
};

export default ProductsPageHeader;
