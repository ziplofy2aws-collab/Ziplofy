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
        type="button"
        onClick={() => {
          onNavigate(path);
        }}
        className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-admin-row-hover"
      >
        <div className="flex w-8 shrink-0 items-center justify-center">{icon}</div>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-medium text-admin-text">{title}</p>
          {description ? (
            <p className="mt-0.5 text-[13px] text-admin-text-secondary">{description}</p>
          ) : null}
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-admin-text-subdued" />
      </button>
      {showDivider ? <div className="mx-4 h-px bg-admin-divider" /> : null}
    </>
  );
};

export default NotificationListItem;
