import React from 'react';

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
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Leave a comment..."
              className="w-full resize-none border-0 bg-transparent p-0 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <div className="mt-3 flex items-center justify-end border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={onPostComment}
                disabled={!comment.trim() || posting}
                className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">Only you and other staff can see comments</p>
    </div>
  );
};

export default OrderTimelineComposer;
