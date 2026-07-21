import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface VariantNotFoundProps {
  productId?: string;
  onBack?: () => void;
}

const VariantNotFound: React.FC<VariantNotFoundProps> = ({ productId, onBack }) => {
  const navigate = useNavigate();
  
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (productId) {
      navigate(`/products/${productId}`);
    } else {
      navigate('/products');
    }
  }, [navigate, onBack, productId]);

  return (
    <div className="min-h-screen bg-page-background-color flex items-center justify-center p-4">
      <div className="bg-white p-12 text-center rounded-xl border border-gray-200/80 shadow-sm max-w-lg w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Variant Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The variant you're looking for doesn't exist.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Product
          </button>
      </div>
    </div>
  );
};

export default VariantNotFound;

