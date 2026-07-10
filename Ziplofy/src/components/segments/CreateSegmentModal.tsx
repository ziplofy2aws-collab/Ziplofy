import React, { useCallback } from 'react';
import Modal from '../Modal';

interface CreateSegmentModalProps {
  isOpen: boolean;
  name: string;
  storeId: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

const CreateSegmentModal: React.FC<CreateSegmentModalProps> = ({
  isOpen,
  name,
  storeId,
  onNameChange,
  onClose,
  onCreate,
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
      title="Create customer segment"
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
            onClick={onCreate}
            disabled={!name.trim() || !storeId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Create segment
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="create-segment-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Name
        </label>
        <input
          id="create-segment-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
          placeholder="Enter segment name"
          autoFocus
        />
      </div>
    </Modal>
  );
};

export default CreateSegmentModal;

