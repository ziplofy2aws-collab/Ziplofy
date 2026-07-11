import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Customer } from '../../contexts/customer.context';
import { useGeneralSettings } from '../../contexts/general-settings.context';
import { useStore } from '../../contexts/store.context';
import type { GiftCardExpiryValue } from './GiftCardExpiryDatePicker';
import Modal from '../Modal';

type GiftCardEmailPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  storeName: string;
  customer: Customer | null;
  giftCardCode: string;
  initialValue: string;
  expiry: GiftCardExpiryValue;
};

function formatGiftCardCode(code: string): string {
  const normalized = code.replace(/\s+/g, '').toUpperCase();
  return normalized.match(/.{1,4}/g)?.join(' ') ?? code.toUpperCase();
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function formatExpiryPreview(expiry: GiftCardExpiryValue): string | null {
  if (expiry.mode === 'none' || !expiry.date) return null;
  const parsed = parseIsoDate(expiry.date);
  if (!parsed) return null;
  return `Expires ${parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function formatAmountParts(initialValue: string): { subjectAmount: string; displayAmount: string } {
  const numeric = Number.parseFloat(initialValue || '0');
  const safe = Number.isFinite(numeric) ? numeric : 0;
  const rounded = Math.round(safe);
  return {
    subjectAmount: `Rs. ${rounded}`,
    displayAmount: `Rs. ${safe.toFixed(2)} INR`,
  };
}

function GiftCardIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28" aria-hidden>
      <rect x="18" y="42" width="84" height="58" rx="5" fill="#F2B84B" />
      <rect x="18" y="42" width="84" height="58" rx="5" fill="url(#gift-shadow)" opacity="0.15" />
      <rect x="54" y="42" width="12" height="58" fill="#D72C2C" />
      <rect x="18" y="64" width="84" height="12" fill="#D72C2C" />
      <ellipse cx="46" cy="40" rx="16" ry="11" fill="#D72C2C" />
      <ellipse cx="74" cy="40" rx="16" ry="11" fill="#D72C2C" />
      <circle cx="60" cy="42" r="6" fill="#B91C1C" />
      <defs>
        <linearGradient id="gift-shadow" x1="60" y1="42" x2="60" y2="100">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const readOnlyFieldClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900';

export function GiftCardEmailPreviewModal({
  open,
  onClose,
  storeName,
  customer,
  giftCardCode,
  initialValue,
  expiry,
}: GiftCardEmailPreviewModalProps) {
  const { activeStoreId } = useStore();
  const { settings, getByStoreId } = useGeneralSettings();

  useEffect(() => {
    if (!open || !activeStoreId) return;
    void getByStoreId(activeStoreId);
  }, [activeStoreId, getByStoreId, open]);

  const senderEmail = settings?.storeEmail || 'developer200419@gmail.com';
  const recipientEmail = customer?.email ?? '';
  const formattedCode = formatGiftCardCode(giftCardCode);
  const { subjectAmount, displayAmount } = formatAmountParts(initialValue);
  const expiryText = formatExpiryPreview(expiry);
  const subjectLine = `${storeName} ${subjectAmount} gift card`;

  return (
    <Modal open={open} onClose={onClose} title="Email preview" maxWidth="lg">
      <div className="-mx-5 -mt-5 flex flex-col">
        <div className="grid grid-cols-1 gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gift-card-preview-to" className="mb-1.5 block text-xs font-medium text-gray-500">
              To
            </label>
            <input
              id="gift-card-preview-to"
              readOnly
              value={recipientEmail}
              className={readOnlyFieldClass}
            />
          </div>
          <div>
            <label htmlFor="gift-card-preview-from" className="mb-1.5 block text-xs font-medium text-gray-500">
              From
            </label>
            <input
              id="gift-card-preview-from"
              readOnly
              value={`"${storeName}" <${senderEmail}>`}
              className={readOnlyFieldClass}
            />
          </div>
        </div>

        <div className="bg-white px-5 py-5">
          <div className="mx-auto max-w-[560px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-6 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Subject:</span> {subjectLine}
            </p>

            <div className="text-center">
              <h3 className="text-3xl font-semibold tracking-tight text-gray-900">{displayAmount}</h3>
              {expiryText ? <p className="mt-2 text-sm text-gray-500">{expiryText}</p> : null}
            </div>

            <div className="my-6">
              <GiftCardIllustration />
            </div>

            <p className="text-center text-2xl font-medium text-gray-900">{storeName}</p>
            <p className="mt-3 text-center text-sm text-gray-500">Use the gift card code online</p>
            <p className="mt-4 text-center font-mono text-2xl font-semibold tracking-[0.2em] text-gray-900">
              {formattedCode}
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex justify-center">
                <span className="inline-flex w-full max-w-sm items-center justify-center rounded-lg bg-[#2c6ecb] px-5 py-3 text-sm font-semibold text-white">
                  Visit online store
                </span>
              </div>
              <p className="text-center text-sm font-medium text-[#2c6ecb]">View gift card balance</p>
            </div>

            <div className="mt-8 rounded-xl border border-gray-200 px-4 py-4 text-center text-sm leading-relaxed text-gray-600">
              <p>If you have any questions, reply to this email or contact us at</p>
              <p className="mt-1 font-medium text-[#2c6ecb]">{senderEmail}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
          Edit this template in{' '}
          <Link to="/settings/notifications" className="font-medium text-[#2c6ecb] hover:underline">
            notifications
          </Link>
          . Manage sending preferences in{' '}
          <Link to="/settings/general" className="font-medium text-[#2c6ecb] hover:underline">
            settings
          </Link>
          .
        </div>
      </div>
    </Modal>
  );
}
