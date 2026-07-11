import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import type { Customer } from '../../contexts/customer.context';
import MainContactPicker from './MainContactPicker';

export type NewMainContactDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
};

type Props = {
  selectedContact: Customer | null;
  onSelectedContactChange: (customer: Customer | null) => void;
  newContactDraft: NewMainContactDraft;
  onNewContactDraftChange: (draft: NewMainContactDraft) => void;
};

export const emptyMainContactDraft = (): NewMainContactDraft => ({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  agreedToMarketingEmails: false,
  agreedToSmsMarketing: false,
});

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400/30';

const labelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';

const hintClass = 'mt-1.5 text-[12px] text-gray-500';

function customerToDraft(customer: Customer): NewMainContactDraft {
  return {
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email ?? '',
    phoneNumber: customer.phoneNumber ?? '',
    agreedToMarketingEmails: customer.agreedToMarketingEmails ?? false,
    agreedToSmsMarketing: customer.agreedToSmsMarketing ?? false,
  };
}

export default function MainContactSection({
  selectedContact,
  onSelectedContactChange,
  newContactDraft,
  onNewContactDraftChange,
}: Props) {
  const [mode, setMode] = useState<'search' | 'form'>('search');

  const showForm = useCallback(() => setMode('form'), []);
  const showSearch = useCallback(() => setMode('search'), []);

  const handleCreateNewFromPicker = useCallback(() => {
    onSelectedContactChange(null);
    onNewContactDraftChange(emptyMainContactDraft());
    showForm();
  }, [onNewContactDraftChange, onSelectedContactChange, showForm]);

  const handleSelectExisting = useCallback(
    (customer: Customer) => {
      onSelectedContactChange(customer);
      onNewContactDraftChange(customerToDraft(customer));
      showForm();
    },
    [onNewContactDraftChange, onSelectedContactChange, showForm]
  );

  const updateDraft = useCallback(
    (field: keyof NewMainContactDraft, value: string | boolean) => {
      onNewContactDraftChange({ ...newContactDraft, [field]: value });
    },
    [newContactDraft, onNewContactDraftChange]
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      onNewContactDraftChange({
        ...newContactDraft,
        email: value,
        agreedToMarketingEmails: value.trim() ? newContactDraft.agreedToMarketingEmails : false,
      });
    },
    [newContactDraft, onNewContactDraftChange]
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      onNewContactDraftChange({
        ...newContactDraft,
        phoneNumber: value,
        agreedToSmsMarketing: value.trim() ? newContactDraft.agreedToSmsMarketing : false,
      });
    },
    [newContactDraft, onNewContactDraftChange]
  );

  const canEnableEmailMarketing = newContactDraft.email.trim().length > 0;
  const canEnableSmsMarketing = newContactDraft.phoneNumber.trim().length > 0;

  return (
    <section className="relative z-20 overflow-visible rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
        <h2 className="text-[13px] font-semibold text-gray-900">Main contact</h2>
        {mode === 'form' ? (
          <button
            type="button"
            onClick={showSearch}
            className="text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Add existing customer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onSelectedContactChange(null);
              onNewContactDraftChange(emptyMainContactDraft());
              showForm();
            }}
            className="text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Create new customer
          </button>
        )}
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {mode === 'search' ? (
          <MainContactPicker
            selectedContact={selectedContact}
            onSelectedContactChange={handleSelectExisting}
            onCreateNewCustomer={handleCreateNewFromPicker}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="main-contact-first-name">
                  First name
                </label>
                <input
                  id="main-contact-first-name"
                  type="text"
                  value={newContactDraft.firstName}
                  onChange={(e) => updateDraft('firstName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="main-contact-last-name">
                  Last name
                </label>
                <input
                  id="main-contact-last-name"
                  type="text"
                  value={newContactDraft.lastName}
                  onChange={(e) => updateDraft('lastName', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="main-contact-email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="main-contact-email"
                type="email"
                value={newContactDraft.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>
                This customer will use this email to log in and place B2B orders.
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="main-contact-phone">
                Phone
              </label>
              <div className="flex gap-2">
                <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[13px] text-gray-700 shadow-sm">
                  <span aria-hidden>🇮🇳</span>
                  <span className="text-gray-500">+91</span>
                </div>
                <input
                  id="main-contact-phone"
                  type="tel"
                  value={newContactDraft.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-gray-900">Marketing status</p>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-2.5 ${
                    canEnableEmailMarketing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={!canEnableEmailMarketing}
                    checked={newContactDraft.agreedToMarketingEmails}
                    onChange={(e) => updateDraft('agreedToMarketingEmails', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400/30 disabled:cursor-not-allowed"
                  />
                  <span className="text-[13px] text-gray-700">Agreed to receive marketing emails</span>
                </label>
                <label
                  className={`flex items-start gap-2.5 ${
                    canEnableSmsMarketing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={!canEnableSmsMarketing}
                    checked={newContactDraft.agreedToSmsMarketing}
                    onChange={(e) => updateDraft('agreedToSmsMarketing', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400/30 disabled:cursor-not-allowed"
                  />
                  <span className="text-[13px] text-gray-700">Agreed to receive marketing SMS</span>
                </label>
              </div>
              <p className={`${hintClass} mt-2`}>
                You should ask this customer for permission before subscribing them to your marketing
                emails or SMS.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3">
              <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
              <p className="text-[12px] leading-relaxed text-gray-700">
                This customer will be able to log in and place orders for this company right away. Learn
                more about{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                  B2B customers
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                  permissions
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
