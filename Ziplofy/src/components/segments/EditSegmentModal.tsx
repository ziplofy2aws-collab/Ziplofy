import React, { useCallback } from 'react';
import Modal from '../Modal';

interface EditSegmentModalProps {
  isOpen: boolean;
  editName: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const EditSegmentModal: React.FC<EditSegmentModalProps> = ({
  isOpen,
  editName,
  onNameChange,
  onClose,
  onSave,
}) => {
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onNameChange(e.target.value);
    },
    [onNameChange]
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Edit customer segment"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!editName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="edit-segment-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Name
        </label>
        <input
          id="edit-segment-name"
          type="text"
          value={editName}
          onChange={handleNameChange}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
          placeholder="Enter segment name"
          autoFocus
        />
      </div>
    </Modal>
  );
};

export default EditSegmentModal;

