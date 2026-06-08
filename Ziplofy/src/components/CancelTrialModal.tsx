import React from 'react';
import Modal from './Modal';

interface CancelTrialModalProps {
  open: boolean;
  onClose: () => void;
  acknowledged: boolean;
  onAcknowledgedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CancelTrialModal: React.FC<CancelTrialModalProps> = ({
  open,
  onClose,
  acknowledged,
  onAcknowledgedChange,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel trial"
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={!acknowledged}
            className={`px-3 py-1.5 text-sm transition-colors ${
              acknowledged
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </>
      }
    >
      <h3 className="text-sm font-medium text-gray-900 mb-2">
        Avoid unwanted charges
      </h3>
      <ul className="pl-5 mb-3 text-xs text-gray-600 list-disc space-y-1">
        <li>Cancel any app subscriptions you signed up for outside of Ziplofy</li>
        <li>
          Cancel additional{' '}
          <a href="#" className="text-gray-700 hover:underline">
            stores connected to your account
          </a>
        </li>
        <li>
          Turn off automatic renewals for any{' '}
          <a href="#" className="text-gray-700 hover:underline">
            domains with Ziplofy
          </a>
        </li>
      </ul>

      <h3 className="text-sm font-medium text-gray-900 mb-2">
        Domains
      </h3>
      <p className="text-xs text-gray-600 mb-3">
        Any domains connected to your account will be disconnected if you cancel your plan. As well,
        all auto renewals will be turned off for any domains bought through Ziplofy.
      </p>

      <h3 className="text-sm font-medium text-gray-900 mb-2">
        Remember
      </h3>
      <p className="text-xs text-gray-600 mb-3">
        <a href="#" className="text-gray-700 hover:underline">
          Review steps
        </a>{' '}
        to take before canceling, including exporting store data as CSV files.
      </p>

      <div className="bg-gray-100 border border-gray-200 p-3 mb-3">
        <p className="text-xs text-gray-900">
          <a href="#" className="text-gray-700 hover:underline">
            If you need help, contact support.
          </a>
        </p>
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-900 mt-2 cursor-pointer">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={onAcknowledgedChange}
          className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
        />
        <span>I've reviewed the information above</span>
      </label>
    </Modal>
  );
};

export default CancelTrialModal;

