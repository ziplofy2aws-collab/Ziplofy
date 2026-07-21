import React, { useCallback } from 'react';
import Modal from '../Modal';
import {
  getCustomerFromSegmentEntry,
  segmentPrimaryButtonClass,
  segmentSecondaryButtonClass,
} from './customer-segment-ui.util';

interface Entry {
  _id: string;
  customerId: string | {
    _id?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string | Date;
}

interface DeleteCustomerFromSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: Entry | null;
  onConfirm: () => void;
}

const DeleteCustomerFromSegmentModal: React.FC<DeleteCustomerFromSegmentModalProps> = ({
  isOpen,
  onClose,
  entry,
  onConfirm,
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  if (!entry) return null;

  const customer = getCustomerFromSegmentEntry(entry.customerId);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Remove customer from segment"
      maxWidth="sm"
      actions={
        <>
          <button type="button" onClick={onClose} className={segmentSecondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className={segmentPrimaryButtonClass}>
            Remove
          </button>
        </>
      }
    >
      <p className="text-[13px] text-gray-700">
        Remove <span className="font-medium text-gray-900">{customer.name}</span> from this segment?
      </p>
    </Modal>
  );
};

export default DeleteCustomerFromSegmentModal;
