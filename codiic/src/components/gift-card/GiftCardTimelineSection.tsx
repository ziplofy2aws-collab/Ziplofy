import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { GiftCardTimeline } from '../../contexts/gift-card-timeline.context';
import DeleteTimelineConfirmModal from './DeleteTimelineConfirmModal';
import GiftCardTimelineComposer from './GiftCardTimelineComposer';
import GiftCardTimelineList from './GiftCardTimelineList';

interface GiftCardTimelineSectionProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  onPostComment: () => void;
  timelineEntries: GiftCardTimeline[];
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

const GiftCardTimelineSection: React.FC<GiftCardTimelineSectionProps> = ({
  comment,
  onCommentChange,
  onPostComment,
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
  onCancelDelete
}) => {
  return (
    <>
      {/* Timeline Segment */}
      <div className="mt-6">
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2">
              <EllipsisVerticalIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Timeline</h2>
              <p className="text-xs text-gray-600 mt-0.5">Track gift card activities and comments</p>
            </div>
          </div>

          {/* Comment Input */}
          <GiftCardTimelineComposer
            comment={comment}
            onCommentChange={onCommentChange}
            onPostComment={onPostComment}
          />

          {/* Timeline Entries */}
          {timelineLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : timelineError ? (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {timelineError}
            </div>
          ) : timelineEntries.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded border border-dashed border-gray-300">
              <p className="text-sm text-gray-500 text-center">
                No timeline entries yet. Be the first to add a comment!
              </p>
            </div>
          ) : (
            <GiftCardTimelineList
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
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteTimelineConfirmModal
        isOpen={deleteDialogOpen}
        timelineLoading={timelineLoading}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default GiftCardTimelineSection;

