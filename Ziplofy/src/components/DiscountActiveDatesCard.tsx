import React from "react";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";

interface DiscountActiveDatesCardProps {
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const DiscountActiveDatesCard: React.FC<DiscountActiveDatesCardProps> = ({
  startDate,
  startTime,
  setEndDate,
  endDate,
  endTime,
  createdAt,
  updatedAt,
}) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' });
  };
  const startDisplay = [startDate, startTime].filter(Boolean).join(' ') || '—';
  const endDisplay = setEndDate ? ([endDate, endTime].filter(Boolean).join(' ') || '—') : 'No end date';

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Active dates</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarDaysIcon className="w-4 h-4" />
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{startDisplay}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">End</dt>
              <dd className="mt-0.5 text-sm text-gray-900">{endDisplay}</dd>
            </div>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{formatDate(createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last updated</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{formatDate(updatedAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default DiscountActiveDatesCard;

