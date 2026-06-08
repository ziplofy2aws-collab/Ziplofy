import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface BillingTaxIdSectionProps {
  onAddGstin: () => void;
}

const BillingTaxIdSection: React.FC<BillingTaxIdSectionProps> = ({ onAddGstin }) => {
  const handleAddGstin = useCallback(() => {
    onAddGstin();
  }, [onAddGstin]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-base font-semibold text-gray-900">Tax ID</h2>
        <InformationCircleIcon className="w-4 h-4 text-gray-500" />
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Ziplofy is required to charge Goods and Services Tax (GST) in India. Your bills may be exempt
        from Indian GST if you are GST registered in India and enter a valid GSTIN.
      </p>
      <button
        type="button"
        onClick={handleAddGstin}
        className="w-full rounded-lg px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-start"
      >
        + Add GSTIN
      </button>
    </div>
  );
};

export default BillingTaxIdSection;

