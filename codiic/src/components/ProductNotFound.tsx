import { ArrowLeftIcon, CubeIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductNotFoundProps {
  onBack?: () => void;
}

const ProductNotFound: React.FC<ProductNotFoundProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-background-color p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200/80 bg-white text-center shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-6 py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
            <CubeIcon className="h-8 w-8 text-gray-400" aria-hidden />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Product not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            This product may have been removed or the link is incorrect. Return to your catalog to continue.
          </p>
        </div>
        <div className="p-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back to products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductNotFound;
