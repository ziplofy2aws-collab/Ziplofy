import React from 'react';
import CustomerSegmentEntryItem from './CustomerSegmentEntryItem';
import {
  segmentTableHeadClass,
  segmentTableHeadRightClass,
} from './customer-segment-ui.util';

interface Entry {
  _id: string;
  customerId: string | {
    _id?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string | Date;
}

interface CustomerSegmentEntriesTableProps {
  entries: Entry[];
  onDelete: (entry: Entry) => void;
  onCustomerClick?: (customerId: string) => void;
}

const CustomerSegmentEntriesTable: React.FC<CustomerSegmentEntriesTableProps> = ({
  entries,
  onDelete,
  onCustomerClick,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className={segmentTableHeadClass}>Customer</th>
            <th className={segmentTableHeadClass}>Email</th>
            <th className={segmentTableHeadClass}>Added</th>
            <th className={segmentTableHeadRightClass}>
              <span className="sr-only">Remove</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No customers in this segment</p>
                <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                  Add customers to start building this segment
                </p>
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <CustomerSegmentEntryItem
                key={entry._id}
                entry={entry}
                onDelete={onDelete}
                onCustomerClick={onCustomerClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerSegmentEntriesTable;
