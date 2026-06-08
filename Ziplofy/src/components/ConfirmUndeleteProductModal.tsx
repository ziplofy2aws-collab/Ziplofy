import React from 'react';
import Modal from './Modal';

interface ConfirmUndeleteProductModalProps {
  isOpen: boolean;
  productTitle: string;
  undeletingProduct: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmUndeleteProductModal: React.FC<ConfirmUndeleteProductModalProps> = ({
  isOpen,
  productTitle,
  undeletingProduct,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={<span className="text-emerald-700">Un-delete Product</span>}
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={undeletingProduct}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={undeletingProduct}
            className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {undeletingProduct ? 'Restoring...' : 'Yes, un-delete'}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-gray-900">
          Are you sure you want to un-delete <strong>"{productTitle || 'this product'}"</strong>?
        </p>
        <p className="text-gray-600">
          This will restore the product and make it active in admin workflows again.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmUndeleteProductModal;
