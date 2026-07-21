import {
  ArrowLeftIcon,
  ArrowPathIcon,
  GiftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiftCardCustomerPicker } from '../components/gift-card/GiftCardCustomerPicker';
import { GiftCardEmailPreviewModal } from '../components/gift-card/GiftCardEmailPreviewModal';
import {
  GiftCardExpiryDatePicker,
  type GiftCardExpiryValue,
} from '../components/gift-card/GiftCardExpiryDatePicker';
import type { Customer } from '../contexts/customer.context';
import { useGiftCards } from '../contexts/gift-cards.context';
import { useStore } from '../contexts/store.context';


function GiftCardSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';

function generateGiftCardCode(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const NewGiftCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { createGiftCard, loading } = useGiftCards();
  const { activeStoreId, stores } = useStore();

  const [giftCardCode, setGiftCardCode] = useState('');
  const [initialValue, setInitialValue] = useState('10.00');
  const [expiry, setExpiry] = useState<GiftCardExpiryValue>({ mode: 'none', date: '' });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [sendGiftCardNow, setSendGiftCardNow] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);

  const activeStore = stores.find((store) => store._id === activeStoreId);
  const storeName = activeStore?.storeName ?? 'Your store';
  const canSendGiftCardEmail = Boolean(selectedCustomer?.email);

  useEffect(() => {
    setGiftCardCode(generateGiftCardCode());
  }, []);

  useEffect(() => {
    if (canSendGiftCardEmail) {
      setSendGiftCardNow(true);
      return;
    }
    setSendGiftCardNow(false);
  }, [canSendGiftCardEmail]);

  const handleBack = useCallback(() => {
    navigate('/products/gift-cards');
  }, [navigate]);

  const handleRegenerateCode = useCallback(() => {
    setGiftCardCode(generateGiftCardCode());
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!giftCardCode.trim()) {
      alert('Please enter a gift card code');
      return;
    }

    if (!initialValue || parseFloat(initialValue) <= 0) {
      alert('Please enter a valid initial value');
      return;
    }

    if (!activeStoreId) {
      alert('No active store selected');
      return;
    }

    if (expiry.mode === 'date' && !expiry.date) {
      alert('Please select an expiration date');
      return;
    }

    try {
      await createGiftCard({
        storeId: activeStoreId,
        code: giftCardCode.trim(),
        initialValue: parseFloat(initialValue),
        expirationDate: expiry.mode === 'date' ? expiry.date : undefined,
        notes: notes.trim() || undefined,
        customerId: selectedCustomer?._id,
        isActive: true,
      });
      navigate('/products/gift-cards');
    } catch (error) {
      console.error('Error creating gift card:', error);
      alert('Failed to create gift card. Please try again.');
    }
  }, [
    activeStoreId,
    createGiftCard,
    expiry,
    giftCardCode,
    initialValue,
    navigate,
    notes,
    selectedCustomer,
  ]);

  const submitDisabled = loading || !giftCardCode.trim() || !initialValue.trim();

  const handlePreviewEmail = useCallback(() => {
    if (!canSendGiftCardEmail) return;
    setEmailPreviewOpen(true);
  }, [canSendGiftCardEmail]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Gift cards
        </button>

        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
            <GiftIcon className="h-4 w-4 text-gray-700" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Create gift card
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <GiftCardSection title="Gift card details">
            <div className="space-y-5">
              <div>
                <label htmlFor="gift-card-code" className="mb-2 block text-sm font-medium text-gray-700">
                  Gift card code
                </label>
                <div className="relative">
                  <input
                    id="gift-card-code"
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    className={`${inputClass} pr-10 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                    title="Generate new code"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gift-card-value" className="mb-2 block text-sm font-medium text-gray-700">
                    Initial value
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      ₹
                    </span>
                    <input
                      id="gift-card-value"
                      type="text"
                      inputMode="decimal"
                      value={initialValue}
                      onChange={(e) => setInitialValue(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <GiftCardExpiryDatePicker value={expiry} onChange={setExpiry} />
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    Countries have different laws for gift card expiry dates. Check the laws for your
                    country before setting an expiration date.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <label
                  className={`flex items-center gap-2 text-sm ${
                    canSendGiftCardEmail ? 'cursor-pointer text-gray-900' : 'cursor-not-allowed text-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sendGiftCardNow}
                    disabled={!canSendGiftCardEmail}
                    onChange={(e) => setSendGiftCardNow(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <span>Send gift card now</span>
                </label>

                {sendGiftCardNow ? (
                  <button
                    type="button"
                    onClick={handlePreviewEmail}
                    disabled={!canSendGiftCardEmail}
                    className="self-start text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline sm:self-auto"
                  >
                    Preview email
                  </button>
                ) : null}
              </div>
            </div>
          </GiftCardSection>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <GiftCardSection title="Customer">
              <GiftCardCustomerPicker
                selectedCustomer={selectedCustomer}
                onSelectedCustomerChange={setSelectedCustomer}
              />
            </GiftCardSection>

            <GiftCardSection
              title="Notes"
              action={
                <button
                  type="button"
                  onClick={() => setEditingNotes((value) => !value)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                  aria-label={editingNotes ? 'Close notes editor' : 'Edit notes'}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              }
            >
              {!editingNotes ? (
                <p className="text-sm text-gray-600">{notes.trim() ? notes : 'No notes'}</p>
              ) : (
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this gift card"
                  className={`${inputClass} resize-none`}
                />
              )}
            </GiftCardSection>
          </aside>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitDisabled}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating gift card...' : 'Create gift card'}
          </button>
        </div>
      </div>

      <GiftCardEmailPreviewModal
        open={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        storeName={storeName}
        customer={selectedCustomer}
        giftCardCode={giftCardCode}
        initialValue={initialValue}
        expiry={expiry}
      />
    </div>
  );
};

export default NewGiftCardPage;
