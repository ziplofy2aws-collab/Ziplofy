import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import {
  getCustomerFromSegmentEntry,
  segmentSecondaryButtonClass,
  segmentTableCellClass,
  segmentTableCellRightClass,
} from './customer-segment-ui.util';

interface CustomerSegmentEntryItemProps {
  entry: {
    _id: string;
    customerId: string | {
      _id?: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    createdAt: string | Date;
  };
  onDelete: (entry: CustomerSegmentEntryItemProps['entry']) => void;
  onCustomerClick?: (customerId: string) => void;
}

const CustomerSegmentEntryItem: React.FC<CustomerSegmentEntryItemProps> = ({
  entry,
  onDelete,
  onCustomerClick,
}) => {
  const customer = getCustomerFromSegmentEntry(entry.customerId);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(entry);
    },
    [entry, onDelete]
  );

  const handleClick = useCallback(() => {
    if (customer.id && onCustomerClick) {
      onCustomerClick(customer.id);
    }
  }, [customer.id, onCustomerClick]);

  return (
    <tr
      onClick={handleClick}
      className={`border-b border-gray-100 transition-colors ${
        customer.id && onCustomerClick ? 'cursor-pointer hover:bg-gray-50/60' : ''
      }`}
    >
      <td className={`${segmentTableCellClass} font-medium text-gray-900`}>{customer.name}</td>
      <td className={segmentTableCellClass}>{customer.email || '—'}</td>
      <td className={`${segmentTableCellClass} text-gray-500`}>
        {new Date(entry.createdAt).toLocaleDateString()}
      </td>
      <td className={segmentTableCellRightClass}>
        <button
          type="button"
          onClick={handleDelete}
          className={`${segmentSecondaryButtonClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
          aria-label={`Remove ${customer.name} from segment`}
        >
          <TrashIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
      </td>
    </tr>
  );
};

export default CustomerSegmentEntryItem;
