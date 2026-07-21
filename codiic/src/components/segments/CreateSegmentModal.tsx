import React, { useCallback } from 'react';
import Modal from '../Modal';
import {
  segmentInputClass,
  segmentPrimaryButtonClass,
  segmentSecondaryButtonClass,
} from './customer-segment-ui.util';

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
          <button type="button" onClick={onClose} className={segmentSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={!name.trim() || !storeId}
            className={segmentPrimaryButtonClass}
          >
            Create segment
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="create-segment-name" className="mb-1.5 block text-[13px] font-medium text-gray-700">
          Name
        </label>
        <input
          id="create-segment-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim() && storeId) onCreate();
          }}
          className={segmentInputClass}
          placeholder="Enter segment name"
          autoFocus
        />
      </div>
    </Modal>
  );
};

export default CreateSegmentModal;
