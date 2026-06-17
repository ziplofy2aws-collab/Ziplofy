import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  COMPANY_PAYMENT_TERMS,
  type CompanyPaymentTerms,
} from '../../contexts/company.context';

const PAYMENT_TERM_LABELS: Record<CompanyPaymentTerms, string> = {
  none: 'No payment terms',
  due_on_fulfillment: 'Due on fulfillment',
  'net-7': 'Net 7',
  'net-15': 'Net 15',
  'net-30': 'Net 30',
  'net-45': 'Net 45',
  'net-60': 'Net 60',
  'net-90': 'Net 90',
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (paymentTerms: CompanyPaymentTerms) => Promise<void>;
  initialValue: CompanyPaymentTerms;
  saving?: boolean;
};

const selectClass =
  'w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30';

export default function EditPaymentTermsModal({
  open,
  onClose,
  onSave,
  initialValue,
  saving = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState<CompanyPaymentTerms>(initialValue);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    setPaymentTerms(initialValue);
  }, [open, initialValue]);

  useEffect(() => {
    if (!open || !mounted) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, mounted]);

  const handleSave = useCallback(async () => {
    await onSave(paymentTerms);
  }, [onSave, paymentTerms]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-payment-terms-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="edit-payment-terms-title" className="text-[15px] font-semibold text-gray-900">
            Edit payment terms
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4">
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700" htmlFor="edit-payment-terms">
            Payment terms
          </label>
          <select
            id="edit-payment-terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value as CompanyPaymentTerms)}
            className={selectClass}
          >
            {COMPANY_PAYMENT_TERMS.map((value) => (
              <option key={value} value={value}>
                {PAYMENT_TERM_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-white"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}
