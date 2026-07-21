import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CompanyOrderSubmission } from '../../contexts/company.context';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (values: {
    allowOneTimeShipAddress: boolean;
    orderSubmission: CompanyOrderSubmission;
  }) => Promise<void>;
  initialAllowOneTimeShipAddress: boolean;
  initialOrderSubmission: CompanyOrderSubmission;
  saving?: boolean;
};

export default function EditCheckoutSettingsModal({
  open,
  onClose,
  onSave,
  initialAllowOneTimeShipAddress,
  initialOrderSubmission,
  saving = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [allowOneTimeShipAddress, setAllowOneTimeShipAddress] = useState(initialAllowOneTimeShipAddress);
  const [orderSubmission, setOrderSubmission] = useState<CompanyOrderSubmission>(initialOrderSubmission);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    setAllowOneTimeShipAddress(initialAllowOneTimeShipAddress);
    setOrderSubmission(initialOrderSubmission);
  }, [initialAllowOneTimeShipAddress, initialOrderSubmission, open]);

  useEffect(() => {
    if (!open || !mounted) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, mounted]);

  const handleSave = useCallback(async () => {
    await onSave({ allowOneTimeShipAddress, orderSubmission });
  }, [allowOneTimeShipAddress, onSave, orderSubmission]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-checkout-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="edit-checkout-title" className="text-[15px] font-semibold text-gray-900">
            Edit checkout
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

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-gray-900">Ship to address</p>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={allowOneTimeShipAddress}
                onChange={(e) => setAllowOneTimeShipAddress(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400/30"
              />
              <span className="text-[13px] text-gray-700">
                Allow customers to ship to any one-time address
              </span>
            </label>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-gray-900">Order submission</p>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="edit-order-submission"
                  checked={orderSubmission === 'auto'}
                  onChange={() => setOrderSubmission('auto')}
                  className="mt-0.5 h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400/30"
                />
                <span>
                  <span className="block text-[13px] text-gray-900">Automatically submit orders</span>
                  <span className="mt-0.5 block text-[12px] text-gray-500">
                    Orders without shipping addresses will be submitted as draft orders
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="radio"
                  name="edit-order-submission"
                  checked={orderSubmission === 'draft'}
                  onChange={() => setOrderSubmission('draft')}
                  className="mt-0.5 h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400/30"
                />
                <span className="text-[13px] text-gray-900">Submit all orders as drafts for review</span>
              </label>
            </div>
          </div>
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
