import React, { useCallback } from 'react';
import Modal from '../Modal';
import {
  segmentInputClass,
  segmentPrimaryButtonClass,
  segmentSecondaryButtonClass,
} from './customer-segment-ui.util';

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
          <button type="button" onClick={onClose} className={segmentSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!editName.trim()}
            className={segmentPrimaryButtonClass}
          >
            Save
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="edit-segment-name" className="mb-1.5 block text-[13px] font-medium text-gray-700">
          Name
        </label>
        <input
          id="edit-segment-name"
          type="text"
          value={editName}
          onChange={handleNameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && editName.trim()) onSave();
          }}
          className={segmentInputClass}
          placeholder="Enter segment name"
          autoFocus
        />
      </div>
    </Modal>
  );
};

export default EditSegmentModal;
