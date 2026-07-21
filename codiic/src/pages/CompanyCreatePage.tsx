import {
  BriefcaseIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import AddShippingAddressModal, {
  type ShippingAddressDraft,
} from '../components/companies/AddShippingAddressModal';
import MainContactSection, { emptyMainContactDraft } from '../components/companies/MainContactSection';
import type { NewMainContactDraft } from '../components/companies/MainContactSection';
import {
  useCompanies,
  type CompanyOrderSubmission,
  type CompanyPaymentTerms,
  type CompanyTaxSettings,
} from '../contexts/company.context';
import type { Customer } from '../contexts/customer.context';
import { useStore } from '../contexts/store.context';

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400/30';

const labelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';

const hintClass = 'mt-1.5 text-[12px] text-gray-500';

const selectClass =
  'w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all focus:border-gray-400 focus:ring-1 focus:ring-gray-400/30';

function formatAddressSummary(address: ShippingAddressDraft): string {
  const name = `${address.firstName} ${address.lastName}`.trim();
  const line2 = [address.address, address.apartment].filter(Boolean).join(', ');
  const line3 = [address.city, address.state, address.pinCode].filter(Boolean).join(', ');
  return [name, line2, line3, address.country].filter(Boolean).join('\n');
}

function AddressSubsection({
  label,
  address,
  onClear,
  onOpen,
}: {
  label: string;
  address: ShippingAddressDraft | null;
  onClear: () => void;
  onOpen: () => void;
}) {
  const summary = address ? formatAddressSummary(address) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-900">{label}</p>
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] font-medium text-blue-600 hover:text-blue-700"
        >
          Clear
        </button>
      </div>
      {address ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
        >
          <span className="whitespace-pre-line text-[13px] leading-relaxed text-gray-700">{summary}</span>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-[13px] text-gray-700">
            <PlusCircleIcon className="h-5 w-5 text-gray-500" aria-hidden />
            Add address
          </span>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" aria-hidden />
        </button>
      )}
    </div>
  );
}

