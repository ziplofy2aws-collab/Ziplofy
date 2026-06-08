import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { GiftCardTimeline } from '../../contexts/gift-card-timeline.context';

interface GiftCardTimelineItemProps {
  entry: GiftCardTimeline;
  editingTimelineId: string | null;
  editComment: string;
  onEditCommentChange: (comment: string) => void;
  onEditTimeline: (timelineId: string, currentComment: string) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

const GiftCardTimelineItem: React.FC<GiftCardTimelineItemProps> = ({
  entry,
  editingTimelineId,
  editComment,
  onEditCommentChange,
  onEditTimeline,
  onDeleteTimeline,
  onCancelEdit,
  onSaveEdit
}) => {
  const isEditing = editingTimelineId === entry._id;

  return (
    <div
      className={`p-3 rounded border ${
        entry.type === 'event'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              entry.type === 'event'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {entry.type === 'event' ? 'Event' : 'Comment'}
          </span>
          <span className="text-xs text-gray-600">
            {new Date(entry.createdAt).toLocaleString()}
          </span>
        </div>
        {!isEditing && (
          <div className="flex gap-1">
            <button
              onClick={() => onEditTimeline(entry._id, entry.comment)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteTimeline(entry._id)}
              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editComment}
            onChange={(e) => onEditCommentChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors resize-none mb-3 text-sm"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              disabled={!editComment.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{entry.comment}</p>
      )}
    </div>
  );
};

export default GiftCardTimelineItem;

