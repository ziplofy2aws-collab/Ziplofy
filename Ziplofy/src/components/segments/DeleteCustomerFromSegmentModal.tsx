import React, { useCallback } from 'react';
import Modal from '../Modal';

interface Entry {
  _id: string;
  customerId: string | {
    fullName?: string;
    firstName?: string;
    lastName?: string;
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
  const getCustomerName = useCallback((customerId: any) => {
    if (typeof customerId === 'string') {
      return customerId;
    }
    return customerId.fullName || `${customerId.firstName || ''} ${customerId.lastName || ''}`.trim();
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  if (!isOpen || !entry) return null;

  const customerName = getCustomerName(entry.customerId);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Delete Customer"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            No
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Yes
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        Do you really want to delete <span className="font-medium">{customerName}</span> from this segment?
      </p>
    </Modal>
  );
};

export default DeleteCustomerFromSegmentModal;

