import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Billing information</h2>
          <p className="text-sm text-gray-600">Your customers could see this information.</p>
        </div>
      }
      maxWidth="sm"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isDisabled}
            className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors ${
              hasChanges && !saving
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </>
      }
    >
      <div className="mb-6">
        <label htmlFor="legal-business-name" className="block text-sm font-medium text-gray-700 mb-1">
          Legal business name
        </label>
        <input
          id="legal-business-name"
          type="text"
          value={legalBusinessName}
          onChange={onLegalBusinessNameChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="country-label" className="block text-sm font-medium text-gray-700 mb-1">
          Country/region
        </label>
        <select
          id="country-label"
          value={country}
          onChange={onCountryChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </div>
          <input
            id="address"
            type="text"
            value={address}
            onChange={onAddressChange}
            className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
          Apartment, suite, etc.
        </label>
        <input
          id="apartment"
          type="text"
          value={apartment}
          onChange={onApartmentChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={onCityChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="state-label" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            id="state-label"
            value={state}
            onChange={onStateChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
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
        <label htmlFor="pin-code" className="block text-sm font-medium text-gray-700 mb-1">
          PIN code
        </label>
        <input
          id="pin-code"
          type="text"
          value={pinCode}
          onChange={onPinCodeChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </Modal>
  );
}

