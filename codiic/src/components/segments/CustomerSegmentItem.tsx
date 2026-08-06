import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import {
  adminListRowClass,
  adminListSecondaryButtonClass,
  adminListTableCellClass,
  adminListTableCellRightClass,
} from '../admin-list-ui';

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
    <tr className={adminListRowClass} onClick={handleClick}>
      <td className={`${adminListTableCellClass} font-medium text-admin-text`}>
        <div className="flex items-center gap-2">
          <span>{segment.name}</span>
          <ChevronRightIcon
            className="h-4 w-4 text-admin-text-subdued opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </div>
      </td>
      <td className={`${adminListTableCellClass} text-admin-text-subdued`}>
        {new Date(segment.createdAt).toLocaleDateString()}
      </td>
      <td className={adminListTableCellRightClass}>
        <button
          type="button"
          onClick={handleEdit}
          className={adminListSecondaryButtonClass}
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export default CustomerSegmentItem;
