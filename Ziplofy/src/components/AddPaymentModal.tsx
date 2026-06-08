import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React from 'react';
import Modal from './Modal';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  paymentType: string;
  onPaymentTypeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  country: string;
  onCountryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  state: string;
  onStateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  consent: boolean;
  onConsentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  open,
  onClose,
  paymentType,
  onPaymentTypeChange,
  country,
  onCountryChange,
  state,
  onStateChange,
  consent,
  onConsentChange,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add credit card"
      maxWidth="md"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!consent}
            className={`px-3 py-1.5 text-sm font-medium text-white transition-colors ${
              consent
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Save card
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Payment method type
          </label>
          <select
            value={paymentType}
            onChange={onPaymentTypeChange}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="Credit card">Credit card</option>
            <option value="Debit card">Debit card</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Card number
          </label>
          <input
            type="text"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Expires
            </label>
            <input
              type="text"
              placeholder="MM / YY"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CVV
            </label>
            <input
              type="text"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-700 mt-2">
          Billing address
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Country/region
          </label>
          <select
            value={country}
            onChange={onCountryChange}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              First name
            </label>
            <input
              type="text"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Last name
            </label>
            <input
              type="text"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Address
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Apartment, suite, etc
          </label>
          <input
            type="text"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              City
            </label>
            <input
              type="text"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              State
            </label>
            <select
              value={state}
              onChange={onStateChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            >
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            PIN code
          </label>
          <input
            type="text"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm">
              🇮🇳 +91
            </span>
            <input
              type="text"
              className="w-full pl-16 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={onConsentChange}
            className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
          />
          <label htmlFor="consent" className="text-sm text-gray-900 font-medium">
            I consent to having my card saved securely for future payments
          </label>
        </div>
        {consent && (
          <div className="bg-blue-50 p-3 border border-blue-200 text-blue-900 text-sm">
            You will be redirected to Razorpay to finish authentication and may be requested for a
            one-time mandate for ₹15,000. This will allow Ziplofy to automatically charge future bills
            below the mandate amount.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddPaymentModal;
