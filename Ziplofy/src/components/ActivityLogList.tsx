import React from 'react';
import ActivityLogEntry, { type ActivityEntry } from './ActivityLogEntry';

interface ActivityLogListProps {
  entries: ActivityEntry[];
}

const ActivityLogList: React.FC<ActivityLogListProps> = ({ entries }) => (
  <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 overflow-hidden">
    {entries.map((entry, index) => (
      <ActivityLogEntry
        key={entry.id}
        entry={entry}
        showDivider={index < entries.length - 1}
      />
    ))}
  </div>
);

export default ActivityLogList;

