import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import CustomerSegmentItem from './CustomerSegmentItem';
import {
  segmentTableHeadClass,
  segmentTableHeadRightClass,
} from './customer-segment-ui.util';

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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className={segmentTableHeadClass}>Segment name</th>
            <th className={segmentTableHeadClass}>
              <button
                type="button"
                onClick={handleSortClick}
                className="inline-flex items-center gap-1 transition-colors hover:text-gray-700"
              >
                Created
                {sortOrder === 'asc' ? (
                  <ArrowUpIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                ) : (
                  <ArrowDownIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                )}
              </button>
            </th>
            <th className={segmentTableHeadRightClass}>Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {segments.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-3 py-16 text-center">
                <p className="text-[15px] font-semibold text-gray-900">No segments found</p>
                <p className="mt-1.5 text-[13px] font-normal text-gray-500">
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
