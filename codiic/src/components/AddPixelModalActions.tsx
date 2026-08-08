import React from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';

interface AddPixelModalActionsProps {
  onClose: () => void;
  onCreate: () => void;
  isValid: boolean;
  loading: boolean;
}

const AddPixelModalActions: React.FC<AddPixelModalActionsProps> = ({
  onClose,
  onCreate,
  isValid,
  loading,
}) => {
  return (
    <>
      <button type="button" onClick={onClose} className={adminListSecondaryButtonClass}>
        Cancel
      </button>
      <button
        type="button"
        onClick={onCreate}
        disabled={!isValid || loading}
        className={adminListPrimaryButtonClass}
      >
        Add pixel
      </button>
    </>
  );
};

export default AddPixelModalActions;
