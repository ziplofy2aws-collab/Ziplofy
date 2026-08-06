import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import {
  adminListTableHeadClass,
  adminListTableHeadRightClass,
  adminListTableHeadRowClass,
} from '../admin-list-ui';
import CustomerSegmentItem from './CustomerSegmentItem';

interface CustomerSegment {
  _id: string;
  name: string;
  createdAt: string;
}

interface CustomerSegmentsTableProps {
  segments: CustomerSegment[];
  sortOrder: 'asc' | 'desc';
  onSortToggle: () => void;
  onSegmentClick: (segmentId: string) => void;
  onEditClick: (e: React.MouseEvent, segmentId: string, segmentName: string) => void;
}

const CustomerSegmentsTable: React.FC<CustomerSegmentsTableProps> = ({
  segments,
  sortOrder,
  onSortToggle,
  onSegmentClick,
  onEditClick,
}) => {
  const handleSortClick = useCallback(() => {
    onSortToggle();
  }, [onSortToggle]);

  return (
    <div className="overflow-x-auto bg-admin-surface">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className={adminListTableHeadRowClass}>
            <th className={adminListTableHeadClass}>Segment name</th>
            <th className={adminListTableHeadClass}>
              <button
                type="button"
                onClick={handleSortClick}
                className="inline-flex items-center gap-1 transition-colors hover:text-admin-text"
              >
                Created
                {sortOrder === 'asc' ? (
                  <ArrowUpIcon className="h-3.5 w-3.5 text-admin-text-subdued" aria-hidden />
                ) : (
                  <ArrowDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" aria-hidden />
                )}
              </button>
            </th>
            <th className={adminListTableHeadRightClass}>Actions</th>
          </tr>
        </thead>
        <tbody className="bg-admin-surface">
          {segments.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-admin-text">No segments found</p>
                <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
                  Try changing the search term
                </p>
              </td>
            </tr>
          ) : (
            segments.map((segment) => (
              <CustomerSegmentItem
                key={segment._id}
                segment={segment}
                onSegmentClick={onSegmentClick}
                onEditClick={onEditClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerSegmentsTable;
