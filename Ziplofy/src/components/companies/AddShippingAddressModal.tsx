import { ChevronUpDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ShippingAddressDraft = {
  country: string;
  firstName: string;
  lastName: string;
  companyAttention: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
};

export const emptyShippingAddressDraft = (): ShippingAddressDraft => ({
  country: 'India',
  firstName: '',
  lastName: '',
  companyAttention: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  pinCode: '',
  phone: '',
});

const INDIAN_STATES = [
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (address: ShippingAddressDraft) => void;
  initialValue?: ShippingAddressDraft | null;
  title?: string;
};

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30';

const labelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';

const selectClass =
  'w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30';

export default function AddShippingAddressModal({
  open,
  onClose,
  onSave,
  initialValue,
  title = 'Add shipping address',
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<ShippingAddressDraft>(emptyShippingAddressDraft());

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    setForm(initialValue ? { ...initialValue } : emptyShippingAddressDraft());
  }, [open, initialValue]);

  useEffect(() => {
    if (!open || !mounted) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, mounted]);

  const updateField = useCallback((field: keyof ShippingAddressDraft, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canSave =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.address.trim().length > 0 &&
    form.city.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSave(form);
    onClose();
  }, [canSave, form, onClose, onSave]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(92vh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-shipping-address-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="add-shipping-address-title" className="text-[15px] font-semibold text-gray-900">
            {title}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="ship-country">
                Country/region
              </label>
              <div className="relative">
                <select
                  id="ship-country"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className={selectClass}
                >
                  <option value="India">India</option>
                </select>
                <ChevronUpDownIcon
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="ship-first-name">
                  First name
                </label>
                <input
                  id="ship-first-name"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="ship-last-name">
                  Last name
                </label>
                <input
                  id="ship-last-name"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="ship-company">
                Company/attention
              </label>
              <input
                id="ship-company"
                type="text"
                value={form.companyAttention}
                onChange={(e) => updateField('companyAttention', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="ship-address">
                Address
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="ship-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="ship-apartment">
                Apartment, suite, etc
              </label>
              <input
                id="ship-apartment"
                type="text"
                value={form.apartment}
                onChange={(e) => updateField('apartment', e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="ship-city">
                  City
                </label>
                <input
                  id="ship-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="ship-state">
                  State
                </label>
                <div className="relative">
                  <select
                    id="ship-state"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select a state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <ChevronUpDownIcon
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="ship-pin">
                  PIN code
                </label>
                <input
                  id="ship-pin"
                  type="text"
                  value={form.pinCode}
                  onChange={(e) => updateField('pinCode', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="ship-phone">
                Phone
              </label>
              <div className="flex gap-2">
                <div className="relative shrink-0">
                  <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[13px] text-gray-700 shadow-sm">
                    <span aria-hidden>🇮🇳</span>
                    <ChevronUpDownIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                  </div>
                </div>
                <input
                  id="ship-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}
