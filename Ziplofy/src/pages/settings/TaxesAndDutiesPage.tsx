import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { useCountries } from '../../contexts/country.context';
import { useTaxAndDutiesGlobalSettings } from '../../contexts/tax-and-duties-global-settings.context';
import { useStore } from '../../contexts/store.context';
import { SettingsCallout, SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const btnOutline =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';
const iconBtn =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50';
const pageBtn =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';

interface TaxRegion {
  id: string;
  name: string;
  flag: string;
  collecting: string | null;
  taxService: string;
}

const TaxesAndDutiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { countries, loading: countriesLoading, getCountries } = useCountries();
  const { activeStoreId } = useStore();
  const { settings, loading: settingsLoading, getByStoreId, update } = useTaxAndDutiesGlobalSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [includeSalesTax, setIncludeSalesTax] = useState(false);
  const [chargeTaxOnShipping, setChargeTaxOnShipping] = useState(false);
  const [chargeVATOnDigital, setChargeVATOnDigital] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getCountries({ limit: 1000 });
  }, [getCountries]);

  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId).catch((error) => {
        console.error('Failed to fetch tax and duties global settings:', error);
      });
    }
  }, [activeStoreId, getByStoreId]);

  useEffect(() => {
    if (settings) {
      setIncludeSalesTax(settings.includeSalesTaxInProductPriceAndShippingRate);
      setChargeTaxOnShipping(settings.chargeSalesTaxOnShipping);
      setChargeVATOnDigital(settings.chargeVATOnDigitalGoods);
    }
  }, [settings]);

  const debouncedUpdate = useCallback(
    (payload: {
      includeSalesTaxInProductPriceAndShippingRate?: boolean;
      chargeSalesTaxOnShipping?: boolean;
      chargeVATOnDigitalGoods?: boolean;
    }) => {
      if (!settings || !settings._id) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          await update(settings._id, payload);
        } catch (error) {
          console.error('Failed to update tax and duties global settings:', error);
        }
      }, 500);
    },
    [settings, update]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const taxRegions: TaxRegion[] = countries.map((country) => ({
    id: country._id,
    name: country.name,
    flag: country.flagEmoji || '🏳️',
    collecting: country.name.toLowerCase() === 'india' ? 'Taxes' : null,
    taxService: 'Manual Tax',
  }));

  const filteredRegions = taxRegions.filter((region) =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedRegions = filteredRegions.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const totalPages = Math.ceil(filteredRegions.length / rowsPerPage);

  const searchInputClass =
    'w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  const checkboxClass =
    'mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30';

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <SettingsHero
          title="Taxes and duties"
          description="Manage tax regions, duties, import taxes, and global tax settings."
          tip="Tax region details vary by country—select a row to configure rates and registrations where supported."
        />

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 border-l-4 border-blue-500/75 pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">Tax regions</h2>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    title="Regions where you collect tax. Add shipping zones to expose new regions."
                    aria-label="About tax regions"
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Areas where customers pay tax and you collect or remit. Create a{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/settings/shipping-and-delivery')}
                    className="font-medium text-blue-700 underline-offset-2 hover:underline"
                  >
                    shipping zone
                  </button>{' '}
                  to add a region. Consult a tax professional if you are unsure about liability.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 max-w-[320px]">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search regions"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className={searchInputClass}
                  aria-label="Search tax regions"
                />
              </div>
              <button type="button" className={iconBtn} title="Filter (coming soon)" aria-label="Filter">
                <FunnelIcon className="h-4 w-4" />
              </button>
              <button type="button" className={iconBtn} title="Sort (coming soon)" aria-label="Sort">
                <ArrowsUpDownIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-inner ring-1 ring-slate-100/80">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50/95 to-slate-50/50">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-5">
                        Region
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-5">
                        Collecting
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-5">
                        Tax service
                      </th>
                      <th className="w-10 px-2 sm:w-12" aria-hidden />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {countriesLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center">
                          <div className="inline-flex flex-col items-center gap-2">
                            <div
                              className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
                              aria-hidden
                            />
                            <span className="text-sm text-slate-500">Loading countries…</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedRegions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                          No countries match your search.
                        </td>
                      </tr>
                    ) : (
                      paginatedRegions.map((region) => (
                        <tr
                          key={region.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/settings/taxes-and-duties/${region.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/settings/taxes-and-duties/${region.id}`);
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-blue-50/50"
                        >
                          <td className="px-4 py-3.5 sm:px-5">
                            <div className="flex items-center gap-3">
                              <span className="text-xl leading-none" role="img" aria-hidden>
                                {region.flag}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">{region.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 sm:px-5">
                            {region.collecting ? (
                              <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800">
                                {region.collecting}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-600 sm:px-5">{region.taxService}</td>
                          <td className="px-2 py-3.5 text-slate-400">
                            <ChevronRightIcon className="h-5 w-5" aria-hidden />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={pageBtn}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={pageBtn}
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Duties and import taxes</h2>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  title="Collect duties at checkout to reduce surprise fees for international buyers."
                  aria-label="About duties and import taxes"
                >
                  <InformationCircleIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Optional checkout collection for cross-border duties (fees may apply).
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">Collect duties and import taxes at checkout</p>
                <p className="mt-1 text-sm text-gray-500">
                  Prevent surprise fees for international customers at delivery • 0.5% transaction fee
                </p>
              </div>
              <button type="button" className={`${btnOutline} shrink-0`}>
                Set up
              </button>
            </div>

            <SettingsCallout variant="info" icon={<InformationCircleIcon className="h-5 w-5 text-blue-600" />} className="mt-4">
              Ensure the carriers you use offer{' '}
              <button type="button" className="font-medium text-blue-800 underline-offset-2 hover:underline">
                Delivered duty paid (DDP) shipping labels
              </button>
              .
            </SettingsCallout>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Customs information</h3>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Customs options"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Country of origin</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">No default set</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Harmonized System (HS) codes
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">No physical products available</p>
                </div>
              </div>
            </div>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Global settings</h2>
              <p className="mt-1 text-sm text-gray-500">Defaults that apply across your catalog and checkout.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 px-5 py-1 sm:px-6">
            <label className="flex cursor-pointer items-start gap-3 py-5">
              <input
                type="checkbox"
                checked={includeSalesTax}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setIncludeSalesTax(newValue);
                  debouncedUpdate({
                    includeSalesTaxInProductPriceAndShippingRate: newValue,
                  });
                }}
                disabled={settingsLoading || !settings}
                className={checkboxClass}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">Include sales tax in product price and shipping rate</p>
                <p className="mt-1 text-sm text-gray-500">
                  Assumes a 9% tax rate, adjusted to local rates in markets with{' '}
                  <button type="button" className="font-medium text-blue-700 underline-offset-2 hover:underline">
                    dynamic tax inclusion
                  </button>
                  .
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 py-5">
              <input
                type="checkbox"
                checked={chargeTaxOnShipping}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setChargeTaxOnShipping(newValue);
                  debouncedUpdate({
                    chargeSalesTaxOnShipping: newValue,
                  });
                }}
                disabled={settingsLoading || !settings}
                className={checkboxClass}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">Charge sales tax on shipping</p>
                <p className="mt-1 text-sm text-gray-500">
                  Automatically calculated for Canada, European Union, and United States
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 py-5">
              <input
                type="checkbox"
                checked={chargeVATOnDigital}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setChargeVATOnDigital(newValue);
                  debouncedUpdate({
                    chargeVATOnDigitalGoods: newValue,
                  });
                }}
                disabled={settingsLoading || !settings}
                className={checkboxClass}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">Charge VAT on digital goods</p>
                <p className="mt-1 text-sm text-gray-500">
                  Creates a collection of digital goods that will be{' '}
                  <button type="button" className="font-medium text-blue-700 underline-offset-2 hover:underline">
                    charged VAT
                  </button>{' '}
                  at checkout (for European customers)
                </p>
              </div>
            </label>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};

export default TaxesAndDutiesPage;
