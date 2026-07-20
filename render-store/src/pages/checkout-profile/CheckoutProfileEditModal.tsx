import { useEffect, useState } from 'react';
import type { StorefrontUser } from '@/contexts/storefront-auth.context';

type Props = {
  open: boolean;
  user: StorefrontUser;
  accentColor?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: { firstName: string; lastName: string; phoneNumber: string }) => Promise<void>;
};

export function CheckoutProfileEditModal({
  open,
  user,
  accentColor = '#005bd3',
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '');

  useEffect(() => {
    if (!open) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phoneNumber ?? '');
  }, [open, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
      >
        <div className="border-b border-[#dedede] px-5 py-4">
          <h2 id="profile-edit-title" className="text-[16px] font-semibold text-[#121212]">
            Edit profile
          </h2>
        </div>

        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phoneNumber: phoneNumber.trim(),
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">First name</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px] text-[#121212]"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[13px] text-[#707070]">Last name</span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px] text-[#121212]"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[13px] text-[#707070]">Email</span>
            <input
              value={user.email}
              readOnly
              className="w-full rounded-md border border-[#dedede] bg-[#f7f7f7] px-3 py-2 text-[14px] text-[#707070]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] text-[#707070]">Phone number</span>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-md border border-[#dedede] px-3 py-2 text-[14px] text-[#121212]"
              placeholder="+91 98765 43210"
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-[#dedede] pt-4">
            <button
              type="button"
              className="rounded-md border border-[#dedede] bg-white px-4 py-2 text-[14px] font-medium text-[#121212]"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md px-4 py-2 text-[14px] font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
