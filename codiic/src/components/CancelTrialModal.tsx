import React from 'react';
import {
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';
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
          <button type="button" onClick={onClose} className={adminListSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={!acknowledged}
            className={`${adminListPrimaryButtonClass} disabled:bg-admin-fill disabled:text-admin-text-subdued`}
          >
            Continue
          </button>
        </>
      }
    >
      <h3 className="mb-2 text-[13px] font-medium text-admin-text">Avoid unwanted charges</h3>
      <ul className="mb-3 list-disc space-y-1 pl-5 text-[12px] text-admin-text-secondary">
        <li>Cancel any app subscriptions you signed up for outside of codiic</li>
        <li>
          Cancel additional{' '}
          <a href="#" className={adminListFooterLinkClass}>
            stores connected to your account
          </a>
        </li>
        <li>
          Turn off automatic renewals for any{' '}
          <a href="#" className={adminListFooterLinkClass}>
            domains with codiic
          </a>
        </li>
      </ul>

      <h3 className="mb-2 text-[13px] font-medium text-admin-text">Domains</h3>
      <p className="mb-3 text-[12px] text-admin-text-secondary">
        Any domains connected to your account will be disconnected if you cancel your plan. As well,
        all auto renewals will be turned off for any domains bought through codiic.
      </p>

      <h3 className="mb-2 text-[13px] font-medium text-admin-text">Remember</h3>
      <p className="mb-3 text-[12px] text-admin-text-secondary">
        <a href="#" className={adminListFooterLinkClass}>
          Review steps
        </a>{' '}
        to take before canceling, including exporting store data as CSV files.
      </p>

      <div className="mb-3 rounded-lg border border-admin-border bg-admin-secondary p-3">
        <p className="text-[12px] text-admin-text">
          <a href="#" className={adminListFooterLinkClass}>
            If you need help, contact support.
          </a>
        </p>
      </div>

      <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] text-admin-text">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={onAcknowledgedChange}
          className="h-4 w-4 rounded border-admin-border text-admin-text focus:ring-[#005bd3]/30"
        />
        <span>I've reviewed the information above</span>
      </label>
    </Modal>
  );
};

export default CancelTrialModal;
