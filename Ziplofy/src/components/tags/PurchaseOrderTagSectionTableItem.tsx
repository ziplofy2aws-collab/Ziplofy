import { DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Tag {
  _id: string;
  name: string;
}

interface PurchaseOrderTagSectionTableItemProps {
  tag: Tag;
  onDeleteClick: (tag: Tag) => void;
}

const PurchaseOrderTagSectionTableItem: React.FC<PurchaseOrderTagSectionTableItemProps> = ({
  tag,
  onDeleteClick,
}) => {
  return (
    <tr className="transition-colors hover:bg-gray-50/60">
      <td className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <DocumentTextIcon className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-medium text-gray-900">{tag.name}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <button
          type="button"
          onClick={() => onDeleteClick(tag)}
          className="inline-flex rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete tag ${tag.name}`}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};

export default PurchaseOrderTagSectionTableItem;
