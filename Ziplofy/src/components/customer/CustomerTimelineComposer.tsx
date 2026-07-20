import React from 'react';

interface CustomerTimelineComposerProps {
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}

const CustomerTimelineComposer: React.FC<CustomerTimelineComposerProps> = ({
  comment,
  onCommentChange,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2 items-start">
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Leave a comment"
        rows={2}
        className="flex-1 px-3 py-1.5 text-base border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none"
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={onSubmit}
        disabled={!comment.trim()}
        className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        Post
      </button>
    </div>
  );
};

export default CustomerTimelineComposer;

