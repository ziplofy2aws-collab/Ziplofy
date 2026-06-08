import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/outline";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ProductsPageEmptyState: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProduct = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-16 px-6">
      {/* Product Illustrations */}
      <div className="relative w-64 h-40 mb-8">
        <div className="absolute top-0 right-4 w-16 h-10 bg-blue-600 rounded-lg transform -rotate-12" />
        <div className="absolute top-4 right-0 w-8 h-16 bg-blue-500 rounded-lg" />
        <div className="absolute bottom-8 right-10 w-12 h-6 bg-blue-400 rounded-lg transform rotate-6" />
        <div className="absolute bottom-4 right-0 w-14 h-5 flex items-center gap-1 transform -rotate-12">
          <div className="w-6 h-4 bg-blue-300 rounded-full" />
          <div className="w-1 h-1 bg-blue-400 rounded" />
          <div className="w-6 h-4 bg-blue-300 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
        Add your products
      </h2>
      
      <p className="mb-6 text-sm text-gray-600">
        Start by stocking your store with products your customers will love
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add product
        </button>
        
        <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-blue-200 transition-colors">
          <ArrowDownTrayIcon className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md border-t border-gray-200 my-6" />

      {/* Find Products Section */}
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">
        Find products to sell
      </h3>
      
      <p className="mb-6 text-sm text-gray-600 max-w-lg">
        Have dropshipping or print on demand products shipped directly from the supplier to your customer, and only pay for what you sell.
      </p>

      <button className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-blue-200 transition-colors">
        Browse product sourcing apps
      </button>
    </div>
  );
};

export default ProductsPageEmptyState;

