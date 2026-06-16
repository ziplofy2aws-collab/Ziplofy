import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  PlusIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ProductsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProduct = useCallback(() => {
    navigate("/products/new");
  }, [navigate]);

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <TagIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-medium text-gray-900">Products</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-600 transition-colors hover:bg-gray-50"
        >
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
          Export
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-600 transition-colors hover:bg-gray-50"
        >
          <ArrowUpTrayIcon className="h-3.5 w-3.5" />
          Import
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-600 transition-colors hover:bg-gray-50"
        >
          More actions
          <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
        </button>
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add product
        </button>
      </div>
    </div>
  );
};

export default ProductsPageHeader;
