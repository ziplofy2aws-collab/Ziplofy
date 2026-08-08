import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { adminListPrimaryButtonClass, adminListSecondaryButtonClass } from './admin-list-ui';
import Modal from './Modal';

interface Country {
  _id: string;
  name: string;
  flagEmoji?: string;
}

interface BillingInformationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  legalBusinessName: string;
  country: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  initialValues: {
    legalBusinessName: string;
    country: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    pinCode: string;
  };
  countries: Country[];
  onLegalBusinessNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApartmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPinCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const inputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-normal text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const searchInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-8 pr-3 text-[13px] font-normal text-admin-text focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[13px] font-medium text-admin-text';

export default function BillingInformationModal({
  open,
  onClose,
  onSave,
  saving,
  legalBusinessName,
  country,
  address,
  apartment,
  city,
  state,
  pinCode,
  initialValues,
  countries,
  onLegalBusinessNameChange,
  onCountryChange,
  onAddressChange,
  onApartmentChange,
  onCityChange,
  onStateChange,
  onPinCodeChange,
}: BillingInformationModalProps) {
  const hasChanges =
    legalBusinessName !== initialValues.legalBusinessName ||
    country !== initialValues.country ||
    address !== initialValues.address ||
    apartment !== initialValues.apartment ||
    city !== initialValues.city ||
    state !== initialValues.state ||
    pinCode !== initialValues.pinCode;

  const isDisabled = saving || !hasChanges;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div>
          <h2 className="mb-1 text-lg font-semibold text-admin-text">Billing information</h2>
          <p className="text-[13px] text-admin-text-secondary">
            Your customers could see this information.
          </p>
        </div>
      }
      maxWidth="sm"
      actions={
        <>
          <button type="button" onClick={onClose} className={adminListSecondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
            className={`${adminListPrimaryButtonClass} disabled:bg-admin-fill disabled:text-admin-text-subdued`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <div className="mb-6">
        <label htmlFor="legal-business-name" className={labelClass}>
          Legal business name
        </label>
        <input
          id="legal-business-name"
          type="text"
          value={legalBusinessName}
          onChange={onLegalBusinessNameChange}
          className={inputClass}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="country-label" className={labelClass}>
          Country/region
        </label>
        <select
          id="country-label"
          value={country}
          onChange={onCountryChange}
          className={inputClass}
        >
          {countries.length > 0 ? (
            countries.map((c) => (
              <option key={c._id} value={c.name}>
                {c.flagEmoji ? `${c.flagEmoji} ${c.name}` : c.name}
              </option>
            ))
          ) : (
            <option value="India">🇮🇳 India</option>
          )}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="address" className={labelClass}>
          Address
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-subdued">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </div>
          <input
            id="address"
            type="text"
            value={address}
            onChange={onAddressChange}
            className={searchInputClass}
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="apartment" className={labelClass}>
          Apartment, suite, etc.
        </label>
        <input
          id="apartment"
          type="text"
          value={apartment}
          onChange={onApartmentChange}
          className={inputClass}
        />
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={onCityChange}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="state-label" className={labelClass}>
            State
          </label>
          <select id="state-label" value={state} onChange={onStateChange} className={inputClass}>
            <option value="">Select a state</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="pin-code" className={labelClass}>
          PIN code
        </label>
        <input
          id="pin-code"
          type="text"
          value={pinCode}
          onChange={onPinCodeChange}
          className={inputClass}
        />
      </div>
    </Modal>
  );
}
