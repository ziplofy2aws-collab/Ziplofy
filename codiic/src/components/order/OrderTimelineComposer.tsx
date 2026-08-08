import React from 'react';
import { adminListPrimaryButtonClass } from '../admin-list-ui';

interface OrderTimelineComposerProps {
  comment: string;
  userInitials: string;
  onCommentChange: (comment: string) => void;
  onPostComment: () => void;
  posting?: boolean;
}

const OrderTimelineComposer: React.FC<OrderTimelineComposerProps> = ({
  comment,
  userInitials,
  onCommentChange,
  onPostComment,
  posting = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onPostComment();
    }
  };

  return (
    <div>
      <div className="rounded-xl border border-admin-border bg-admin-surface p-3">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-text text-[12px] font-semibold text-white">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Leave a comment..."
              className="w-full resize-none border-0 bg-transparent p-0 text-[13px] text-admin-text outline-none placeholder:text-admin-text-subdued"
            />
            <div className="mt-3 flex items-center justify-end border-t border-admin-divider pt-3">
              <button
                type="button"
                onClick={onPostComment}
                disabled={!comment.trim() || posting}
                className={adminListPrimaryButtonClass}
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-admin-text-subdued">Only you and other staff can see comments</p>
    </div>
  );
};

export default OrderTimelineComposer;
