import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

interface SplitShippingModalProps {
  open: boolean;
  onClose: () => void;
  splitShipping: boolean;
  onSplitShippingChange: (checked: boolean) => void;
  onSave: () => void;
}

const SplitShippingModal: React.FC<SplitShippingModalProps> = ({
  open,
  onClose,
  splitShipping,
  onSplitShippingChange,
  onSave,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Split shipping in checkout</h3>
          <InformationCircleIcon className="w-5 h-5 text-gray-400" />
        </div>
      }
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={splitShipping}
            onChange={(e) => onSplitShippingChange(e.target.checked)}
            className="mt-1 w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
          />
          <div>
            <p className="text-base font-semibold text-gray-900">
              Show split shipping in checkout
            </p>
          </div>
        </label>
        <p className="text-sm text-gray-600 leading-relaxed">
          Shipping is split when products in an order are fulfilled from different locations or belong to separate
          shipping profiles. Customers will be able to select the shipping method for each shipment separately.
        </p>
      </div>
    </Modal>
  );
};

export default SplitShippingModal;

