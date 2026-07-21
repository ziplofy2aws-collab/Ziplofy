import React from 'react';
import Modal from './Modal';

interface ConfirmDeleteProductModalProps {
  isOpen: boolean;
  productTitle: string;
  deletingProduct: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteProductModal: React.FC<ConfirmDeleteProductModalProps> = ({
  isOpen,
  productTitle,
  deletingProduct,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={<span className="text-red-600">Delete Product</span>}
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={deletingProduct}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deletingProduct}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingProduct ? 'Deleting...' : 'Delete Product'}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-gray-900">
          Are you sure you want to delete <strong>"{productTitle || 'this product'}"</strong>?
        </p>
        <p className="text-gray-600">
          This will soft delete the product and remove it from product and variant listings.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteProductModal;
