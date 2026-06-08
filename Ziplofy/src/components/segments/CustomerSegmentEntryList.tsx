import React from 'react';
import CustomerSegmentEntryItem from './CustomerSegmentEntryItem';

interface Entry {
  _id: string;
  customerId: string | {
    fullName?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string | Date;
}

interface CustomerSegmentEntryListProps {
  entries: Entry[];
  onDelete: (entry: Entry) => void;
}

const CustomerSegmentEntryList: React.FC<CustomerSegmentEntryListProps> = ({
  entries,
  onDelete,
}) => {
  return (
    <div className="divide-y divide-gray-200">
      {entries.map((en) => (
        <CustomerSegmentEntryItem
          key={en._id}
          entry={en}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CustomerSegmentEntryList;

