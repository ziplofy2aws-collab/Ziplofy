import React from 'react';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';

interface CustomerEventsHeaderProps {
  onOpenModal: () => void;
}

const CustomerEventsHeader: React.FC<CustomerEventsHeaderProps> = ({ onOpenModal }) => {
  return (
    <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
      <div>
        <h2 className="text-[13px] font-semibold text-admin-text">Pixels</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Enable third-party services to securely collect and use customer event data from your store
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <button type="button" className={adminListSecondaryButtonClass}>
          Explore pixel apps
        </button>
        <button type="button" onClick={onOpenModal} className={adminListPrimaryButtonClass}>
          Add custom pixel
        </button>
      </div>
    </div>
  );
};

export default CustomerEventsHeader;
