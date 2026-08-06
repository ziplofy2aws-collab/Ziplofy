import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface HelpfulResource {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface HelpfulResourceItemProps {
  resource: HelpfulResource;
  onClick?: (resourceId: string) => void;
}

const HelpfulResourceItem: React.FC<HelpfulResourceItemProps> = ({
  resource,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick?.(resource.id)}
      className="flex w-full items-center gap-3 rounded-lg border border-admin-border bg-admin-secondary p-3 text-left transition-colors hover:bg-admin-row-hover"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">{resource.icon}</div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-admin-text">{resource.title}</p>
      </div>

      <div className="shrink-0">
        <ChevronRightIcon className="h-4 w-4 text-admin-text-subdued" />
      </div>
    </button>
  );
};

export default HelpfulResourceItem;
