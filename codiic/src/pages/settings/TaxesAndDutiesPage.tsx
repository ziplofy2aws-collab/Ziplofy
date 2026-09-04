import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { useCountries } from '../../contexts/country.context';
import { useTaxAndDutiesGlobalSettings } from '../../contexts/tax-and-duties-global-settings.context';
import { useStore } from '../../contexts/store.context';
import {
  adminListFooterLinkClass,
  adminListSearchInputClass,
  adminListSecondaryButtonClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../../components/admin-list-ui';
import { SettingsCallout, SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const sectionHeaderClass = 'border-b border-admin-divider bg-admin-table-header px-5 py-4 sm:px-6';

const iconBtn =
  'inline-flex items-center justify-center rounded-lg border border-admin-border bg-admin-surface p-2 text-admin-text-secondary transition-colors hover:bg-admin-row-hover';

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

  const taxRegions: TaxRegion[] = countries
    .filter((country) => country.name.toLowerCase() === 'india' || country.iso2 === 'IN')
    .map((country) => ({
      id: country._id,
      name: country.name,
      flag: country.flagEmoji || '🇮🇳',
      collecting: 'Taxes',
      taxService: 'Manual Tax',
    }));

  const filteredRegions = taxRegions.filter((region) =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedRegions = filteredRegions;

  const checkboxClass =
    'mt-0.5 h-4 w-4 shrink-0 rounded border-admin-border text-admin-text focus:ring-[#005bd3]/30';

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        <SettingsHero
          title="Taxes and duties"
          description="Manage tax regions, duties, import taxes, and global tax settings."
          tip="Tax region details vary by country—select a row to configure rates and registrations where supported."
        />

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[13px] font-semibold text-admin-text">Tax regions</h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
                title="Regions where you collect tax. Add shipping zones to expose new regions."
                aria-label="About tax regions"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Areas where customers pay tax and you collect or remit. Create a{' '}
              <button
                type="button"
                onClick={() => navigate('/settings/shipping-and-delivery')}
                className={`${adminListFooterLinkClass} font-medium underline-offset-2`}
              >
                shipping zone
              </button>{' '}
              to add a region. Consult a tax professional if you are unsure about liability.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <SettingsCallout
              variant="info"
              icon={<InformationCircleIcon className="h-5 w-5 text-admin-text-secondary" />}
              className="mb-4"
            >
              Currently we are operating in India only. Click India below to configure base taxes
              and state IGST rates.
            </SettingsCallout>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] max-w-[320px] flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued" />
                <input
                  type="search"
                  placeholder="Search regions"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={adminListSearchInputClass}
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

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className={adminListTableHeadRowClass}>
                      <th className={`${adminListTableHeadClass} px-4 sm:px-5`}>Region</th>
                      <th className={`${adminListTableHeadClass} px-4 sm:px-5`}>Collecting</th>
                      <th className={`${adminListTableHeadClass} px-4 sm:px-5`}>Tax service</th>
                      <th className="w-10 px-2 sm:w-12" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {countriesLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center">
                          <div className="inline-flex flex-col items-center gap-2">
                            <div
                              className="h-7 w-7 animate-spin rounded-full border-2 border-admin-border border-t-admin-text"
                              aria-hidden
                            />
                            <span className="text-[13px] text-admin-text-secondary">Loading countries…</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedRegions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-[13px] text-admin-text-secondary">
                          India tax region is not available yet.
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
                          className="cursor-pointer border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover"
                        >
                          <td className="px-4 py-3.5 sm:px-5">
                            <div className="flex items-center gap-3">
                              <span className="text-xl leading-none" role="img" aria-hidden>
                                {region.flag}
                              </span>
                              <span className="text-[13px] font-semibold text-admin-text">{region.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 sm:px-5">
                            {region.collecting ? (
                              <span className="inline-flex rounded-md border border-admin-border bg-admin-fill px-2.5 py-1 text-[12px] font-medium text-admin-text">
                                {region.collecting}
                              </span>
                            ) : (
                              <span className="text-[13px] text-admin-text-subdued">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-[13px] text-admin-text-secondary sm:px-5">
                            {region.taxService}
                          </td>
                          <td className="px-2 py-3.5 text-admin-text-subdued">
                            <ChevronRightIcon className="h-5 w-5" aria-hidden />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[13px] font-semibold text-admin-text">Duties and import taxes</h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
                title="Collect duties at checkout to reduce surprise fees for international buyers."
                aria-label="About duties and import taxes"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Optional checkout collection for cross-border duties (fees may apply).
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-admin-text">
                  Collect duties and import taxes at checkout
                </p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
                  Prevent surprise fees for international customers at delivery • 0.5% transaction fee
                </p>
              </div>
              <button type="button" className={`${adminListSecondaryButtonClass} shrink-0`}>
                Set up
              </button>
            </div>

            <SettingsCallout
              variant="info"
              icon={<InformationCircleIcon className="h-5 w-5 text-admin-text-secondary" />}
              className="mt-4"
            >
              Ensure the carriers you use offer{' '}
              <button type="button" className={`${adminListFooterLinkClass} font-medium underline-offset-2`}>
                Delivered duty paid (DDP) shipping labels
              </button>
              .
            </SettingsCallout>

            <div className="mt-8 border-t border-admin-divider pt-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-semibold text-admin-text">Customs information</h3>
                <button
                  type="button"
                  className="rounded-lg p-2 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
                  aria-label="Customs options"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 rounded-xl border border-admin-border bg-admin-secondary p-4 sm:p-5">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">
                    Country of origin
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-admin-text">No default set</p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">
                    Harmonized System (HS) codes
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-admin-text">No physical products available</p>
                </div>
              </div>
            </div>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Global settings</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Defaults that apply across your catalog and checkout.
            </p>
          </div>
          <div className="divide-y divide-admin-divider px-5 py-1 sm:px-6">
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
                <p className="text-[13px] font-semibold text-admin-text">
                  Include sales tax in product price and shipping rate
                </p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
                  Assumes a 9% tax rate, adjusted to local rates in markets with{' '}
                  <button type="button" className={`${adminListFooterLinkClass} font-medium underline-offset-2`}>
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
                <p className="text-[13px] font-semibold text-admin-text">Charge sales tax on shipping</p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
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
                <p className="text-[13px] font-semibold text-admin-text">Charge VAT on digital goods</p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
                  Creates a collection of digital goods that will be{' '}
                  <button type="button" className={`${adminListFooterLinkClass} font-medium underline-offset-2`}>
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
