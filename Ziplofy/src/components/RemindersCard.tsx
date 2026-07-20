import {
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import ReminderItem, { Reminder } from './ReminderItem';

export interface ReminderSection {
  label: string;
  reminders: Reminder[];
}

interface RemindersCardProps {
  sections?: ReminderSection[];
  onNotification?: (reminderId: string) => void;
  onDelete?: (reminderId: string) => void;
}

const RemindersCard: React.FC<RemindersCardProps> = ({
  sections = [
    {
      label: 'Today',
      reminders: [
        {
          id: '1',
          text: 'Assess any risks identified in the morning meeting.',
        },
        {
          id: '2',
          text: "Outline key points for tomorrow's stand-up meeting.",
        },
      ],
    },
  ],
  onNotification,
  onDelete,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Today: true,
  });

  const handleSectionToggle = useCallback((sectionLabel: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionLabel]: !prev[sectionLabel],
    }));
  }, []);

  const handleNotification = useCallback(
    (reminderId: string) => {
      if (onNotification) {
        onNotification(reminderId);
      } else {
        console.log('Notification clicked for reminder:', reminderId);
      }
    },
    [onNotification]
  );

  const handleDelete = useCallback(
    (reminderId: string) => {
      if (onDelete) {
        onDelete(reminderId);
      } else {
        console.log('Delete clicked for reminder:', reminderId);
      }
    },
    [onDelete]
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ClockIcon className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
      </div>

      {/* Reminder Sections */}
      <div className="space-y-0">
        {sections.map((section) => {
          const isExpanded = expandedSections[section.label] ?? false;
          const reminderCount = section.reminders.length;

          return (
            <div key={section.label} className="mb-4 last:mb-0">
              {/* Section Header */}
              <button
                onClick={() => handleSectionToggle(section.label)}
                className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{section.label}</span>
                </div>
                <span className="text-sm text-gray-500">{reminderCount}</span>
              </button>

              {/* Reminder Items */}
              {isExpanded && reminderCount > 0 && (
                <div className="mt-2">
                  {section.reminders.map((reminder) => (
                    <ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      onNotification={handleNotification}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RemindersCard;

