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
    <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-admin-text mb-4">Active dates</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-secondary text-[#005bd3]">
              <CalendarDaysIcon className="w-4 h-4" />
            </div>
            <div>
              <dt className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide">Start</dt>
              <dd className="mt-0.5 text-[13px] text-admin-text">{startDisplay}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-secondary text-admin-text-secondary">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div>
              <dt className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide">End</dt>
              <dd className="mt-0.5 text-[13px] text-admin-text">{endDisplay}</dd>
            </div>
          </div>
          <div>
            <dt className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide">Created</dt>
            <dd className="mt-0.5 text-[13px] text-admin-text">{formatDate(createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-admin-text-secondary uppercase tracking-wide">Last updated</dt>
            <dd className="mt-0.5 text-[13px] text-admin-text">{formatDate(updatedAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default DiscountActiveDatesCard;

