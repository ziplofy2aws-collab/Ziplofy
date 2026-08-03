import React, { useEffect, useState } from 'react';
import Modal from './Modal';

export const DELETE_ALL_FILES_CONFIRM_PHRASE = 'yes delete all files';

interface ConfirmDeleteAllFilesModalProps {
  isOpen: boolean;
  fileCount: number;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteAllFilesModal: React.FC<ConfirmDeleteAllFilesModalProps> = ({
  isOpen,
  fileCount,
  deleting,
  onClose,
  onConfirm,
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (!isOpen) setConfirmationText('');
  }, [isOpen]);

  const phraseMatches =
    confirmationText.trim().toLowerCase() === DELETE_ALL_FILES_CONFIRM_PHRASE;

  return (
    <Modal
      open={isOpen}
      onClose={deleting ? () => undefined : onClose}
      title={<span className="text-red-600">Delete all files</span>}
      maxWidth="sm"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting || !phraseMatches}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting…' : 'Delete all files'}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <p className="text-gray-900">
          This permanently deletes{' '}
          <strong>
            {fileCount} file{fileCount === 1 ? '' : 's'}
          </strong>{' '}
          from storage and the database. This cannot be undone.
        </p>
        <div className="space-y-2">
          <label htmlFor="delete-all-files-confirm" className="block text-gray-700">
            Type <span className="font-semibold text-gray-900">{DELETE_ALL_FILES_CONFIRM_PHRASE}</span>{' '}
            to confirm
          </label>
          <input
            id="delete-all-files-confirm"
            type="text"
            autoComplete="off"
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            disabled={deleting}
            placeholder={DELETE_ALL_FILES_CONFIRM_PHRASE}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteAllFilesModal;
