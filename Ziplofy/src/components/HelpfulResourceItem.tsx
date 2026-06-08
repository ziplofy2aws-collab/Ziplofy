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
      className="w-full flex items-center gap-3 p-3 bg-page-background-color border border-gray-200/80 rounded-lg hover:bg-blue-50 hover:border-blue-200/80 transition-colors text-left"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {resource.icon}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{resource.title}</p>
      </div>

      {/* Chevron */}
      <div className="flex-shrink-0">
        <ChevronRightIcon className="w-4 h-4 text-blue-500" />
      </div>
    </button>
  );
};

export default HelpfulResourceItem;

