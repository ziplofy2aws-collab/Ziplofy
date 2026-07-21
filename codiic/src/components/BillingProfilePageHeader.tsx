import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface BillingProfilePageHeaderProps {
  onBack: () => void;
}

const BillingProfilePageHeader: React.FC<BillingProfilePageHeaderProps> = ({ onBack }) => {
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <div className='flex items-center gap-3 mb-4 border-b border-gray-200 pb-4'>
      <button
        onClick={handleBack}
        className="cursor-pointer p-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>

      <h1 className="text-xl font-medium text-gray-900">
        Billing profile
      </h1>
    </div>
  );
};

export default BillingProfilePageHeader;

