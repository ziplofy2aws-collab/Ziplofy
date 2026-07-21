import { BellIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface Reminder {
  id: string;
  text: string;
}

interface ReminderItemProps {
  reminder: Reminder;
  onNotification?: (reminderId: string) => void;
  onDelete?: (reminderId: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  onNotification,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <p className="text-sm text-gray-900 flex-1">{reminder.text}</p>
      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={() => onNotification?.(reminder.id)}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          aria-label="Notification settings"
        >
          <BellIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete?.(reminder.id)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete reminder"
        >
          {/* Trash Icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReminderItem;

