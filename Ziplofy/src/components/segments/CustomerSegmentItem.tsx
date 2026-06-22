import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import {
  segmentSecondaryButtonClass,
  segmentTableCellClass,
  segmentTableCellRightClass,
} from './customer-segment-ui.util';

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
      className="group cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50/60"
      onClick={handleClick}
    >
      <td className={`${segmentTableCellClass} font-medium text-gray-900`}>
        <div className="flex items-center gap-2">
          <span>{segment.name}</span>
          <ChevronRightIcon
            className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </div>
      </td>
      <td className={`${segmentTableCellClass} text-gray-500`}>
        {new Date(segment.createdAt).toLocaleDateString()}
      </td>
      <td className={segmentTableCellRightClass}>
        <button
          type="button"
          onClick={handleEdit}
          className={segmentSecondaryButtonClass}
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export default CustomerSegmentItem;
