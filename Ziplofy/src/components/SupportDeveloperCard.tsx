import React from 'react';
import { CommandLineIcon, EnvelopeIcon, UserIcon, CalendarDaysIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface SupportDeveloperCardProps {
  assignedDeveloper: {
    username: string;
    email: string;
  } | null;
  onHireClick: () => void;
  onScheduleClick: () => void;
  onEndMeetingClick: () => void;
}

export default function SupportDeveloperCard({
  assignedDeveloper,
  onHireClick,
  onScheduleClick,
  onEndMeetingClick,
}: SupportDeveloperCardProps) {
  if (!assignedDeveloper) {
    return (
      <div className="relative flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
            <CommandLineIcon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Need a developer to customize your store?</p>
            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
              Hire a certified Ziplofy Partner to build custom sections, install apps, or configure advanced settings.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 pl-[52px] sm:pl-0">
          <button
            type="button"
            onClick={onHireClick}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            Hire Developer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
          <UserIcon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Support Developer Assigned: <span className="text-emerald-700">{assignedDeveloper.username}</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-sm">
            <span className="flex items-center gap-1">
              <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400" />
              {assignedDeveloper.email}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-[52px] sm:pl-0">
        <button
          type="button"
          onClick={onScheduleClick}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
        >
          <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
          Schedule Meeting
        </button>
        <button
          type="button"
          onClick={onEndMeetingClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <VideoCameraIcon className="h-4 w-4" />
          End Meeting
        </button>
      </div>
    </div>
  );
}
