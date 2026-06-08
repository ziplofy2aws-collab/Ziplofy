import { ChevronRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';

interface CustomerSegment {
  _id: string;
  name: string;
  createdAt: string;
}

interface CustomerSegmentItemProps {
  segment: CustomerSegment;
  onSegmentClick: (segmentId: string) => void;
  onEditClick: (e: React.MouseEvent, segmentId: string, segmentName: string) => void;
}

const CustomerSegmentItem: React.FC<CustomerSegmentItemProps> = ({
  segment,
  onSegmentClick,
  onEditClick,
}) => {
  const handleClick = useCallback(() => {
    onSegmentClick(segment._id);
  }, [segment._id, onSegmentClick]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      onEditClick(e, segment._id, segment.name);
    },
    [segment._id, segment.name, onEditClick]
  );

  return (
    <tr
      className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
      onClick={handleClick}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{segment.name}</span>
          <ChevronRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-gray-500">
        {new Date(segment.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Edit
        </button>
      </td>
    </tr>
  );
};

export default CustomerSegmentItem;
