import React from 'react';
import type { CustomerTimelineEntry } from '../../contexts/customer-timeline.context';
import CustomerTimelineEntryItem from './CustomerTimelineEntryItem';

interface CustomerTimelineListProps {
  timeline: CustomerTimelineEntry[];
  loading: boolean;
  error: string | null;
  onEdit: (entry: CustomerTimelineEntry) => void;
  onDelete: (entryId: string) => void;
}

const CustomerTimelineList: React.FC<CustomerTimelineListProps> = ({
  timeline,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="mb-4 space-y-2">
      {loading ? (
        <p className="text-sm text-gray-600">Loading timeline...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : timeline && timeline.length > 0 ? (
        timeline.map((entry) => (
          <CustomerTimelineEntryItem
            key={entry._id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className="text-sm text-gray-600">No timeline entries yet.</p>
      )}
    </div>
  );
};

export default CustomerTimelineList;

