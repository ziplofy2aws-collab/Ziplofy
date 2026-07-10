import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Segment name
            </th>
            <th
              className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/80 transition-colors"
              onClick={handleSortClick}
            >
              <div className="flex items-center gap-1.5">
                <span>Created</span>
                {sortOrder === 'asc' ? (
                  <ArrowUpIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </th>
            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {segments.map((s) => (
            <CustomerSegmentItem
              key={s._id}
              segment={s}
              onSegmentClick={onSegmentClick}
              onEditClick={onEditClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerSegmentsTable;
