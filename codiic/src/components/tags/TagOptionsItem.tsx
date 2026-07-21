import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { TagManagementOption } from './tagManagementOptions';

interface TagOptionsItemProps {
  option: TagManagementOption;
  onClick: (route: string) => void;
}

const TagOptionsItem: React.FC<TagOptionsItemProps> = ({ option, onClick }) => {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(option.route)}
      className="group flex w-full rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-200/90 hover:bg-blue-50/25 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
          <Icon className="h-5 w-5 text-blue-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-800">
            {option.name}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{option.description}</p>
        </div>
        <ChevronRightIcon
          className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500"
          aria-hidden
        />
      </div>
    </button>
  );
};

export default TagOptionsItem;
