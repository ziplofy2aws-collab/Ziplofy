import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ProductsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProduct = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  return (
    <div className="mb-5 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="pl-3 border-l-4 border-blue-500/70">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your store catalog</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          Catalog
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-500">Tip: click a row to open product details</p>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Product
        </button>
      </div>
    </div>
  );
};

export default ProductsPageHeader;

