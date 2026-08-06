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
      className="group flex w-full rounded-xl border border-admin-border bg-admin-surface p-4 text-left transition-colors hover:bg-admin-row-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005bd3]"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-secondary transition-colors group-hover:bg-admin-fill">
          <Icon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[13px] font-semibold text-admin-text">{option.name}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-admin-text-secondary">
            {option.description}
          </p>
        </div>
        <ChevronRightIcon
          className="mt-1 h-4 w-4 shrink-0 text-admin-text-subdued transition-colors group-hover:text-admin-text"
          aria-hidden
        />
      </div>
    </button>
  );
};

export default TagOptionsItem;
