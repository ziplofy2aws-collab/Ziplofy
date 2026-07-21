import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface GiftCardTimelineComposerProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  onPostComment: () => void;
}

const GiftCardTimelineComposer: React.FC<GiftCardTimelineComposerProps> = ({
  comment,
  onCommentChange,
  onPostComment
}) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          rows={3}
          placeholder="Add a comment to this gift card..."
          className="w-full px-3 py-2 pr-20 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors resize-none text-sm"
        />
        <button
          onClick={onPostComment}
          disabled={!comment.trim()}
          className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-3.5 h-3.5" />
          Post
        </button>
      </div>
    </div>
  );
};

export default GiftCardTimelineComposer;

