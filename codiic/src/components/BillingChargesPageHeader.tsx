import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface BillingChargesPageHeaderProps {
  onBack: () => void;
}

const BillingChargesPageHeader: React.FC<BillingChargesPageHeaderProps> = ({ onBack }) => {
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <div className="flex flex-row items-center gap-3 mb-4 border-b border-gray-200 pb-4">
      <button
        onClick={handleBack}
        className="cursor-pointer p-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <h1 className="text-xl font-medium text-gray-900">
        Charges
      </h1>
    </div>
  );
};

export default BillingChargesPageHeader;

