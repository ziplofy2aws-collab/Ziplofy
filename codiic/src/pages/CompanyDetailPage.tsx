import {
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EditCheckoutSettingsModal from '../components/companies/EditCheckoutSettingsModal';
import EditCompanyDetailsModal from '../components/companies/EditCompanyDetailsModal';
import EditPaymentTermsModal from '../components/companies/EditPaymentTermsModal';
import {
  useCompanies,
  type Company,
  type CompanyAddress,
  type CompanyLocation,
  type CompanyOrderSubmission,
  type CompanyPaymentTerms,
} from '../contexts/company.context';
import { useStore } from '../contexts/store.context';

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

const ORDER_SUBMISSION_LABELS: Record<CompanyOrderSubmission, string> = {
  auto: 'Automatically submit orders',
  draft: 'Submit all orders as drafts for review',
};

function getMainContactLabel(
  mainContact?: Company['mainContact']
): string {
  if (!mainContact) return '';

  if (mainContact.customerId && typeof mainContact.customerId === 'object') {
    const name = `${mainContact.customerId.firstName ?? ''} ${mainContact.customerId.lastName ?? ''}`.trim();
    return name || mainContact.customerId.email || '';
  }

  const name = `${mainContact.firstName ?? ''} ${mainContact.lastName ?? ''}`.trim();
  return name || mainContact.email || '';
}

function formatCustomerSince(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return 'Customer for less than a minute';
  if (minutes < 60) {
    return `Customer for ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Customer for ${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `Customer for ${days} day${days === 1 ? '' : 's'}`;
  }

  const months = Math.floor(days / 30);
  return `Customer for ${months} month${months === 1 ? '' : 's'}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatLocationPrimaryLine(address: CompanyAddress): string {
  const attention = address.companyAttention?.trim();
  const street = [address.address, address.apartment].filter(Boolean).join(', ');
  const cityLine = [address.city, address.state, address.pinCode].filter(Boolean).join(', ');

  if (attention && street) {
    return `${attention} ${street}${cityLine ? `, ${cityLine}` : ''}`;
  }

  return [street, cityLine].filter(Boolean).join(', ') || '—';
}

function formatLocationMeta(location: CompanyLocation): string {
  const terms = PAYMENT_TERM_LABELS[location.paymentTerms] ?? location.paymentTerms;
  const submission = ORDER_SUBMISSION_LABELS[location.orderSubmission] ?? location.orderSubmission;
  return `${terms} • ${submission}`;
}

function formatCheckoutLines(location: CompanyLocation): string[] {
  const lines: string[] = [];
  if (location.allowOneTimeShipAddress) {
    lines.push('Ship to any address');
  }
  lines.push(ORDER_SUBMISSION_LABELS[location.orderSubmission]);
  return lines;
}

function DetailCard({
  title,
  headerAction,
  children,
  className = '',
}: {
  title?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm ${className}`}>
      {title ? (
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
          <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
          {headerAction}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const {
    companies,
    activeCompany,
    fetchCompanyById,
    fetchCompaniesByStoreId,
    updateCompany,
    deleteCompany,
    loading,
  } = useCompanies();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [paymentTermsModalOpen, setPaymentTermsModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [companyDetailsModalOpen, setCompanyDetailsModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const companyMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id || !activeStoreId) return;
    fetchCompanyById(id, activeStoreId).catch(() => undefined);
  }, [activeStoreId, fetchCompanyById, id]);

  useEffect(() => {
    if (!activeStoreId || companies.length > 0) return;
    fetchCompaniesByStoreId(activeStoreId).catch(() => undefined);
  }, [activeStoreId, companies.length, fetchCompaniesByStoreId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (companyMenuRef.current && !companyMenuRef.current.contains(event.target as Node)) {
        setCompanyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const company = activeCompany?._id === id ? activeCompany : null;

  useEffect(() => {
    if (!company) return;
    if (!editingNotes) {
      setNotesDraft(company.notes ?? '');
    }
  }, [company, editingNotes]);

  const companyIndex = useMemo(
    () => companies.findIndex((row) => row._id === id),
    [companies, id]
  );
  const previousCompanyId = companyIndex > 0 ? companies[companyIndex - 1]?._id : null;
  const nextCompanyId =
    companyIndex >= 0 && companyIndex < companies.length - 1
      ? companies[companyIndex + 1]?._id
      : null;

  const mainContactName = company ? getMainContactLabel(company.mainContact) : '';
  const location = company?.location;
  const hasLocation = Boolean(location?.shippingAddress);

  const handleDeleteCompany = useCallback(async () => {
    if (!company || !activeStoreId) return;
    setMoreMenuOpen(false);
    try {
      await deleteCompany(company._id, activeStoreId);
      navigate('/companies');
    } catch {
      // toast handled in context consumer if needed
    }
  }, [activeStoreId, company, deleteCompany, navigate]);

  const handleStartEditNotes = useCallback(() => {
    if (!company) return;
    setNotesDraft(company.notes ?? '');
    setEditingNotes(true);
  }, [company]);

  const handleCancelEditNotes = useCallback(() => {
    setNotesDraft(company?.notes ?? '');
    setEditingNotes(false);
  }, [company?.notes]);

  const handleSaveNotes = useCallback(async () => {
    if (!company || !activeStoreId) return;
    try {
      setSavingNotes(true);
      await updateCompany(company._id, {
        storeId: activeStoreId,
        notes: notesDraft,
      });
      setEditingNotes(false);
      toast.success('Notes saved');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save notes';
      toast.error(msg);
    } finally {
      setSavingNotes(false);
    }
  }, [activeStoreId, company, notesDraft, updateCompany]);

  const handleSavePaymentTerms = useCallback(
    async (paymentTerms: CompanyPaymentTerms) => {
      if (!company || !activeStoreId) return;
      try {
        setSavingEdit(true);
        await updateCompany(company._id, {
          storeId: activeStoreId,
          location: { paymentTerms },
        });
        setPaymentTermsModalOpen(false);
        toast.success('Payment terms updated');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update payment terms';
        toast.error(msg);
      } finally {
        setSavingEdit(false);
      }
    },
    [activeStoreId, company, updateCompany]
  );

  const handleSaveCheckout = useCallback(
    async (values: {
      allowOneTimeShipAddress: boolean;
      orderSubmission: CompanyOrderSubmission;
    }) => {
      if (!company || !activeStoreId) return;
      try {
        setSavingEdit(true);
        await updateCompany(company._id, {
          storeId: activeStoreId,
          location: {
            allowOneTimeShipAddress: values.allowOneTimeShipAddress,
            orderSubmission: values.orderSubmission,
          },
        });
        setCheckoutModalOpen(false);
        toast.success('Checkout settings updated');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update checkout settings';
        toast.error(msg);
      } finally {
        setSavingEdit(false);
      }
    },
    [activeStoreId, company, updateCompany]
  );

  const handleSaveCompanyDetails = useCallback(
    async (values: { name: string; externalId: string }) => {
      if (!company || !activeStoreId) return;
      try {
        setSavingEdit(true);
        await updateCompany(company._id, {
          storeId: activeStoreId,
          name: values.name,
          externalId: values.externalId || undefined,
        });
        setCompanyDetailsModalOpen(false);
        setCompanyMenuOpen(false);
        toast.success('Company updated');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update company';
        toast.error(msg);
      } finally {
        setSavingEdit(false);
      }
    },
    [activeStoreId, company, updateCompany]
  );

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1000px] py-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <nav
              className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
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
              <span className="truncate font-semibold text-gray-900">
                {company?.name ?? 'Company'}
              </span>
            </nav>
            {company ? (
              <p className="text-[13px] text-gray-500">{formatCustomerSince(company.createdAt)}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start">
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((open) => !open)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
              >
                More actions
                <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden />
              </button>
              {moreMenuOpen ? (
                <div className="absolute right-0 z-20 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setCompanyDetailsModalOpen(true);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                  >
                    Edit company
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCompany}
                    className="block w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-gray-50"
                  >
                    Delete company
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              disabled={!previousCompanyId}
              onClick={() => previousCompanyId && navigate(`/company/${previousCompanyId}`)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous company"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!nextCompanyId}
              onClick={() => nextCompanyId && navigate(`/company/${nextCompanyId}`)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next company"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading && !company ? (
          <div className="rounded-lg border border-gray-200/80 bg-white px-6 py-16 text-center text-[13px] text-gray-500 shadow-sm">
            Loading company…
          </div>
        ) : !company ? (
          <div className="rounded-lg border border-gray-200/80 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-[13px] text-gray-600">Company not found.</p>
            <Link
              to="/companies"
              className="mt-3 inline-block text-[13px] font-medium text-blue-600 hover:text-blue-700"
            >
              Back to companies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <DetailCard>
                <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <h2 className="text-[15px] font-semibold text-gray-900">No orders yet</h2>
                    <p className="mt-1 text-[13px] text-gray-500">This company doesn&apos;t have orders.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    <PlusIcon className="h-4 w-4" aria-hidden />
                    Create order
                  </button>
                </div>
              </DetailCard>

              <DetailCard
                title="Locations"
                headerAction={
                  <button
                    type="button"
                    disabled
                    title="Additional locations coming soon"
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-400"
                  >
                    <PlusIcon className="h-3.5 w-3.5" aria-hidden />
                    Add location
                  </button>
                }
              >
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[13px] font-normal text-gray-700"
                  >
                    All
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Search and filter"
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                      <Bars3BottomLeftIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Sort"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      <ArrowsUpDownIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-4 py-2.5 text-[12px] font-medium text-gray-500">Location</th>
                        <th className="px-4 py-2.5 text-[12px] font-medium text-gray-500">Sales</th>
                        <th className="px-4 py-2.5 text-[12px] font-medium text-gray-500">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hasLocation && location?.shippingAddress ? (
                        <tr className="border-b border-gray-100 last:border-b-0">
                          <td className="px-4 py-3">
                            <p className="text-[13px] font-medium text-gray-900">
                              {formatLocationPrimaryLine(location.shippingAddress)}
                            </p>
                            <p className="mt-0.5 text-[12px] text-gray-500">{formatLocationMeta(location)}</p>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-gray-700">{formatCurrency(0)}</td>
                          <td className="px-4 py-3 text-[13px] text-gray-700">0</td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-10 text-center text-[13px] text-gray-500">
                            No locations added yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DetailCard>
            </div>

            <div className="space-y-4">
              <DetailCard>
                <div className="px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-semibold text-gray-900">{company.name}</h2>
                      {company.externalId ? (
                        <p className="mt-0.5 truncate text-[13px] text-gray-500">{company.externalId}</p>
                      ) : null}
                    </div>
                    <div className="relative" ref={companyMenuRef}>
                      <button
                        type="button"
                        onClick={() => setCompanyMenuOpen((open) => !open)}
                        className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Company actions"
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                      {companyMenuOpen ? (
                        <div className="absolute right-0 z-20 mt-1 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setCompanyMenuOpen(false);
                              setCompanyDetailsModalOpen(true);
                            }}
                            className="block w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                          >
                            Edit company
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                      Approved
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[12px] font-medium text-gray-500">Customers</p>
                    {mainContactName ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[13px] text-gray-700">
                        <UserCircleIcon className="h-4 w-4 text-gray-500" aria-hidden />
                        {mainContactName}
                      </span>
                    ) : (
                      <p className="text-[13px] text-gray-500">No customers</p>
                    )}
                  </div>
                </div>
              </DetailCard>

              <DetailCard>
                <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5">
                  <h2 className="text-[13px] font-semibold text-gray-900">Customizations</h2>
                </div>
                <div className="divide-y divide-gray-100 px-4 py-1 sm:px-5">
                  <div className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="text-[12px] font-medium text-gray-500">Payment terms</p>
                      <p className="mt-1.5 text-[13px] text-gray-700">
                        {location
                          ? PAYMENT_TERM_LABELS[location.paymentTerms]
                          : PAYMENT_TERM_LABELS.none}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentTermsModalOpen(true)}
                      className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Edit payment terms"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="text-[12px] font-medium text-gray-500">Checkout</p>
                      <div className="mt-1.5 space-y-0.5 text-[13px] text-gray-700">
                        {location ? (
                          formatCheckoutLines(location).map((line) => (
                            <p key={line}>{line}</p>
                          ))
                        ) : (
                          <p>{ORDER_SUBMISSION_LABELS.auto}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutModalOpen(true)}
                      className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Edit checkout settings"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </DetailCard>

              <DetailCard>
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
                  <h2 className="text-[13px] font-semibold text-gray-900">Notes</h2>
                  {!editingNotes ? (
                    <button
                      type="button"
                      onClick={handleStartEditNotes}
                      className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Edit notes"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="px-4 py-4 sm:px-5">
                  {!editingNotes ? (
                    <p className="whitespace-pre-wrap text-[13px] text-gray-700">
                      {company.notes?.trim() ? company.notes : 'No notes'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        rows={4}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Add notes about this company"
                        maxLength={1000}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400/30"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditNotes}
                          disabled={savingNotes}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSaveNotes()}
                          disabled={savingNotes}
                          className="rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                          {savingNotes ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </DetailCard>
            </div>
          </div>
        )}
      </div>

      {company ? (
        <>
          <EditPaymentTermsModal
            open={paymentTermsModalOpen}
            onClose={() => setPaymentTermsModalOpen(false)}
            onSave={handleSavePaymentTerms}
            initialValue={location?.paymentTerms ?? 'none'}
            saving={savingEdit}
          />
          <EditCheckoutSettingsModal
            open={checkoutModalOpen}
            onClose={() => setCheckoutModalOpen(false)}
            onSave={handleSaveCheckout}
            initialAllowOneTimeShipAddress={location?.allowOneTimeShipAddress ?? false}
            initialOrderSubmission={location?.orderSubmission ?? 'auto'}
            saving={savingEdit}
          />
          <EditCompanyDetailsModal
            open={companyDetailsModalOpen}
            onClose={() => setCompanyDetailsModalOpen(false)}
            onSave={handleSaveCompanyDetails}
            initialName={company.name}
            initialExternalId={company.externalId ?? ''}
            saving={savingEdit}
          />
        </>
      ) : null}
    </div>
  );
}
