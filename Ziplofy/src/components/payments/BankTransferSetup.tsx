import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { INDIAN_BANKS } from '../../constants/indian-banks';
import type { BankTransferDetails } from '../../types/payment-provider';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300';

const btnSecondary =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

const STEPS = [
  { id: 1, label: 'Select bank' },
  { id: 2, label: 'Account number' },
  { id: 3, label: 'IFSC code' },
] as const;

interface BankTransferSetupProps {
  initialValues?: BankTransferDetails | null;
  submitting?: boolean;
  onActivate: (details: BankTransferDetails) => void | Promise<void>;
}

const BankTransferSetup: React.FC<BankTransferSetupProps> = ({
  initialValues,
  submitting = false,
  onActivate,
}) => {
  const [step, setStep] = useState(1);
  const [bankName, setBankName] = useState(initialValues?.bankName ?? '');
  const [accountNumber, setAccountNumber] = useState(initialValues?.accountNumber ?? '');
  const [ifscCode, setIfscCode] = useState(initialValues?.ifscCode ?? '');

  useEffect(() => {
    if (initialValues?.bankName) setBankName(initialValues.bankName);
    if (initialValues?.accountNumber) setAccountNumber(initialValues.accountNumber);
    if (initialValues?.ifscCode) setIfscCode(initialValues.ifscCode);
  }, [initialValues]);

  const canContinueStep1 = bankName.trim().length > 0;
  const canContinueStep2 = /^\d{9,18}$/.test(accountNumber.trim());
  const canActivate = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode.trim());

  const handleActivate = async () => {
    if (!canActivate) return;
    await onActivate({
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Set up bank transfer</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add your bank details so customers know where to send payments.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((item) => {
          const isComplete = step > item.id;
          const isCurrent = step === item.id;
          return (
            <li
              key={item.id}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                isCurrent
                  ? 'bg-blue-100 text-blue-800'
                  : isComplete
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isComplete ? (
                <CheckCircleIcon className="h-3.5 w-3.5" />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold">
                  {item.id}
                </span>
              )}
              {item.label}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div>
            <label htmlFor="bank-name" className="mb-1.5 block text-sm font-medium text-gray-900">
              Select bank
            </label>
            <select
              id="bank-name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={inputClass}
            >
              <option value="">Choose a bank</option>
              {INDIAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className={btnPrimary}
              disabled={!canContinueStep1}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700">
            <span className="text-gray-500">Selected bank:</span>{' '}
            <span className="font-medium text-gray-900">{bankName}</span>
          </div>
          <div>
            <label htmlFor="account-number" className="mb-1.5 block text-sm font-medium text-gray-900">
              Bank account number
            </label>
            <input
              id="account-number"
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter account number for payment"
              className={inputClass}
              maxLength={18}
            />
            <p className="mt-1.5 text-xs text-gray-500">9–18 digits, numbers only.</p>
          </div>
          <div className="flex justify-between gap-3">
            <button type="button" className={btnSecondary} onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={!canContinueStep2}
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700">
              <span className="text-gray-500">Bank:</span>{' '}
              <span className="font-medium text-gray-900">{bankName}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700">
              <span className="text-gray-500">Account:</span>{' '}
              <span className="font-medium text-gray-900">
                ••••{accountNumber.slice(-4)}
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="ifsc-code" className="mb-1.5 block text-sm font-medium text-gray-900">
              IFSC code
            </label>
            <input
              id="ifsc-code"
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="e.g. SBIN0001234"
              className={`${inputClass} uppercase`}
              maxLength={11}
            />
            <p className="mt-1.5 text-xs text-gray-500">11-character IFSC code for your bank branch.</p>
          </div>
          <div className="flex justify-between gap-3">
            <button type="button" className={btnSecondary} onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={!canActivate || submitting}
              onClick={handleActivate}
            >
              {submitting ? 'Activating...' : 'Activate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankTransferSetup;
