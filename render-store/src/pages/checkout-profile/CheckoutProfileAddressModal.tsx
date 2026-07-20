import { useEffect, useState } from 'react';
import type { CustomerAddress } from '@/contexts/customer-address-storefront.context';

export type CheckoutProfileAddressFormValues = {
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phoneNumber: string;
  country: string;
  setAsDefault: boolean;
};

const EMPTY_FORM: CheckoutProfileAddressFormValues = {
  firstName: '',
  lastName: '',
  company: '',
  address: '',
  apartment: '',
  city: '',
  state: 'Delhi',
  pinCode: '',
  phoneNumber: '',
  country: 'IN',
  setAsDefault: false,
};

function formFromAddress(address: CustomerAddress, isDefault: boolean): CheckoutProfileAddressFormValues {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company ?? '',
    address: address.address,
    apartment: address.apartment ?? '',
    city: address.city,
    state: address.state,
    pinCode: address.pinCode,
    phoneNumber: address.phoneNumber,
    country: typeof address.countryId === 'object' ? address.countryId.iso2 : 'IN',
    setAsDefault: isDefault,
  };
}

type Props = {
  open: boolean;
  mode: 'add' | 'edit';
  address?: CustomerAddress | null;
  isDefault?: boolean;
  accentColor?: string;
  saving?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (values: CheckoutProfileAddressFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function CheckoutProfileAddressModal({
  open,
  mode,
  address,
  isDefault = false,
  accentColor = '#005bd3',
  saving = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<CheckoutProfileAddressFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && address) {
      setForm(formFromAddress(address, isDefault));
      return;
    }
    setForm({ ...EMPTY_FORM, setAsDefault: false });
  }, [open, mode, address, isDefault]);

  if (!open) return null;

  const update = (patch: Partial<CheckoutProfileAddressFormValues>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-address-title"
      >
        <div className="border-b border-[#dedede] px-5 py-4">
          <h2 id="profile-address-title" className="text-[16px] font-semibold text-[#121212]">
            {mode === 'add' ? 'Add address' : 'Edit address'}
          </h2>
        </div>

        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave(form);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">First name</span>
              <input
                value={form.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">Last name</span>
              <input
                value={form.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[13px] text-[#707070]">Company (optional)</span>
            <input
              value={form.company}
              onChange={(e) => update({ company: e.target.value })}
              className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] text-[#707070]">Address</span>
            <input
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
              className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] text-[#707070]">Apartment, suite, etc. (optional)</span>
            <input
              value={form.apartment}
              onChange={(e) => update({ apartment: e.target.value })}
              className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">City</span>
              <input
                value={form.city}
                onChange={(e) => update({ city: e.target.value })}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">State</span>
              <input
                value={form.state}
                onChange={(e) => update({ state: e.target.value })}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">PIN code</span>
              <input
                value={form.pinCode}
                onChange={(e) => update({ pinCode: e.target.value })}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">Phone</span>
              <input
                value={form.phoneNumber}
                onChange={(e) => update({ phoneNumber: e.target.value })}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px]"
                required
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[14px] text-[#121212]">
            <input
              type="checkbox"
              checked={form.setAsDefault}
              onChange={(e) => update({ setAsDefault: e.target.checked })}
              className="h-4 w-4 rounded border-[#dedede]"
            />
            Set as default address
          </label>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dedede] pt-4">
            {mode === 'edit' && onDelete ? (
              <button
                type="button"
                className="text-[14px] font-medium text-[#b42318] disabled:opacity-60"
                onClick={() => void onDelete()}
                disabled={saving || deleting}
              >
                {deleting ? 'Deleting…' : 'Delete address'}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-[#dedede] bg-white px-4 py-2 text-[14px] font-medium text-[#121212]"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md px-4 py-2 text-[14px] font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
                disabled={saving || deleting}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
