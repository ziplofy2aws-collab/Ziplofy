import React from 'react';
import Modal from '../Modal';

interface EditTimelineModalProps {
  isOpen: boolean;
  comment: string;
  onCommentChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const EditTimelineModal: React.FC<EditTimelineModalProps> = ({
  isOpen,
  comment,
  onCommentChange,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Edit Timeline Comment"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!comment.trim()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </>
      }
    >
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-base border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none transition-colors"
        placeholder="Comment"
      />
    </Modal>
  );
};

export default EditTimelineModal;

