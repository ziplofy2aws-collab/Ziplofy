import React, { useCallback } from 'react';

interface BillingHeaderProps {
  onNavigateToProfile: () => void;
}

const BillingHeader: React.FC<BillingHeaderProps> = ({ onNavigateToProfile }) => {
  const handleNavigateToProfile = useCallback(() => {
    onNavigateToProfile();
  }, [onNavigateToProfile]);

  return (
    <div className="flex flex-row justify-between items-center mb-4 border-b border-gray-200 pb-4">
      <h1 className="text-xl font-medium text-gray-900">
        Billing
      </h1>
      <button
        className="cursor-pointer px-3 py-1.5 border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={handleNavigateToProfile}
      >
        Billing profile
      </button>
    </div>
  );
};

export default BillingHeader;

