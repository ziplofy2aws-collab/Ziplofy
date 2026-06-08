import React from 'react';

interface CustomerSettingsInfoFieldsProps {
  language: string;
  collectTax: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  storeId: string;
}

const CustomerSettingsInfoFields: React.FC<CustomerSettingsInfoFieldsProps> = ({
  language,
  collectTax,
  storeId,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-600 mb-1">Language</p>
        <p className="text-sm text-gray-900">{language}</p>
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-1">Collect Tax</p>
        <p className="text-sm text-gray-900 capitalize">
          {collectTax === 'collect'
            ? 'Collect Tax'
            : collectTax === 'dont_collect'
            ? "Don't Collect Tax"
            : 'Collect Tax Unless Exempt'}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-1">Store ID</p>
        <p className="text-xs text-gray-700 font-mono">{storeId}</p>
      </div>
    </div>
  );
};

export default CustomerSettingsInfoFields;

