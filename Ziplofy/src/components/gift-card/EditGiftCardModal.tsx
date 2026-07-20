import React from 'react';
import type { GiftCard } from '../../contexts/gift-cards.context';
import Modal from '../Modal';

interface EditGiftCardModalProps {
  isOpen: boolean;
  giftCard: GiftCard;
  expirationOption: 'no-expiration' | 'set-expiration';
  newExpirationDate: string;
  isUpdating: boolean;
  onClose: () => void;
  onExpirationOptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExpirationDateChange: (date: string) => void;
  onSave: () => void;
  hasChanges: () => boolean;
}

const EditGiftCardModal: React.FC<EditGiftCardModalProps> = ({
  isOpen,
  expirationOption,
  newExpirationDate,
  isUpdating,
  onClose,
  onExpirationOptionChange,
  onExpirationDateChange,
  onSave,
  hasChanges
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Edit Gift Card Expiration"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!hasChanges() || isUpdating}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Done'}
          </button>
        </>
      }
    >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Expiration Date Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="expirationOption"
                  value="no-expiration"
                  checked={expirationOption === 'no-expiration'}
                  onChange={onExpirationOptionChange}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">No expiration date</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="expirationOption"
                  value="set-expiration"
                  checked={expirationOption === 'set-expiration'}
                  onChange={onExpirationOptionChange}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">Set expiration date</span>
              </label>
            </div>
          </div>

          {expirationOption === 'set-expiration' && (
            <div className="mt-3">
              <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                Expiration Date
              </label>
              <input
                id="expirationDate"
                type="date"
                value={newExpirationDate}
                onChange={(e) => onExpirationDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors text-sm"
              />
            </div>
          )}
    </Modal>
  );
};

export default EditGiftCardModal;

