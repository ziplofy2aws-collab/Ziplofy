import React from 'react';
import Modal from './Modal';

interface GstModalProps {
  open: boolean;
  onClose: () => void;
  gstin: string;
  onGstinChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const GstModal: React.FC<GstModalProps> = ({
  open,
  onClose,
  gstin,
  onGstinChange,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add tax info"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={gstin.trim().length !== 15}
            className={`px-3 py-1.5 text-sm font-medium text-white transition-colors ${
              gstin.trim().length === 15
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Add GSTIN
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Your Ziplofy bills may be exempt from Indian GST if you are GST registered in India and enter
          a valid GSTIN.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            GSTIN
          </label>
          <input
            type="text"
            placeholder="15 digit identifier"
            value={gstin}
            onChange={onGstinChange}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
        </div>
      </div>
    </Modal>
  );
};

export default GstModal;
