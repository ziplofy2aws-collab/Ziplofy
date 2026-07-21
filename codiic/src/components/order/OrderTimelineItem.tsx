import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { OrderTimelineEntry } from '../../contexts/order-timeline.context';

interface OrderTimelineItemProps {
  entry: OrderTimelineEntry;
  isLast: boolean;
  editingTimelineId: string | null;
  editComment: string;
  onEditCommentChange: (comment: string) => void;
  onEditTimeline: (timelineId: string, currentComment: string) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

function formatTimelineTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const OrderTimelineItem: React.FC<OrderTimelineItemProps> = ({
  entry,
  isLast,
  editingTimelineId,
  editComment,
  onEditCommentChange,
  onEditTimeline,
  onDeleteTimeline,
  onCancelEdit,
  onSaveEdit,
}) => {
  const isEditing = editingTimelineId === entry._id;
  const isComment = entry.type === 'comment';

  return (
    <div className="relative flex gap-4 pb-6">
      {!isLast ? <span className="absolute left-[4px] top-3 bottom-0 w-px bg-gray-300" aria-hidden /> : null}
      <div className="relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-[2px] bg-gray-500" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          {isEditing ? (
            <div className="flex-1">
              <textarea
                value={editComment}
                onChange={(e) => onEditCommentChange(e.target.value)}
                rows={3}
                className="mb-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={!editComment.trim()}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="flex-1 text-sm leading-relaxed text-gray-800">{entry.comment}</p>
          )}
          {!isEditing ? (
            <span className="shrink-0 text-xs text-gray-500">{formatTimelineTime(entry.createdAt)}</span>
          ) : null}
        </div>
        {isComment && !isEditing ? (
          <div className="mt-2 flex gap-1">
            <button
              type="button"
              onClick={() => onEditTimeline(entry._id, entry.comment)}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Edit comment"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteTimeline(entry._id)}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Delete comment"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderTimelineItem;
