import React from 'react';

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
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onCreate}
        disabled={!isValid || loading}
        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
      >
        Add pixel
      </button>
    </>
  );
};

export default AddPixelModalActions;

