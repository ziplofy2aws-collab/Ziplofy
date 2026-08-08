import React from 'react';
import type { OrderTimelineEntry } from '../../contexts/order-timeline.context';
import DeleteTimelineConfirmModal from '../gift-card/DeleteTimelineConfirmModal';
import OrderTimelineComposer from './OrderTimelineComposer';
import OrderTimelineList from './OrderTimelineList';

interface OrderTimelineSectionProps {
  comment: string;
  userInitials: string;
  onCommentChange: (comment: string) => void;
  onPostComment: () => void;
  posting?: boolean;
  timelineEntries: OrderTimelineEntry[];
  timelineLoading: boolean;
  timelineError: string | null;
  editingTimelineId: string | null;
  editComment: string;
  onEditCommentChange: (comment: string) => void;
  onEditTimeline: (timelineId: string, currentComment: string) => void;
  onDeleteTimeline: (timelineId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  deleteDialogOpen: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

const OrderTimelineSection: React.FC<OrderTimelineSectionProps> = ({
  comment,
  userInitials,
  onCommentChange,
  onPostComment,
  posting,
  timelineEntries,
  timelineLoading,
  timelineError,
  editingTimelineId,
  editComment,
  onEditCommentChange,
  onEditTimeline,
  onDeleteTimeline,
  onCancelEdit,
  onSaveEdit,
  deleteDialogOpen,
  onConfirmDelete,
  onCancelDelete,
}) => {
  return (
    <>
      <section>
        <h2 className="mb-4 text-[13px] font-semibold text-admin-text">Timeline</h2>
        <OrderTimelineComposer
          comment={comment}
          userInitials={userInitials}
          onCommentChange={onCommentChange}
          onPostComment={onPostComment}
          posting={posting}
        />

        {timelineLoading && timelineEntries.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
          </div>
        ) : timelineError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {timelineError}
          </div>
        ) : timelineEntries.length === 0 ? null : (
          <OrderTimelineList
            timelineEntries={timelineEntries}
            editingTimelineId={editingTimelineId}
            editComment={editComment}
            onEditCommentChange={onEditCommentChange}
            onEditTimeline={onEditTimeline}
            onDeleteTimeline={onDeleteTimeline}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
          />
        )}
      </section>

      <DeleteTimelineConfirmModal
        isOpen={deleteDialogOpen}
        timelineLoading={timelineLoading}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default OrderTimelineSection;
