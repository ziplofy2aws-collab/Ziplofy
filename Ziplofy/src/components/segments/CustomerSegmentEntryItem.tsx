import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface CustomerSegmentEntryItemProps {
  entry: {
    _id: string;
    customerId: string | {
      fullName?: string;
      firstName?: string;
      lastName?: string;
    };
    createdAt: string | Date;
  };
  onDelete: (entry: CustomerSegmentEntryItemProps['entry']) => void;
}

const CustomerSegmentEntryItem: React.FC<CustomerSegmentEntryItemProps> = ({
  entry,
  onDelete,
}) => {
  const getCustomerName = useCallback((customerId: any) => {
    if (typeof customerId === 'string') {
      return customerId;
    }
    return customerId.fullName || `${customerId.firstName || ''} ${customerId.lastName || ''}`.trim();
  }, []);

  const handleDelete = useCallback(() => {
    onDelete(entry);
  }, [entry, onDelete]);

  return (
    <div className="flex justify-between items-center py-3 px-4 hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-900">{getCustomerName(entry.customerId)}</span>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
        <button
          onClick={handleDelete}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          aria-label="delete"
        >
          <TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default CustomerSegmentEntryItem;

