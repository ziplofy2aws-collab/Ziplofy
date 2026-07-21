import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from './Modal';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote?: string;
}

const MAX_CHARACTERS = 5000;

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote = '',
}) => {
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset note when modal opens/closes or initialNote changes
  useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
      // Focus textarea when modal opens
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialNote]);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setNote(value);
    }
  }, []);

  const handleSave = useCallback(() => {
    onSave(note);
    onClose();
  }, [note, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setNote(initialNote);
    onClose();
  }, [initialNote, onClose]);

  const characterCount = note.length;
  const isNoteEmpty = !note.trim();
  const isDisabled = isNoteEmpty;

  return (
    <Modal
      open={isOpen}
      onClose={handleCancel}
      title="Add Note"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              isDisabled
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            Done
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Text Area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={handleNoteChange}
            placeholder="Add a note..."
            rows={8}
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none"
          />
          {/* Character Counter */}
          <div className="absolute bottom-2 right-2">
            <span className="text-xs text-gray-500">
              {characterCount}/{MAX_CHARACTERS}
            </span>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500">
          To comment on a draft order or mention a staff member, use Timeline instead
        </p>
      </div>
    </Modal>
  );
};

export default AddNoteModal;
