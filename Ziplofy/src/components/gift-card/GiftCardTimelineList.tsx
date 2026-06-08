import React from 'react';
import type { GiftCardTimeline } from '../../contexts/gift-card-timeline.context';
import GiftCardTimelineItem from './GiftCardTimelineItem';

interface GiftCardTimelineListProps {
  timelineEntries: GiftCardTimeline[];
  editingTimelineId: string | null;
  editComment: string;
  onEditCommentChange: (comment: string) => void;
  onEditTimeline: (timelineId: string, currentComment: string) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

const GiftCardTimelineList: React.FC<GiftCardTimelineListProps> = ({
  timelineEntries,
  editingTimelineId,
  editComment,
  onEditCommentChange,
  onEditTimeline,
  onDeleteTimeline,
  onCancelEdit,
  onSaveEdit
}) => {
  return (
    <div className="flex flex-col gap-4">
      {timelineEntries.map((entry) => (
        <GiftCardTimelineItem
          key={entry._id}
          entry={entry}
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
  );
};

export default GiftCardTimelineList;

