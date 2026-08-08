import React from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';
import Modal from './Modal';

interface TurnOffSelfServeReturnsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const TurnOffSelfServeReturnsModal: React.FC<TurnOffSelfServeReturnsModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Turn off self-serve returns?"
      maxWidth="sm"
      actions={
        <>
          <button type="button" onClick={onClose} className={adminListSecondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={adminListPrimaryButtonClass}>
            Turn off self-serve returns
          </button>
        </>
      }
    >
      <p className="text-[13px] text-admin-text-secondary">
        Customers will no longer be able to request returns from their accounts. You can still
        process any return requests that need your review.
      </p>
    </Modal>
  );
};

export default TurnOffSelfServeReturnsModal;