function FormCard({
  title,
  headerAction,
  allowDropdownOverflow = false,
  children,
}: {
  title?: string;
  headerAction?: React.ReactNode;
  allowDropdownOverflow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-lg border border-gray-200/80 bg-white shadow-sm ${
        allowDropdownOverflow ? 'relative z-20 overflow-visible' : 'overflow-hidden'
      }`}
    >
      {title ? (
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
          <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
          {headerAction}
        </div>
      ) : null}
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { createCompany, loading } = useCompanies();
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [mainContact, setMainContact] = useState<Customer | null>(null);
  const [newMainContactDraft, setNewMainContactDraft] = useState<NewMainContactDraft>(emptyMainContactDraft);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [locationId, setLocationId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('none');
  const [allowOneTimeShipAddress, setAllowOneTimeShipAddress] = useState(false);
  const [orderSubmission, setOrderSubmission] = useState<'auto' | 'draft'>('auto');
  const [taxId, setTaxId] = useState('');
  const [taxSettings, setTaxSettings] = useState('collect');
  const [shippingAddressOpen, setShippingAddressOpen] = useState(false);
  const [billingAddressOpen, setBillingAddressOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressDraft | null>(null);
  const [billingAddress, setBillingAddress] = useState<ShippingAddressDraft | null>(null);

  const handleClearShippingAddress = useCallback(() => {
    setShippingAddress(null);
  }, []);

  const handleClearBillingAddress = useCallback(() => {
    setBillingAddress(null);
  }, []);

  const handleSaveShippingAddress = useCallback((address: ShippingAddressDraft) => {
    setShippingAddress(address);
  }, []);

  const handleSaveBillingAddress = useCallback((address: ShippingAddressDraft) => {
    setBillingAddress(address);
  }, []);

  const canSave = companyName.trim().length > 0 && !saving && !loading;

  const handleSave = useCallback(async () => {
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!activeStoreId) {
      toast.error('Select a store before saving a company');
      return;
    }

    const hasMainContactDraft =
      newMainContactDraft.email.trim().length > 0 ||
      newMainContactDraft.firstName.trim().length > 0 ||
      newMainContactDraft.lastName.trim().length > 0;

    try {
      setSaving(true);
      await createCompany({
        storeId: activeStoreId,
        name: companyName.trim(),
        externalId: companyId.trim() || undefined,
        mainContact: mainContact
          ? { customerId: mainContact._id }
          : hasMainContactDraft
            ? {
                newContact: {
                  firstName: newMainContactDraft.firstName.trim(),
                  lastName: newMainContactDraft.lastName.trim(),
                  email: newMainContactDraft.email.trim(),
                  phoneNumber: newMainContactDraft.phoneNumber.trim(),
                  agreedToMarketingEmails: newMainContactDraft.agreedToMarketingEmails,
                  agreedToSmsMarketing: newMainContactDraft.agreedToSmsMarketing,
                },
              }
            : undefined,
        location: {
          externalId: locationId.trim() || undefined,
          shippingAddress,
          billingSameAsShipping,
          billingAddress: billingSameAsShipping ? undefined : billingAddress,
          paymentTerms: paymentTerms as CompanyPaymentTerms,
          allowOneTimeShipAddress,
          orderSubmission: orderSubmission as CompanyOrderSubmission,
          taxId: taxId.trim() || undefined,
          taxSettings: taxSettings as CompanyTaxSettings,
        },
      });
      toast.success('Company saved');
      navigate('/companies');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save company';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [
    activeStoreId,
    billingAddress,
    billingSameAsShipping,
    companyId,
    companyName,
    createCompany,
    locationId,
    mainContact,
    navigate,
    newMainContactDraft.email,
    newMainContactDraft.firstName,
    newMainContactDraft.lastName,
    newMainContactDraft.phoneNumber,
    orderSubmission,
    paymentTerms,
    shippingAddress,
    taxId,
    taxSettings,
    allowOneTimeShipAddress,
  ]);

  const paymentTermOptions = useMemo(
    () => [
      { value: 'none', label: 'No payment terms' },
      { value: 'due_on_fulfillment', label: 'Due on fulfillment' },
      { value: 'net-7', label: 'Net 7' },
      { value: 'net-15', label: 'Net 15' },
      { value: 'net-30', label: 'Net 30' },
      { value: 'net-45', label: 'Net 45' },
      { value: 'net-60', label: 'Net 60' },
      { value: 'net-90', label: 'Net 90' },
    ],
    []
  );

  const taxSettingOptions = useMemo(
    () => [
      { value: 'collect', label: 'Collect tax' },
      { value: 'collect_unless_exempt', label: 'Collect tax unless exemptions apply' },
      { value: 'dont_collect', label: "Don't collect tax" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[720px] px-3 py-4 sm:px-4">
        <nav
          className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
          aria-label="Breadcrumb"
        >
          <Link
            to="/companies"
            className="inline-flex items-center text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Companies"
          >
            <BriefcaseIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <span className="truncate font-semibold text-gray-900">New company</span>
        </nav>

        <div className="space-y-4 pb-24">
          <FormCard>
            <div>
              <label className={labelClass} htmlFor="company-name">
                Company name
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>This will appear in customer accounts and at checkout.</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="company-id">
                Company ID
              </label>
              <input
                id="company-id"
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>Add an existing external ID or create a unique ID.</p>
            </div>
          </FormCard>

          <MainContactSection
            selectedContact={mainContact}
            onSelectedContactChange={setMainContact}
            newContactDraft={newMainContactDraft}
            onNewContactDraftChange={setNewMainContactDraft}
          />

          <div>
            <h2 className="text-[13px] font-semibold text-gray-900">Location</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
              Add a location to this company. This is where you&apos;ll ship products to. Each location
              can have custom catalogs, checkout settings, and more. You can add more locations later.
            </p>

            <div className="mt-4 space-y-4">
              <FormCard>
                <AddressSubsection
                  label="Shipping address"
                  address={shippingAddress}
                  onClear={handleClearShippingAddress}
                  onOpen={() => setShippingAddressOpen(true)}
                />

                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400/30"
                  />
                  <span className="text-[13px] text-gray-700">Billing address same as shipping address</span>
                </label>

                {!billingSameAsShipping ? (
                  <AddressSubsection
                    label="Billing address"
                    address={billingAddress}
                    onClear={handleClearBillingAddress}
                    onOpen={() => setBillingAddressOpen(true)}
                  />
                ) : null}

                <div>
                  <label className={labelClass} htmlFor="location-id">
                    Location ID
                  </label>
                  <input
                    id="location-id"
                    type="text"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className={inputClass}
                  />
                  <p className={hintClass}>Add an existing external ID or create a unique ID.</p>
                </div>
              </FormCard>

              <FormCard title="Payment terms">
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className={selectClass}
                >
                  {paymentTermOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormCard>

              <FormCard title="Checkout">
                <div className="space-y-4">
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
                          name="order-submission"
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
                          name="order-submission"
                          checked={orderSubmission === 'draft'}
                          onChange={() => setOrderSubmission('draft')}
                          className="mt-0.5 h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-400/30"
                        />
                        <span className="text-[13px] text-gray-900">Submit all orders as drafts for review</span>
                      </label>
                    </div>
                  </div>
                </div>
              </FormCard>

              <FormCard title="Tax details">
                <div>
                  <label className={labelClass} htmlFor="tax-id">
                    Tax ID
                  </label>
                  <input
                    id="tax-id"
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="tax-settings">
                    Tax settings
                  </label>
                  <select
                    id="tax-settings"
                    value={taxSettings}
                    onChange={(e) => setTaxSettings(e.target.value)}
                    className={selectClass}
                  >
                    {taxSettingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </FormCard>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-[720px] justify-end">
            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-white"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <AddShippingAddressModal
          open={shippingAddressOpen}
          onClose={() => setShippingAddressOpen(false)}
          onSave={handleSaveShippingAddress}
          initialValue={shippingAddress}
          title="Add shipping address"
        />
        <AddShippingAddressModal
          open={billingAddressOpen}
          onClose={() => setBillingAddressOpen(false)}
          onSave={handleSaveBillingAddress}
          initialValue={billingAddress}
          title="Add billing address"
        />
      </div>
    </div>
  );
}
