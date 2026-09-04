import {
  ArrowsUpDownIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies, type Company } from '../contexts/company.context';
import { useStore } from '../contexts/store.context';

function CompaniesEmptyIllustration() {
  return (
    <div className="relative mx-auto mb-8 flex h-40 w-56 items-end justify-center">
      <div className="absolute bottom-0 left-6 z-10 h-[88px] w-[72px] rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-2 py-2">
          <div className="h-2 w-8 rounded bg-gray-200" />
        </div>
        <div className="space-y-1.5 px-2.5 py-2">
          <div className="h-1.5 w-full rounded bg-gray-100" />
          <div className="h-1.5 w-4/5 rounded bg-gray-100" />
          <div className="h-1.5 w-3/5 rounded bg-gray-100" />
          <div className="mt-2 h-5 w-14 rounded bg-gray-900" />
        </div>
      </div>

      <div className="absolute bottom-0 right-4 z-20 h-[104px] w-[88px] overflow-hidden rounded-md border border-teal-700/20 bg-teal-500 shadow-md">
        <div className="flex h-7 items-end justify-center gap-1 bg-teal-600 px-2 pb-1">
          <div className="h-3 w-3 rounded-sm bg-teal-300/90" />
          <div className="h-4 w-3 rounded-sm bg-teal-300/90" />
          <div className="h-3 w-3 rounded-sm bg-teal-300/90" />
        </div>
        <div className="flex h-full flex-col items-center justify-center bg-teal-500 px-3 pb-3">
          <div className="mb-2 h-8 w-10 rounded-sm border-2 border-white/90 bg-teal-400/40" />
          <div className="h-1.5 w-12 rounded bg-white/80" />
        </div>
      </div>

      <div className="absolute bottom-1 left-1/2 z-0 h-3 w-44 -translate-x-1/2 rounded-full bg-gray-200/80 blur-[1px]" />
    </div>
  );
}

function getMainContactLabel(
  mainContact?: Company['mainContact']
): string {
  if (!mainContact) return '—';

  if (mainContact.customerId && typeof mainContact.customerId === 'object') {
    const name = `${mainContact.customerId.firstName ?? ''} ${mainContact.customerId.lastName ?? ''}`.trim();
    return name || mainContact.customerId.email || '—';
  }

  const name = `${mainContact.firstName ?? ''} ${mainContact.lastName ?? ''}`.trim();
  return name || mainContact.email || '—';
}

function hasLocation(company: Company): boolean {
  return Boolean(company.location?.shippingAddress || company.location?.externalId);
}

function formatLocationLabel(company: Company): string {
  return hasLocation(company) ? '1 location' : 'No location';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type ViewFilter = 'All';

export default function CustomerCompaniesPage() {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { companies, fetchCompaniesByStoreId, loading } = useCompanies();
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('All');
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const viewRef = useRef<HTMLDivElement | null>(null);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    fetchCompaniesByStoreId(activeStoreId).catch(() => undefined);
  }, [activeStoreId, fetchCompaniesByStoreId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(event.target as Node)) {
        setViewOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) => {
      const contact = getMainContactLabel(company.mainContact).toLowerCase();
      return (
        company.name.toLowerCase().includes(q) ||
        (company.externalId ?? '').toLowerCase().includes(q) ||
        contact.includes(q)
      );
    });
  }, [companies, search]);

  const visibleIds = useMemo(() => filteredCompanies.map((c) => c._id), [filteredCompanies]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleRowClick = useCallback(
    (companyId: string) => navigate(`/company/${companyId}`),
    [navigate]
  );

  const handleAddCompany = useCallback(() => navigate('/companies/new'), [navigate]);

  const handleSelectAllVisible = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) visibleIds.forEach((id) => next.add(id));
        else visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    },
    [visibleIds]
  );

  const handleSelectRow = useCallback((companyId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(companyId);
      else next.delete(companyId);
      return next;
    });
  }, []);

  const hasCompanies = companies.length > 0;
  const showTable = hasCompanies || loading;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1000px] py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
            <h1 className="text-lg font-semibold text-gray-900">Companies</h1>
          </div>
          <button
            type="button"
            onClick={handleAddCompany}
            className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
          >
            Add company
          </button>
        </div>

        {showTable ? (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-3 py-2">
                <div className="relative shrink-0" ref={viewRef}>
                  <button
                    type="button"
                    onClick={() => setViewOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[13px] font-normal text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    {viewFilter}
                    <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                  </button>
                  {viewOpen ? (
                    <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] rounded-md border border-gray-200 bg-white py-1 shadow-md">
                      <button
                        type="button"
                        onClick={() => {
                          setViewFilter('All');
                          setViewOpen(false);
                        }}
                        className="flex w-full items-center bg-gray-50 px-3 py-1.5 text-left text-[13px] text-gray-900"
                      >
                        All
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="relative min-w-0 flex-1">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search and filter"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>

                <button
                  type="button"
                  title="Columns"
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50"
                >
                  <ViewColumnsIcon className="h-3.5 w-3.5" />
                  <ChevronDownIcon className="h-3 w-3 text-gray-400" aria-hidden />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="w-10 px-3 py-2.5">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={(e) => handleSelectAllVisible(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400/30"
                          aria-label="Select all companies"
                        />
                      </th>
                      <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Company</th>
                      <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Ordering</th>
                      <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Locations</th>
                      <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Main contact</th>
                      <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Total orders</th>
                      <th className="px-3 py-2.5 text-[12px] font-medium text-gray-500">Total sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-16 text-center text-[13px] text-gray-500">
                          Loading companies…
                        </td>
                      </tr>
                    ) : filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-16 text-center text-[13px] text-gray-500">
                          No companies match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map((company) => (
                        <tr
                          key={company._id}
                          onClick={() => handleRowClick(company._id)}
                          className="cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50/60"
                        >
                          <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(company._id)}
                              onChange={(e) => handleSelectRow(company._id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400/30"
                              aria-label={`Select ${company.name}`}
                            />
                          </td>
                          <td className="px-3 py-3 text-[13px] font-medium text-gray-900">{company.name}</td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                              Approved
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {hasLocation(company) ? (
                              <span className="text-[13px] font-medium text-blue-600">
                                {formatLocationLabel(company)}
                              </span>
                            ) : (
                              <span className="text-[13px] text-gray-500">{formatLocationLabel(company)}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-[13px] text-gray-700">
                            {getMainContactLabel(company.mainContact)}
                          </td>
                          <td className="px-3 py-3 text-[13px] text-gray-700">0 orders</td>
                          <td className="px-3 py-3 text-[13px] text-gray-700">{formatCurrency(0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-6 text-center">
              <a
                href="#"
                className="text-[13px] font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Learn more about companies
              </a>
            </p>
          </>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
            <div className="flex min-h-[520px] flex-col items-center justify-center px-6 py-16 text-center">
              <CompaniesEmptyIllustration />

              <h2 className="max-w-lg text-[15px] font-semibold text-gray-900">
                Bring the power of customization to your B2B business
              </h2>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-gray-500">
                Everything you need for B2B in one place. Get started by adding a company and assigning
                custom pricing, net payment terms, and permissions for multiple locations and buyers.
              </p>

              <button
                type="button"
                onClick={handleAddCompany}
                className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                Add company
              </button>

              <a
                href="#"
                className="mt-4 text-[13px] font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Learn more about companies
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
