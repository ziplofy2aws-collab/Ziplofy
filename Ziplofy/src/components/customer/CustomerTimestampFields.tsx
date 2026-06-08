import React from 'react';

interface CustomerTimestampFieldsProps {
  createdAt: string;
  updatedAt: string;
}

const CustomerTimestampFields: React.FC<CustomerTimestampFieldsProps> = ({
  createdAt,
  updatedAt,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
      <div>
        <p className="text-xs text-gray-600 mb-1">Created At</p>
        <p className="text-sm text-gray-900">{new Date(createdAt).toLocaleDateString()}</p>
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-1">Updated At</p>
        <p className="text-sm text-gray-900">{new Date(updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default CustomerTimestampFields;

