import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface NotificationListItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  path: string;
  onNavigate: (path: string) => void;
  showDivider?: boolean;
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  icon,
  title,
  description,
  path,
  onNavigate,
  showDivider = false,
}) => {
  return (
    <>
      <button
        onClick={() => {
          onNavigate(path);
        }}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="shrink-0 w-8 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-500 shrink-0" />
      </button>
      {showDivider && <div className="h-px bg-gray-200 mx-4" />}
    </>
  );
};

export default NotificationListItem;

