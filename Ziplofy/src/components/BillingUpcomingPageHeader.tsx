import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface BillingUpcomingPageHeaderProps {
  onBack: () => void;
}

const BillingUpcomingPageHeader: React.FC<BillingUpcomingPageHeaderProps> = ({ onBack }) => {
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <>
      <div className='flex items-center gap-3 mb-4 pb-4 border-b border-gray-200'>
        <button
          onClick={handleBack}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium text-gray-900">
          Upcoming bill
        </h1>
      </div>
      <p className="text-xs text-gray-600 mb-4">
        My Store has charges on this bill
      </p>
    </>
  );
};

export default BillingUpcomingPageHeader;

