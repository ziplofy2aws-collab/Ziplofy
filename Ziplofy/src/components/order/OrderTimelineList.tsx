import React, { useMemo } from 'react';
import type { OrderTimelineEntry } from '../../contexts/order-timeline.context';
import OrderTimelineItem from './OrderTimelineItem';

interface OrderTimelineListProps {
  timelineEntries: OrderTimelineEntry[];
  editingTimelineId: string | null;
  editComment: string;
  onEditCommentChange: (comment: string) => void;
  onEditTimeline: (timelineId: string, currentComment: string) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

function getDateGroupLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const OrderTimelineList: React.FC<OrderTimelineListProps> = ({
  timelineEntries,
  editingTimelineId,
  editComment,
  onEditCommentChange,
  onEditTimeline,
  onDeleteTimeline,
  onCancelEdit,
  onSaveEdit,
}) => {
  const groupedEntries = useMemo(() => {
    const groups: Array<{ label: string; entries: OrderTimelineEntry[] }> = [];
    timelineEntries.forEach((entry) => {
      const label = getDateGroupLabel(entry.createdAt);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup?.label === label) {
        lastGroup.entries.push(entry);
      } else {
        groups.push({ label, entries: [entry] });
      }
    });
    return groups;
  }, [timelineEntries]);

  return (
    <div className="mt-6">
      {groupedEntries.map((group) => (
        <div key={group.label} className="mb-2">
          <p className="mb-4 text-sm font-semibold text-gray-900">{group.label}</p>
          <div className="pl-1">
            {group.entries.map((entry, index) => (
              <OrderTimelineItem
                key={entry._id}
                entry={entry}
                isLast={index === group.entries.length - 1}
                editingTimelineId={editingTimelineId}
                editComment={editComment}
                onEditCommentChange={onEditCommentChange}
                onEditTimeline={onEditTimeline}
                onDeleteTimeline={onDeleteTimeline}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimelineList;
