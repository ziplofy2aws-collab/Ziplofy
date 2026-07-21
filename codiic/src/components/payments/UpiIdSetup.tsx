import React, { useEffect, useState } from 'react';
import type { UpiDetails } from '../../types/payment-provider';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300';

const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

interface UpiIdSetupProps {
  initialValue?: string;
  submitting?: boolean;
  onActivate: (details: UpiDetails) => void | Promise<void>;
}

const UpiIdSetup: React.FC<UpiIdSetupProps> = ({
  initialValue = '',
  submitting = false,
  onActivate,
}) => {
  const [upiId, setUpiId] = useState(initialValue);

  useEffect(() => {
    if (initialValue) setUpiId(initialValue);
  }, [initialValue]);

  const isValid = UPI_ID_REGEX.test(upiId.trim());

  const handleActivate = async () => {
    if (!isValid) return;
    await onActivate({ upiId: upiId.trim().toLowerCase() });
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Set up UPI ID</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter the UPI ID where you want to receive customer payments.
        </p>
      </div>

      <div>
        <label htmlFor="upi-id" className="mb-1.5 block text-sm font-medium text-gray-900">
          UPI ID
        </label>
        <input
          id="upi-id"
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value.toLowerCase().replace(/\s/g, ''))}
          placeholder="e.g. yourname@paytm"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Format: username@bankhandle (e.g. merchant@ybl, store@oksbi)
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className={btnPrimary}
          disabled={!isValid || submitting}
          onClick={handleActivate}
        >
          {submitting ? 'Activating...' : 'Activate'}
        </button>
      </div>
    </div>
  );
};

export default UpiIdSetup;
