import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { CustomerTimelineEntry } from '../../contexts/customer-timeline.context';

interface CustomerTimelineEntryItemProps {
  entry: CustomerTimelineEntry;
  onEdit: (entry: CustomerTimelineEntry) => void;
  onDelete: (entryId: string) => void;
}

const CustomerTimelineEntryItem: React.FC<CustomerTimelineEntryItemProps> = ({
  entry,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border border-gray-200 rounded p-3">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-700 whitespace-pre-wrap pr-2 flex-1">{entry.comment}</p>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(entry)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="edit timeline"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry._id)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="delete timeline"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-600">{new Date(entry.createdAt).toLocaleDateString()}</p>
    </div>
  );
};

export default CustomerTimelineEntryItem;

